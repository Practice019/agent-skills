---
name: push-project
description: "把本地 DSH 插件/项目发布到 npm 和 GitHub：⚠️ 使用前必须先询问用户发布目标（npm+GitHub / 只发 npm / 只发 GitHub），再走对应流程；含发布前检查清单、npm 账号与 automation token 引导（免 2FA 输码）、版本号与 tag、GitHub Release 与 topics（dsh-plugin 市场收录）、一键自动化发版。当用户要发布项目到 npm/GitHub 时使用。 Publish a local DSH plugin/project to npm and GitHub: pre-publish checklist, npm account and automation-token setup (no 2FA code prompt), version and tag, GitHub Release and topics (dsh-plugin marketplace listing), and one-command automated release. Use when the user wants to publish a project to npm/GitHub. Always confirm the publish target (npm+GitHub / npm only / GitHub only) before starting."
whenToUse: "用户要求发布项目到 npm、发布到 GitHub、打 tag、建 Release、加 topics、配置自动化发布或处理发布报错时使用。⚠️ 进入本技能后第一步必须先确认发布目标是 npm、GitHub 还是两者都要。"
user-invocable: true
disable-model-invocation: false
---

# 项目发布到 npm 与 GitHub

## 目标与边界

**做**：
- ⚠️ **动手前先问用户发布目标**：npm + GitHub 都发 / 只发 npm / 只发 GitHub，然后只执行对应章节
- 发布前检查（包内容、元数据、schema、机器信息）
- 引导 npm 登录与 automation token 生成，实现免 OTP 自动化发布
- 版本号管理、git tag、GitHub Release、仓库 topics
- 把发布流程固化为脚本，实现一键发版

**不做**：
- ❌ 不替代插件开发（`dsh-plugin-development`）
- ❌ 不负责编写插件业务代码
- ❌ 不代替用户输入 npm/GitHub 账号密码或 token（引导用户操作）

## 工作流程

### 0. 确认发布目标（⚠️ 强制第一步，先问再动手）

**进入本技能后，先不要执行任何写操作**（`npm publish` / `git push` / `gh repo create` / 改版本号 / 建 Release / 加 topics），必须先向用户确认发布目标。

用 `ask_user_question` 提问（单选）：

| 选项 | 含义 |
|---|---|
| **npm 和 GitHub 都发**（推荐） | 完整流程：npm 发布 + GitHub 推送 + tag + Release + topics |
| **只发 npm** | 只走 npm 相关章节，完全不碰 GitHub |
| **只发 GitHub** | 只走 GitHub 相关章节，完全不碰 npm publish |

按选择执行对应章节：

| 用户选择 | 执行章节 | 跳过章节 |
|---|---|---|
| npm + GitHub 都发 | 1 → 2 → 3 → 4 → 5 → 6 | — |
| 只发 npm | 1 → 2 → 3 → 6 | 5（GitHub 全部动作） |
| 只发 GitHub | 1 → 5 → 6 | 2、3、4（npm 登录 / publish / npm 版本发布） |

补充规则：

- 用户已经明确说了"只推 GitHub"或"只推 npm"时视为已确认，不必重复提问，但**仍然只执行对应章节**。
- 用户说"push 到 GitHub"**不等于**可以顺手 `npm publish`；未确认的另一侧一律不动。
- 只发 GitHub 时，若需要版本号，`npm version patch` 仍然可用（它只改 package.json + commit + 打 tag，不发布 npm），但要先征得用户同意改版本号。
- 只发 npm 时，不建 Release、不改 topics、不建仓库。
- 确认结果写进本次执行的第一条回复里（例如"发布目标：只推 GitHub"），后续步骤严格按该目标执行。
- 用户的表述含糊（如"帮我发布一下"）时**必须提问**，不要自行假定两边都发。

### 1. 环境诊断（先做，避免发布时踩网络/认证坑）

```bash
npm config get registry          # 国内镜像（npmmirror）会导致登录/发布失败
npm whoami                       # 是否已登录（显示用户名=已登录）
```

- 若 registry 是 `https://registry.npmmirror.com`：要么把 `.npmrc` 的 registry 改为
  `https://registry.npmjs.org/`，要么所有命令加 `--registry=https://registry.npmjs.org/`。
