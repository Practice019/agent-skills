#!/usr/bin/env node
// DSH 单技能规范体检器（只读，不修改任何文件）
// 用法:
//   node <skills-root>/skill-audit/scripts/audit-skill.cjs                 # 体检全部顶层技能
//   node <skills-root>/skill-audit/scripts/audit-skill.cjs skill-a  技能b   # 只体检指定技能
// 退出码: 0 = 无 ERROR, 1 = 有 ERROR
//
// 与另两个扫描器的分工：
//   _shared/validate-skills.cjs          = 库级硬门禁（只看 SKILL.md 的 6 项，一票否决）
//   skill-audit/scripts/audit-library.cjs = 库级宽口径（扫全部 .md + 重复内容 + catalog 体量）
//   本脚本                                = 单技能纵深体检：frontmatter 残留项、description 双语、
//                                           专有运行时残留、引用精度、内部重复、嵌套注册性
//
// 本脚本用自身位置反推技能库根目录，技能库整体移动后仍可用。

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');           // scripts/ -> skill-audit/ -> skills root
const YAML_CANDIDATES = [
  'D:/npm-global/node_modules/@deepseek-ai/dsh/node_modules/yaml',
  'yaml',
];
let YAML = null;
for (const c of YAML_CANDIDATES) {
  try { YAML = require(c); break; } catch (e) { /* 继续找 */ }
}
if (!YAML) { console.error('[FATAL] 找不到 yaml 包，请修改 YAML_CANDIDATES'); process.exit(1); }

const LOCAL_USER = (process.env.USERNAME || process.env.USER || '').trim();
const MIN_DESC = 40;
const SKIP_DIRS = ['.git', 'node_modules', '_shared'];

