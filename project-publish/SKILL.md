---
name: project-publish
description: "把本地 DSH 插件/项目发布到 npm 和 GitHub：发布前检查清单、npm 账号与 automation token 引导（免 2FA 输码）、版本号与 tag、GitHub Release 与 topics（dsh-plugin 市场收录）、一键自动化发版。当用户要发布项目到 npm/GitHub 时使用。"
whenToUse: "用户要求发布项目到 npm、发布到 GitHub、打 tag、建 Release、加 topics、配置自动化发布或处理发布报错时使用。"
user-invocable: true
disable-model-invocation: false
---

# 项目发布到 npm 与 GitHub

## 目标与边界

**做**：
- 发布前检查（包内容、元数据、schema、机器信息）
- 引导 npm 登录与 automation token 生成，实现免 OTP 自动化发布
- 版本号管理、git tag、GitHub Release、仓库 topics
- 把发布流程固化为脚本，实现一键发版

**不做**：
- ❌ 不替代插件开发（`dsh-plugin-development`）
- ❌ 不负责编写插件业务代码
- ❌ 不代替用户输入 npm/GitHub 账号密码或 token（引导用户操作）

## 工作流程

### 0. 环境诊断（先做，避免发布时踩网络/认证坑）

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

### 1. 发布前检查清单（每一项都过一遍）

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

### 2. npm 账号与 token 引导（关键：免 OTP 自动化）

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

### 3. 发布 npm

```bash
cd <项目目录>
npm version patch    # patch/minor/major：自动改版本号 + git commit + 打 tag vX.Y.Z
npm publish          # automation token 免 OTP；会提示 processing，索引几分钟后生效
npm view <包名> version   # 验证（注意传播延迟，必要时等 1-3 分钟再查）
```

### 4. 发布 GitHub

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

### 5. 一键自动化（发布流程固化）

新建 `scripts/release.mjs`（或 .ps1），串起发布动作：

```bash
npm version patch && npm publish && git push origin master --tags
```

之后每次发版：`npm version patch` → 改完代码 → 跑发布脚本即可。

## 常见坑

| 现象 | 原因 | 修复 |
|---|---|---|
| `npm publish` 报 E401 / "you do not have permission" | token 失效/复制不完整 | 重新生成 Automation token 写入 .npmrc |
| `npm publish` 要求 OTP / 卡在 web 授权 | 账号 2FA | 用 Automation token（见第 2 步），不要关闭 2FA |
| 发布到 CNPM / "Public registration is not allowed" | registry 是镜像站 | 切官方源或加 `--registry=https://registry.npmjs.org/` |
| gh 连接超时 | api.github.com 被墙 | `$env:HTTPS_PROXY` 设代理 |
| gh 找不到命令 | PATH 未刷新 | 重开终端，或使用完整路径 `C:\Program Files\GitHub CLI\gh.exe` |
| 插件加载报 JsonSchemaError | schema 里 required 用在字符串属性上 | 改为对象级 `required: [...]` |
| 他人环境装不上插件 | import 了 dsh 内部包 | 改 raw 工具定义，零 dsh 包依赖 |
| npm view 版本没更新 | 注册表索引传播延迟 | 等 1-3 分钟；curl registry 直查 `https://registry.npmjs.org/<包名>` |
| pwsh 里 JSON 显示乱码 | Get-Content 用 GBK 解码 UTF-8 | 用 read 工具或 Node 读取验证 |
| GitHub 标签乱打（硬贴 dsh-plugin / deepseek-harness） | 没结合项目实际内容 | 先读 README / 依赖清单；DSH 生态标签只给真正的 DSH 插件/集成/技能库打，普通项目按其真实技术栈打 |

## 输出模板

发布完成后的交付确认：

```markdown
| 平台 | 状态 |
|---|---|
| npm | ✅ <包名>@<版本>（npmjs.com/package/<包名>） |
| GitHub tag | ✅ v<版本> |
| GitHub Release | ✅ <Release URL> |
| GitHub topics | ✅ dsh-plugin 等 N 个 |
| 自动化 | ✅ automation token 已配置，后续免 OTP |
```