- GitHub 操作（gh CLI）在国内常超时：先设代理环境变量再跑
  `gh` 命令（Clash 等常见端口 7890）：

```bash
$env:HTTPS_PROXY = "http://127.0.0.1:7890"
$env:HTTP_PROXY  = "http://127.0.0.1:7890"
```

### 2. 发布前检查清单（每一项都过一遍）

| 检查项 | 要求 |
|---|---|
| package.json | `name`（npm 唯一）、`version`、`license`、`description`、`keywords`、`exports`、`files` 白名单、`dsh.bundle.patch` + `dsh.client`（DSH 插件） |
| README.md | 存在、含安装方式；建议顶部加 shields.io 徽章（npm version / license / release） |
| LICENSE | 存在（npm 自动打包） |
| .gitignore | 排除 node_modules/、*.tgz、.claude/ 等 |
| 机器信息 | 无真实用户名/绝对路径残留（grep 用户名、`C:\Users\<name>`） |
| dsh 包 import | ⚠️ 发布 npm 的插件**不要** `import '@deepseek-ai/dsh-tools'`（他人环境解析不可靠）→ 用原生 raw 工具定义 + 标准 JSON Schema |
| JSON Schema | ⚠️ `required` 只能用在**对象级别**（数组形式）；字符串属性上 `required: true` 会被 dsh-tools 严格校验拒绝 |
| 包内容 | `npm pack --dry-run` 确认文件清单正确 |

### 3. npm 账号与 token 引导（关键：免 OTP 自动化）

> 仅当发布目标包含 npm 时执行本节；只发 GitHub 时整节跳过。

1. 未注册：浏览器打开 `https://www.npmjs.com/signup`（⚠️ 注意是官方站，不是 CNPM，CNPM 不支持公开注册）。
2. 终端登录（用官方源）：

```bash
npm login --registry=https://registry.npmjs.org/
npm whoami          # 显示用户名 = 成功
```

3. **2FA 处理（npm 强制发布者开 2FA，不要关闭）**：生成 Automation token 免每次输码——
   - 浏览器打开 `https://www.npmjs.com/settings/<用户名>/tokens`
   - Generate New Token → 类型选 **Automation**（不要选 Granular）
   - 复制 `npm_...` 完整 token（只显示一次，勿截断勿带空格）
   - 写入配置：

```bash
npm config set //registry.npmjs.org/:_authToken=npm_你的token
npm whoami          # 验证仍显示用户名
```

### 4. 发布 npm

> 仅当发布目标包含 npm 时执行本节；只发 GitHub 时整节跳过。

```bash
cd <项目目录>
npm version patch    # patch/minor/major：自动改版本号 + git commit + 打 tag vX.Y.Z
npm publish          # automation token 免 OTP；会提示 processing，索引几分钟后生效
npm view <包名> version   # 验证（注意传播延迟，必要时等 1-3 分钟再查）
```

### 5. 发布 GitHub

> 仅当发布目标包含 GitHub 时执行本节；只发 npm 时整节跳过。

```bash
# 已有 git 仓库：提交并推送
git add -A && git commit -m "..." && git push origin master

# 无远程仓库（首次）：先建 GitHub 仓库
gh repo create <owner>/<repo> --public --source=. --push

# 推送版本 tag（npm version 已自动打本地 tag）
git push origin master --tags

# 建 GitHub Release（tag 已存在时直接复用）
gh release create v1.0.1 --repo <owner>/<repo> --title "<name> v1.0.1" --notes "变更说明"

# 加 Topics（⚠️ 曝光关键：DSH 市场按 dsh-plugin topic 收录）
# ⚠️ 标签必须结合项目实际：先读 README / 依赖清单，只打与项目技术栈和用途相关的标签。
#    DSH 生态标签（dsh-plugin / deepseek-harness / dsh / cordis）只在项目确实是 DSH 插件、
#    集成或技能库时才打；普通项目（如 Python/CrewAI 情书生成器）绝不硬贴 DSH 标签，
#    按其真实技术栈打（python / crewai / smtp / multi-agent 等）。
gh repo edit <owner>/<repo> --add-topic dsh-plugin --add-topic deepseek-harness --add-topic cordis --add-topic plugin
```

