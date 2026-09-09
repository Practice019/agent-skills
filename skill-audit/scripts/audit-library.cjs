#!/usr/bin/env node
// DSH 技能库宽口径审计器
// 用法: node <skills-root>/skill-audit/scripts/audit-library.cjs
// 退出码: 0 = 无 ERROR, 1 = 有 ERROR
//
// 与 _shared/validate-skills.cjs 的分工：
//   validate-skills.cjs = 硬门禁（只看 SKILL.md 的 6 项）
//   本脚本            = 宽口径（扫全部 .md：CRLF / 引用 / 机器路径 / 重复内容 / description 质量），
//                       并把已知误报自动归类到 INFO，避免误报淹没真缺陷

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');          // scripts/ -> skill-audit/ -> skills root
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

// 非仓库引用：技能让 agent 去读用户项目 / 运行时 / 靶机里的东西
const NON_REPO = [
  /^DESIGN\.md$/i, /^tasks\//, /^SPEC\.md$/i, /^PRD/i, /^CLAUDE\.md$/i, /^AGENTS\.md$/i,
  /^design\.md$/i, /^\.hallmark/, /^work\//, /^\.codex/, /^\.claude/,
  /^src\//, /^tests\//, /^docs\//, /^package\.json$/, /^index\.html$/,
  /^agent-workspace\\/, /^\$/, /^\.\/logs\//, /^\.\/scratch\//,
  /var\/www\//, /^\/etc\//, /^\/tmp\//,
];
// 变更说明 / 模板文档：引用是描述性的
const PROSE_DOCS = /(^|\/)(CHANGELOG|CONTRIBUTING|README)\.md$/;
// 规则说明里的 ~/ 反例
const BENIGN_TILDE = /(禁止|不要|不展开|反例|错误|警告|没有|无 `|规范|规则)/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const all = walk(ROOT);
const mds = all.filter(p => p.endsWith('.md'));
const skills = all.filter(p => path.basename(p) === 'SKILL.md');
const rel = p => path.relative(ROOT, p).replace(/\\/g, '/');
const md5 = p => crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');

const READ_WORDS = /(read\b|读取|详见|参见|参考|查阅|加载)/i;
const TOP_SKILLS = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(e => e.isDirectory() && !['.git', '_shared', 'node_modules'].includes(e.name))
  .map(e => path.join(ROOT, e.name));
const packRootOf = f => TOP_SKILLS.find(t => f.startsWith(t + path.sep)) || path.dirname(f);

// 本文件声明的「运行期产物」文件名：树状清单行、Deliverables/输出目录行。
// 这些是技能让 agent 去创建的文件，不是库内引用。
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
    if (/(deliverable|artifact|产物|输出|\boutput\b(?!\.\w))/i.test(line)) {
      for (const m of line.matchAll(/`([^`]+)`/g)) set.add(path.basename(m[1].trim().replace(/\/$/, '')));
    }
    // 创建动词紧邻的路径：write/keep a `X.md` —— X 是 agent 要产出的文件
    for (const m of line.matchAll(/(?:write|create|save|keep|generate|log|emit|记录|保存|写入|生成)\s+(?:a\s+|the\s+)?`([^`]+)`/gi)) {
      const t = m[1].trim();
      if (/\.(md|tsv|json|ya?ml|log|txt|csv|html)$/i.test(t) && !t.includes('://')) set.add(path.basename(t.replace(/\/$/, '')));
    }
  }
  return set;
}

const errors = [], warns = [], infos = [];
const E = m => errors.push(m), W = m => warns.push(m), I = m => infos.push(m);

// ---------- 1. SKILL.md：frontmatter / name / description / CRLF ----------
const seenNames = new Map();
const descLens = [];
for (const f of skills) {
  const r = rel(f);
  const raw = fs.readFileSync(f, 'utf8');
  if (raw.includes('\r\n')) E('CRLF 行尾（会破坏 YAML frontmatter）: ' + r);
  const lines = raw.split('\n');
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end < 0) { E('frontmatter 缺失: ' + r); continue; }
  let d;
  try { d = YAML.parse(lines.slice(1, end).join('\n')); }
  catch (e) { E('YAML 解析失败: ' + r + ' — ' + e.message.split('\n')[0]); continue; }
  if (!d || !d.name) { E('name 缺失: ' + r); continue; }
  if (!d.description) E('description 缺失: ' + r);
  else {
    descLens.push({ r, len: d.description.length });
    if (d.description.length < MIN_DESC) W('description 过短(' + d.description.length + ' < ' + MIN_DESC + '): ' + r);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.name)) E('name 非 kebab-case: ' + r + ' name=' + d.name);
  const dirName = path.basename(path.dirname(f));
  if (d.name !== dirName) E('name 与目录名不一致: ' + r + ' name=' + d.name + ' dir=' + dirName);
  if (seenNames.has(d.name)) E('技能名重复: ' + d.name + ' (' + seenNames.get(d.name) + ' 与 ' + r + ')');
  else seenNames.set(d.name, r);
}

// ---------- 2. 全库 .md：CRLF / 机器路径 / read ~/ / 引用可解析 ----------
let refTotal = 0;
for (const f of mds) {
  const r = rel(f);
  const raw = fs.readFileSync(f, 'utf8');
  const isSkill = path.basename(f) === 'SKILL.md';
  const isGenerated = /(^|\/)tool-index\.md$/.test(r);
  if (raw.includes('\r\n') && !isSkill && !isGenerated) W('CRLF 行尾（内容文件，建议 LF）: ' + r);

  const lines = raw.split('\n');
  const ARTIFACTS = collectArtifacts(lines);
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) { inFence = !inFence; return; }
    const where = r + ':' + (i + 1);

    if (LOCAL_USER) {
      const re = new RegExp('C:\\\\Users\\\\' + LOCAL_USER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      if (re.test(line)) E('本机用户名路径（应为 $env:USERPROFILE）: ' + where);
    }
    if (/read\s+~\/|读取\s*`~\//.test(line)) {
      if (BENIGN_TILDE.test(line)) I('规则说明里的 ~/ 反例（跳过）: ' + where);
      else E('read ~/ 路径（read 不展开 ~）: ' + where);
    }
    for (const m of line.matchAll(/`((?:\.\.?\/)[^`]+)`/g)) {
      const tok = m[1].trim();
      if (/[<>*|\s]/.test(tok)) continue;
      if (!/\.(md|json|ps1|sh|js|cjs|py|txt|yaml|yml|html|css)$/i.test(tok) && !tok.endsWith('/')) continue;
      if (NON_REPO.some(x => x.test(tok))) continue;
      refTotal++;
      if (fs.existsSync(path.resolve(path.dirname(f), tok))) continue;
      if (inFence) { I('代码块内的模板/示例引用（跳过）: ' + where + ' -> ' + tok); continue; }
      if (PROSE_DOCS.test(r)) { I('说明文档里的描述性引用（跳过）: ' + where + ' -> ' + tok); continue; }
      E('引用不存在: ' + where + ' -> ' + tok);
    }

    // 2d. 裸文件名读引用（无 ./ 前缀）：只在「让 agent 去读」的行上检查，两级基准
    if (!inFence && !PROSE_DOCS.test(r) && READ_WORDS.test(line)) {
      for (const m of line.matchAll(/`([^`/\\]+\.(?:md|json|ps1|sh|js|cjs|py|ya?ml))`/gi)) {
        const tok = m[1].trim();
        if (ARTIFACTS.has(path.basename(tok.replace(/\/$/, '')))) continue;
        if (NON_REPO.some(x => x.test(tok))) continue;
        const bases = [...new Set([path.dirname(f), packRootOf(f)])];
        refTotal++;
        if (!bases.some(b => fs.existsSync(path.resolve(b, tok)))) {
          E('读引用不存在（裸文件名）: ' + where + ' -> ' + tok);
        }
      }
    }
  });
}