// ---- 与库级扫描器保持同一套误报口径（改口径要三处同步）----
const NON_REPO = [
  /^DESIGN\.md$/i, /^tasks\//, /^SPEC\.md$/i, /^PRD/i, /^CLAUDE\.md$/i, /^AGENTS\.md$/i,
  /^design\.md$/i, /^\.hallmark/, /^work\//, /^\.codex/, /^\.claude/,
  /^src\//, /^tests\//, /^docs\//, /^package\.json$/, /^index\.html$/,
  /^agent-workspace\\/, /^\$/, /^\.\/logs\//, /^\.\/scratch\//,
  /var\/www\//, /^\/etc\//, /^\/tmp\//,
];
const PROSE_DOCS = /(^|\/)(CHANGELOG|CONTRIBUTING|README)\.md$/;
const BENIGN_TILDE = /(禁止|不要|不展开|反例|错误|警告|没有|无 `|规范|规则)/;
const READ_WORDS = /(read\b|读取|详见|参见|参考|查阅|加载)/i;

// 专有运行时残留：这些字符串出现在正文里，说明技能没有真正移植到 DSH
const FOREIGN_RUNTIME = [
  'OPENSQUILLA', '{baseDir}', '{{ with.', '{{ outputs.', '{{ inputs.',
  'skill_exec', 'publish_artifact', 'MIMO_PYTHON', 'MIMO_SOFFICE', 'MIMO_NODE',
];
// 上游 frontmatter 键：DSH 不识别，留着通常意味着搬运未清理
const FOREIGN_KEYS = ['entrypoint', 'assemble', 'description_zh', 'triggers', 'homepage', 'always', 'provenance'];

function collectArtifacts(lines) {
  const set = new Set();
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
    if (inFence && /[├└│]/.test(line)) {
      for (const m of line.matchAll(/([A-Za-z0-9_.\-]+\.(?:md|tsv|json|ya?ml|log|txt|py)|[A-Za-z0-9_.\-]+\/)/g)) {
        set.add(m[1].replace(/\/$/, ''));
      }
    }
    if (/(deliverable|artifact|产物|输出|生成|\boutput\b(?!\.\w)|\bgenerated\b)/i.test(line)) {
      for (const m of line.matchAll(/`([^`]+)`/g)) set.add(path.basename(m[1].trim().replace(/\/$/, '')));
    }
    for (const m of line.matchAll(/(?:write|create|save|keep|generate|log|emit|记录|保存|写入|生成)\s+(?:a\s+|the\s+)?`([^`]+)`/gi)) {
      const t = m[1].trim();
      if (/\.(md|tsv|json|ya?ml|log|txt|csv|html)$/i.test(t) && !t.includes('://')) set.add(path.basename(t.replace(/\/$/, '')));
    }
  }
  return set;
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const topSkills = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(e => e.isDirectory() && !SKIP_DIRS.includes(e.name))
  .map(e => e.name)
  .sort();

const requested = process.argv.slice(2).filter(a => !a.startsWith('-'));
const targets = requested.length ? requested : topSkills;
const unknown = requested.filter(n => !topSkills.includes(n));
if (unknown.length) {
  console.error('[FATAL] 不是顶层技能目录: ' + unknown.join(', '));
  process.exit(1);
}

let failCount = 0, warnCount = 0;
const summary = [];

for (const name of targets) {
  const dir = path.join(ROOT, name);
  const skillPath = path.join(dir, 'SKILL.md');
  const errors = [], warns = [], infos = [];

  if (!fs.existsSync(skillPath)) {
    console.log(`[FAIL] ${name}\n       - SKILL.md 缺失（DSH 不会注册）`);
    failCount++; summary.push({ name, status: 'FAIL' });
    continue;
  }

  const raw = fs.readFileSync(skillPath, 'utf8');
  const lines = raw.split('\n');
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');

  // ---- 1. frontmatter ----
  let fm = null;
  if (end < 0) errors.push('frontmatter 缺失');
  else {
    try { fm = YAML.parse(lines.slice(1, end).join('\n')); }
    catch (e) { errors.push('YAML 解析失败: ' + e.message.split('\n')[0]); }
  }
  if (fm) {
    if (!fm.name) errors.push('缺 name');
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fm.name)) errors.push('name 非 kebab-case: ' + fm.name);
    else if (fm.name !== name) errors.push(`name(${fm.name}) 与目录名(${name}) 不一致`);

    if (!fm.description) errors.push('缺 description');
    else {
      const desc = String(fm.description);
      const cn = (desc.match(/[\u4e00-\u9fff]/g) || []).length;
      const en = (desc.match(/[A-Za-z]/g) || []).length;
      if (desc.length < MIN_DESC) warns.push(`description 过短(${desc.length} < ${MIN_DESC})`);
      if (cn < 5) warns.push('description 缺中文半句（库规范要求中英双语）');
      if (en < 20) warns.push('description 缺英文半句（库规范要求中英双语）');
      infos.push(`description ${desc.length} 字符（中文 ${cn} / 英文 ${en}）`);
    }

    for (const k of FOREIGN_KEYS) {
      if (k in fm) warns.push(`上游/专有 frontmatter 键残留: ${k}（DSH 不识别，搬运未清理）`);
    }
    if (fm.metadata && fm.metadata.opensquilla) warns.push('metadata.opensquilla 残留');
    if (fm['user-invocable'] === false && fm['disable-model-invocation'] === true) {
      warns.push('user-invocable:false + disable-model-invocation:true —— DSH 下等于不可调用');
    }
  }

  // ---- 2. 行尾 / 机器路径 / ~ 路径 / 引用精度 ----
  if (raw.includes('\r\n')) errors.push('SKILL.md 含 CRLF（会破坏 YAML frontmatter）');

  const body = end > 0 ? lines.slice(end + 1) : lines;
  const ARTIFACTS = collectArtifacts(lines);
  const bases = [dir];
  let inFence = false;

  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) { inFence = !inFence; return; }
    const where = `line ${i + 1}`;

    if (LOCAL_USER) {
      const re = new RegExp('C:\\\\Users\\\\' + LOCAL_USER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      if (re.test(line)) errors.push(`${where}: 本机用户名绝对路径（改用 $env:USERPROFILE）`);
    }
    if (/read\s+~\/|读取\s*`~\//.test(line)) {
      if (BENIGN_TILDE.test(line)) infos.push(`${where}: 规则说明里的 ~/ 反例（跳过）`);
      else errors.push(`${where}: read ~/ 路径（read 不展开 ~）`);
    }

    // 显式相对引用
    for (const m of line.matchAll(/`((?:\.\.?\/)[^`]+)`/g)) {
      const tok = m[1].trim();
      if (/[<>*|\s]/.test(tok)) continue;
      if (!/\.(md|json|ps1|sh|js|cjs|py|txt|ya?ml|html|css)$/i.test(tok) && !tok.endsWith('/')) continue;
      if (NON_REPO.some(x => x.test(tok))) continue;
      if (fs.existsSync(path.resolve(dir, tok))) continue;
      if (inFence) infos.push(`${where}: 代码块内的模板/示例引用（跳过） -> ${tok}`);
      else errors.push(`${where}: 相对引用不存在 -> ${tok}`);
    }

    // 裸文件名读引用
    if (!inFence && READ_WORDS.test(line)) {
      for (const m of line.matchAll(/`([^`/\\]+\.(?:md|json|ps1|sh|js|cjs|py|ya?ml))`/gi)) {
        const tok = m[1].trim();
        if (/^\.(?!\.?\/)/.test(tok)) continue;
        if (ARTIFACTS.has(path.basename(tok.replace(/\/$/, '')))) continue;
        if (NON_REPO.some(x => x.test(tok))) continue;
        if (bases.some(b => fs.existsSync(path.resolve(b, tok)))) continue;
        errors.push(`${where}: 裸文件名读引用不存在 -> ${tok}（补全为相对路径）`);
      }
    }
  });

  // ---- 3. 正文里的专有运行时残留（frontmatter provenance 与 URL 行除外）----
  // 已知误报：DSH 环境说明里会「引用」旧运行时的名字来解释替换，属说明性文字 → INFO
  const NOTE_MARKER = /(DSH environment note|DSH 环境说明|original text|原文本|已替换|替换为|说明)/i;
  const bodyText = body.filter(l => !/https?:\/\//i.test(l)).join('\n');
  for (const token of FOREIGN_RUNTIME) {
    if (!bodyText.includes(token)) continue;
    const hits = bodyText.split('\n').filter(l => l.includes(token));
    const explanatory = hits.every(l => NOTE_MARKER.test(l));
    const detail = `${token} :: ${hits[0].trim().slice(0, 100)}`;
    if (explanatory) infos.push(`正文引用旧运行时名（说明性文字，跳过）: ${detail}`);
    else warns.push(`正文含专有运行时残留 ${detail}`);
  }

  // ---- 4. 全目录：CRLF / 机器路径 / 内部重复 / 嵌套 SKILL.md ----
  // CRLF 只查 .md：`core.autocrlf=true` 下 .ps1/.py 的工作副本本就是 CRLF，
  // 而仓库 blob 是 LF（用 `git ls-files --eol <path>` 可核对 i/lf w/crlf），
  // 对非 .md 报 CRLF 纯属噪声。
  const files = walk(dir);
  let crlf = 0, machine = 0, nested = 0;
  const byHash = new Map();
  for (const f of files) {
    const rel = path.relative(dir, f).replace(/\\/g, '/');
    const base = path.basename(f);
    if (base === 'SKILL.md' && rel !== 'SKILL.md') nested++;
    if (!/\.(md|txt|py|ps1|sh|json|ya?ml|css|html)$/i.test(f)) continue;
    const t = fs.readFileSync(f, 'utf8');
    if (base.endsWith('.md') && base !== 'SKILL.md' && !/^tool-index\.md$/i.test(base) && t.includes('\r\n')) crlf++;
    if (LOCAL_USER) {
      const re = new RegExp('C:\\\\Users\\\\' + LOCAL_USER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      if (re.test(t)) machine++;
    }
    if (['SKILL.md', 'README.md', 'LICENSE', 'CHANGELOG.md'].includes(base)) continue;
    if (/^tool-index\.(md|json)$/i.test(base)) continue;
    const h = crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');
    if (!byHash.has(h)) byHash.set(h, []);
    byHash.get(h).push(rel);
  }
  if (crlf) warns.push(`内容 .md 含 CRLF x${crlf}（建议转 LF）`);
  if (machine) errors.push(`内容文件含本机用户名路径 x${machine}`);
  for (const [, group] of byHash) {
    if (group.length > 1) warns.push('技能内内容完全相同的副本: ' + group.join(' | '));
  }
  if (nested) infos.push(`嵌套 SKILL.md x${nested}（DSH 只扫一层，不会注册；作为资源引用是有意的）`);

  // ---- 输出 ----
  const kb = (files.reduce((a, f) => a + fs.statSync(f).size, 0) / 1024).toFixed(1);
  const status = errors.length ? 'FAIL' : (warns.length ? 'WARN' : 'PASS');
  console.log(`[${status}] ${name}  files=${files.length}  ${kb} KB  SKILL.md=${lines.length} 行`);
  infos.forEach(x => console.log('       · ' + x));
  warns.forEach(x => console.log('       ! ' + x));
  errors.forEach(x => console.log('       - ' + x));
  if (errors.length) failCount++;
  else if (warns.length) warnCount++;
  summary.push({ name, status });
}

const passCount = summary.filter(s => s.status === 'PASS').length;
console.log('\n=== 单技能规范体检汇总 ===');
console.log(`体检=${summary.length}  PASS=${passCount}  WARN=${warnCount}  FAIL=${failCount}`);
const listBy = st => summary.filter(s => s.status === st).map(s => s.name).join(', ');
if (warnCount) console.log('WARN: ' + listBy('WARN'));
if (failCount) console.log('FAIL: ' + listBy('FAIL'));
process.exit(failCount === 0 ? 0 : 1);
