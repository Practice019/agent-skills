// 三个扫描器共用的误报口径与键名清单。
// 库规要求「改口径要三处同步」——与其靠人记住同步，不如让三处都 require 这一份。
// 位置：_shared/audit-constants.cjs（脚本用自身位置反推技能库根目录后引用）。

// 指向**用户项目**而非本技能库的文件：引用它们不算断链
const NON_REPO = [
  /^DESIGN\.md$/i,                 // 用户项目的设计契约
  /^tasks\//,                      // 用户项目的计划/待办
  /^SPEC\.md$/i, /^PRD/i,
  /^CLAUDE\.md$/i, /^AGENTS\.md$/i,
  /^design\.md$/i,
  /^\.hallmark/, /^work\//, /^\.codex/, /^\.claude/,
  /^src\//, /^tests\//, /^docs\//,
  /^package\.json$/, /^index\.html$/,
  /^agent-workspace\\/,            // 运行时工作区
  /^\$/,                           // $FC 等变量占位
  /^\.\/logs\//, /^\.\/scratch\//, // 运行时目录 / 带变量模板
  /var\/www\//, /^\/etc\//, /^\/tmp\//, // 攻击载荷里的靶机路径
];

// 规则说明里出现 `read ~/` 是在讲「禁止这样写」，不是真缺陷
const BENIGN_TILDE = /(禁止|不要|不展开|反例|错误|警告|没有|无 `|规范|规则)/;

// 只可能出现在 frontmatter 顶层、不会作为普通英文散文出现在 description 里的键名。
// 命中即说明 description 标量把后面的顶层键吞了（见 audit-skill.cjs 的「1b」）。
const SWALLOWABLE_KEYS = [
  'license', 'version', 'platforms', 'allowed-tools', 'argument-hint', 'model',
  'hooks', 'metadata', 'author', 'homepage', 'repository', 'category',
  'when_to_use', 'disable-model-invocation', 'user-invocable', 'provenance',
];

// 说明性文档：里面的路径是描述性文字，不是真实引用
const PROSE_DOCS = /(^|\/)(CHANGELOG|CONTRIBUTING|README)\.md$/;

// 读引用的引导词
const READ_WORDS = /(read\b|读取|详见|参见|参考|查阅|加载)/i;

module.exports = { NON_REPO, BENIGN_TILDE, SWALLOWABLE_KEYS, PROSE_DOCS, READ_WORDS };