// ---------- 3. 重复内容检测（按 md5，同名不同内容不算重复） ----------
const SKIP_DUP = ['SKILL.md', 'README.md', 'LICENSE', 'CHANGELOG.md', 'tool-index.md'];
const byHash = new Map(), byName = new Map();
for (const f of all) {
  const n = path.basename(f);
  if (!/\.(md|json|ps1|sh|js|cjs|py)$/i.test(n)) continue;
  if (SKIP_DUP.includes(n)) continue;
  const h = md5(f);
  if (!byHash.has(h)) byHash.set(h, { size: fs.statSync(f).size, paths: [] });
  byHash.get(h).paths.push(rel(f));
  if (!byName.has(n)) byName.set(n, []);
  byName.get(n).push(f);
}
let waste = 0, dupGroups = 0;
for (const [, g] of byHash) {
  if (g.paths.length < 2) continue;
  dupGroups++;
  const w = g.size * (g.paths.length - 1);
  waste += w;
  W('内容完全相同的副本 x' + g.paths.length + '（' + g.size + 'B，浪费 ' + w + 'B）: ' + g.paths.join(' | '));
}
for (const [n, v] of byName) {
  if (v.length < 2) continue;
  const hs = new Set(v.map(md5));
  if (hs.size === v.length) I('同名不同内容（通常是有意区分，非重复）: ' + n + ' x' + v.length);
}

// ---------- 输出 ----------
const out = (title, arr) => {
  if (!arr.length) return;
  console.log('\n' + title + ' (' + arr.length + ')');
  arr.slice(0, 40).forEach(x => console.log('  - ' + x));
  if (arr.length > 40) console.log('  ... +' + (arr.length - 40));
};
console.log('=== 技能库审计 ===');
console.log('root=' + ROOT);
console.log('files=' + all.length + '  .md=' + mds.length + '  SKILL.md=' + skills.length +
  '  顶层技能=' + fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(e => e.isDirectory() && !['.git', '_shared', 'node_modules'].includes(e.name)).length);
console.log('引用检查=' + refTotal + '  唯一技能名=' + seenNames.size +
  '  description 最短=' + (descLens.length ? Math.min(...descLens.map(x => x.len)) : 'n/a') +
  '  完全重复组=' + dupGroups + '（浪费 ' + waste + 'B）');
out('[ERROR] 必须修复', errors);
out('[WARN] 建议修复', warns);
out('[INFO] 已自动归类为误报/跳过', infos);
console.log('\n结果: ERROR=' + errors.length + '  WARN=' + warns.length + '  INFO=' + infos.length);
process.exit(errors.length === 0 ? 0 : 1);