### 6. 一键自动化（发布流程固化）

新建 `scripts/release.mjs`（或 .ps1），串起发布动作——**按第 0 步确认的目标裁剪**：

```bash
# 目标：npm + GitHub 都发
npm version patch && npm publish && git push origin master --tags

# 目标：只发 npm
npm version patch && npm publish

# 目标：只发 GitHub
git add -A && git commit -m "..." && git push origin master --tags
```

之后每次发版：`npm version patch` → 改完代码 → 跑发布脚本即可。脚本里同样遵循第 0 步的目标，不要写成"总是两边都发"。

本技能自带一份**只发 GitHub** 的可直接复用脚本：`scripts/release-github.ps1`（相对本技能目录）。它按顺序做：工作树检查 → 读版本号 → 拒绝重复 tag → 若仓库带技能库校验器则跑三级扫描 → 交互确认 → `git tag -a` → 推分支 → 推 tag → `gh release create`（notes 自动取 CHANGELOG 对应版本段）→ `gh repo edit --add-topic`。**不含任何 npm publish**，需要发 npm 时另走第 3、4 节。

```powershell
pwsh -File scripts\release-github.ps1 -Topics dsh-plugin          # 版本号取 package.json
pwsh -File scripts\release-github.ps1 -Version 1.12.0 -Force      # 指定版本号、跳过确认
```

## 常见坑

| 现象 | 原因 | 修复 |
|---|---|---|
| `npm publish` 报 E401 / "you do not have permission" | token 失效/复制不完整 | 重新生成 Automation token 写入 .npmrc |
| `npm publish` 要求 OTP / 卡在 web 授权 | 账号 2FA | 用 Automation token（见第 3 步），不要关闭 2FA |
| 发布到 CNPM / "Public registration is not allowed" | registry 是镜像站 | 切官方源或加 `--registry=https://registry.npmjs.org/` |
| gh 连接超时 | api.github.com 被墙 | `$env:HTTPS_PROXY` 设代理 |
| gh 找不到命令 | PATH 未刷新 | 重开终端，或使用完整路径 `C:\Program Files\GitHub CLI\gh.exe` |
| 插件加载报 JsonSchemaError | schema 里 required 用在字符串属性上 | 改为对象级 `required: [...]` |
| 他人环境装不上插件 | import 了 dsh 内部包 | 改 raw 工具定义，零 dsh 包依赖 |
| npm view 版本没更新 | 注册表索引传播延迟 | 等 1-3 分钟；curl registry 直查 `https://registry.npmjs.org/<包名>` |
| pwsh 里 JSON 显示乱码 | Get-Content 用 GBK 解码 UTF-8 | 用 read 工具或 Node 读取验证 |
| GitHub 标签乱打（硬贴 dsh-plugin / deepseek-harness） | 没结合项目实际内容 | 先读 README / 依赖清单；DSH 生态标签只给真正的 DSH 插件/集成/技能库打，普通项目按其真实技术栈打 |
| 用户只说"push 到 GitHub"，却顺手 `npm publish` | 没执行第 0 步的目标确认 | 先问发布目标，再按对应章节执行；未确认的一侧绝不动 |
| 用户只说"发布一下"，两边都发了 | 目标含糊时自行假定 | 含糊就必须 `ask_user_question` 提问，不要默认两边都发 |

## 输出模板

发布完成后的交付确认——**只列本次确认的目标平台，未发布的一侧写"本次未选择"或直接省略**：

```markdown
发布目标：<npm + GitHub / 只发 npm / 只发 GitHub>

| 平台 | 状态 |
|---|---|
| npm | ✅ <包名>@<版本>（npmjs.com/package/<包名>）／⏭️ 本次未选择 |
| GitHub tag | ✅ v<版本>／⏭️ 本次未选择 |
| GitHub Release | ✅ <Release URL>／⏭️ 本次未选择 |
| GitHub topics | ✅ <标签> 等 N 个／⏭️ 本次未选择 |
| 自动化 | ✅ automation token 已配置，后续免 OTP／⏭️ 未涉及 npm |
```
