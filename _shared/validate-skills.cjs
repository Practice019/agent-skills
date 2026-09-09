#!/usr/bin/env node
// DSH 技能库校验器（只读，不修改任何文件）
// 用法: node C:\Users\21877\.dsh\skills\_shared\validate-skills.cjs
//
// 检查项：
//   1. frontmatter 可解析
//   2. name 为 kebab-case 且与目录名一致
//   3. 无 CRLF 行尾
//   4. 「指示 agent 去读」的仓库内引用可解析
//   5. 无 read ~/ 路径
//   6. 无机器相关绝对路径
//
// 退出码: 0 = 全部通过, 1 = 有失败

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const YAML = require('D:/npm-global/node_modules/@deepseek-ai/dsh/node_modules/yaml');
const LOCAL_USER = (process.env.USERNAME || process.env.USER || '').trim();

// 收集本文件声明的「运行期产物」文件名：树状清单行、Deliverables/输出目录行。
// 这些是技能让 agent 去创建的文件，不是库内引用，不该按断链报错。
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
    // 创建动词紧邻的路径：write/keep a `X.md` —— X 是 agent 要产出的文件
    for (const m of line.matchAll(/(?:write|create|save|keep|generate|log|emit|记录|保存|写入|生成)\s+(?:a\s+|the\s+)?`([^`]+)`/gi)) {
      const t = m[1].trim();
      if (/\.(md|tsv|json|ya?ml|log|txt|csv|html)$/i.test(t) && !t.includes('://')) set.add(path.basename(t.replace(/\/$/, '')));
    }
  }
  return set;
}

// 非仓库引用：技能指示 agent 去读「用户项目」或「运行时」里的东西，仓库内本就不存在
const NON_REPO = [
  /^DESIGN\.md$/i,              // 用户项目的设计契约
  /^tasks\//,                    // 用户项目的计划/待办
  /^SPEC\.md$/i, /^PRD/i,
  /^CLAUDE\.md$/i, /^AGENTS\.md$/i,
  /^design\.md$/i,
  /^\.hallmark/, /^work\//, /^\.codex/, /^\.claude/,
  /^src\//, /^tests\//, /^docs\//,
  /^package\.json$/, /^index\.html$/,
  /^agent-workspace\\/,          // 运行时工作区
  /^\$/,                          // $FC 等变量占位
];

const READ_WORDS = /(read\b|读取|详见|参见|参考|查阅|见\s*`|加载)/i;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules' || e.name === '_shared') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === 'SKILL.md') out.push(p);
  }
  return out;
}

const topSkills = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(e => e.isDirectory() && !['.git', '_shared', 'node_modules'].includes(e.name))
  .map(e => path.join(ROOT, e.name));

const packRootOf = file => topSkills.find(t => file.startsWith(t + path.sep)) || path.dirname(file);

const files = walk(ROOT);
const results = [];

for (const file of files) {
  const dir = path.dirname(file);
  const dirName = path.basename(dir);
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const raw = fs.readFileSync(file, 'utf8');
  const problems = [];

  // 1 + 2: frontmatter
  const lines = raw.split('\n');
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end < 0) problems.push('frontmatter 缺失');
  else {
    try {
      const data = YAML.parse(lines.slice(1, end).join('\n'));
      if (!data || !data.name || !data.description) problems.push('frontmatter 缺少 name/description');
      else {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.name)) problems.push('name 非 kebab-case: ' + data.name);
        if (data.name !== dirName) problems.push(`name(${data.name}) 与目录名(${dirName}) 不一致`);
      }
    } catch (e) {
      problems.push('YAML 解析失败: ' + e.message.split('\n')[0]);
    }
  }

  // 3: CRLF
  if (raw.includes('\r\n')) problems.push('CRLF 行尾');

  // 5 + 6: 坏路径
  // 规则说明/反例里的 ~/ 不是缺陷（如「禁止 read ~/…」）
  const BENIGN_TILDE = /(禁止|不要|不展开|反例|错误|警告|没有|无 `|规范|规则)/;
  lines.forEach((line, i) => {
    if (/read\s+~\/|读取\s*`~\//.test(line) && !BENIGN_TILDE.test(line)) {
      problems.push(`line ${i + 1}: read ~/ 路径`);
    }
    // 只查本机真实用户名；靶机路径（C:\Users\Public、C:\Users\user 等）不算缺陷
    if (LOCAL_USER) {
      const re = new RegExp('C:\\\\Users\\\\' + LOCAL_USER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      if (re.test(line)) problems.push(`line ${i + 1}: 本机用户名绝对路径`);
    }
    // 个人项目路径：不涉及读取时视为「本机配置」放行；一旦是读取引用就报错
    if (/D:\\project_GIT/i.test(line) && READ_WORDS.test(line)) {
      problems.push(`line ${i + 1}: 读引用使用了机器相关绝对路径`);
    }
  });

  // 4: 读引用可解析（两级基准：技能目录 → 包根）
  const bases = [...new Set([dir, packRootOf(file)])];
  const ARTIFACTS = collectArtifacts(lines);
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) { inFence = !inFence; return; }
    if (inFence) return;
    if (!READ_WORDS.test(line)) return;
    for (const m of line.matchAll(/`([^`]+)`/g)) {
      const tok = m[1].trim();
      if (!tok || tok.startsWith('/')) continue;
      if (/^\.(?!\.?\/)/.test(tok)) continue; // 点号配置文件（.app.json 等），非仓库文件
      if (!tok.startsWith('.') && ARTIFACTS.has(path.basename(tok.replace(/\/$/, '')))) continue;
      if (/[<>*|\s:]/.test(tok)) continue;
      if (/^https?:/i.test(tok)) continue;
      if (/^[a-z0-9-]+(\.[a-z0-9-]+)+\//i.test(tok)) continue; // 域名后的 URL 路径，如 arxiv.org/abs/2601.02780
      if (tok.startsWith('~')) continue;
      const looksPath = tok.includes('/') || /\.(md|ps1|sh|json|mjs|js|cjs|py|txt|yaml|yml)$/i.test(tok);
      if (!looksPath) continue;
      if (NON_REPO.some(re => re.test(tok))) continue;
      if (!bases.some(b => fs.existsSync(path.resolve(b, tok)))) {
        problems.push(`line ${i + 1}: 引用不存在 -> ${tok}`);
      }
    }
  });

  results.push({ rel, problems });
}

let failed = 0;
for (const r of results) {
  if (r.problems.length) {
    failed++;
    console.log('[FAIL] ' + r.rel);
    r.problems.forEach(p => console.log('       - ' + p));
  }
}
console.log('');
console.log(`scanned=${results.length}  passed=${results.length - failed}  failed=${failed}`);
process.exit(failed === 0 ? 0 : 1);
