---
name: dsh-plugin-development
description: 在 DeepSeek Harness (DSH) 上创建、修改、调试动态 Cordis 插件的完整指南。涵盖插件的协议与生命周期（Plugin/Package/Run、Host 半与 Client 半、apply(ctx)/inject、服务与事件、Slot UI、主题、Client→Host 私有 RPC、动态 Tool、版本与审批）。当用户想给 DSH 写一个插件、扩展运行时能力、注册 UI 或动态工具、或修复/升级已有插件时，使用本技能。
---

# DSH 动态插件开发（Dynamic Cordis Plugin Development）

本技能教你如何在 DeepSeek Harness 上**正确、完整**地创建和使用动态 Cordis 插件。核心原则：**先查实时接口，再写代码；写纯 JavaScript；每一个副作用都可逆。**

动态插件只存在于当前 DSH 进程内存中，可在后续轮次保持活跃，但会在 `cordis_stop`/`cordis_undefine`、工具集卸载或 DSH 重启后消失。它不写磁盘、不产生插件文件、不改 `cordis.yml`，也不跨重启存续；要固化为正式插件，需走常规开发流程。

## 插件统一存放与文件夹规范（强制约定）

所有本地开发/固化到磁盘的 DSH 插件，**统一存放**在：

```text
C:\Users\21877\.dsh\profiles\web\plugins\
```

### 目录规范

每个插件一个独立文件夹，命名使用小写字母 + 中划线，例如：

```text
C:\Users\21877\.dsh\profiles\web\plugins\
├── doubao-dsh-plugin\
│   ├── package.json
│   ├── cordis.patch.yml
│   ├── index.mjs
│   └── README.md
└── <other-plugin>\
    ├── package.json
    ├── cordis.patch.yml
    ├── index.mjs
    └── README.md
```

要求：

- 一个插件一个文件夹，禁止把多个插件混在同一个目录。
- 禁止把本地插件源码直接放在 DSH profile 根目录、`node_modules` 或任意外部路径。
- 插件文件夹内必须包含 `package.json`；如果作为 bundle 插件，还必须有 `cordis.patch.yml`。
- 入口文件建议统一为 `index.mjs`（ESM），或按实际需要命名为 `lib/index.js`。

### 安装方式

在 profile 的 `package.json` 中，依赖统一写成：

```json
"<plugin-name>": "file:./plugins/<plugin-name>"
```

然后执行：

```bash
cd C:\Users\21877\.dsh\profiles\web
pnpm install
```

也可以使用 DSH 命令安装：

```bash
dsh plugin --profile web add ./plugins/<plugin-name>
```

### 开发与修改

- 源码统一修改 `plugins/<plugin-name>` 内的文件。
- `node_modules/<plugin-name>` 只是安装后的运行副本，**不要把它当作长期开发目录**。
- 修改源码后需要重新同步：

```bash
cd C:\Users\21877\.dsh\profiles\web
pnpm install
```

或：

```bash
dsh plugin --profile web add ./plugins/<plugin-name>
```

### 卸载/清理

1. 从 `C:\Users\21877\.dsh\profiles\web\plugins\` 删除对应插件文件夹。
2. 从 profile 的 `package.json` 中移除：
   - `dependencies` 里的 `<plugin-name>`
   - `dsh.profile.bundles` 里的 `<plugin-name>`
3. 执行：

```bash
cd C:\Users\21877\.dsh\profiles\web
pnpm install
```

### 动态插件与正式插件的关系

- 通过 `cordis_define` 创建的动态插件只存在于内存，不写盘，不需要放到上面的 `plugins` 目录。
- 当用户要求“固化/正式安装/重启后仍然存在”时，必须把插件落到：

```text
C:\Users\21877\.dsh\profiles\web\plugins\<plugin-name>\
```

并按照上面的规范安装。

## 核心概念

| 概念 | 含义 |
|------|------|
| **Plugin（插件）** | 稳定的实例，由 `pluginId` 标识（形如 `dyn-<n>`，或含你提交的 idPrefix）。可跨版本演进。 |
| **Package（包）** | 一个不可变代码版本，由 `packageId` 标识。每次改代码 = 追加一个新 Package，**绝不覆盖旧版本**。 |
| **Run（运行）** | 一次激活尝试，由 `pluginRunId` 标识，连接审批、加载、Run 卡片与错误。 |
| **Host 半** | 在 DSH 的 Node.js 进程里运行。适合文件、命令、网络、Agent/Session、Host 服务/事件、动态 Tool、供 Client 调用的 JSON 方法。 |
| **Client 半** | 在浏览器页面里运行。适合主题、布局、页面状态、Tool 卡片、Slot UI。 |
| **`apply(ctx)`** | 插件的入口。Cordis 在其中注册生命周期贡献（服务、事件监听、Tool、Slot、样式等），并返回可被整体 dispose 的对象。 |

**currentPackageId** 是最新一次完全成功的版本（不代表正在运行）；**nextPackageId** 是待审批/正在激活/最近失败的版本。

## 标准工作流

1. 调用 `cordis_inspect_list` 获取当前 Host/Client 上注册的 Inspect Provider 及其方法、schema。
2. 用最少的 `cordis_inspect_query` 读取你将用到的**精确** Service、Event、Builtin、Slot、Theme token 或 Tool 契约。
3. 新插件：设计第一个 Package。改现有插件：先用 `cordis_inspect_self(pluginId, packageId)` 读原代码与诊断。
4. 在 `code.host`、`code.client`（或两者）中写纯 JavaScript，然后 `cordis_define`。
5. 用 define 返回的 `pluginId` + `packageId` 调 `cordis_run`。
6. 从 Run 卡片、steering 消息或 `cordis_inspect_self` 处理审批、等待、Client 加载与渲染失败。
7. 临时停用用 `cordis_stop`；确认不再需要才用 `cordis_undefine` 永久删除。

**同一轮里不要等待用户审批或异步浏览器结果。** `cordis_run` 返回 `awaiting-approval` 或 `starting` 后，结束当前工具流，等系统通过状态更新报告最终结果。

## 工具速查

| 工具 | 用途 | 不要 |
|------|------|------|
| `cordis_inspect_list` | 一次列出当前 Host/Client Provider 与方法 schema | 硬编码 Provider 名、把清单当业务数据 |
| `cordis_inspect_query` | 写码前确认精确的 Service/Event/Builtin/Slot/token/Tool 契约 | 用它替代调用真实 Service；假设 Client 查询无需响应页面也能完成 |
| `cordis_inspect_self` | 列出我的插件、读版本指针、读精确 Package 源码与诊断 | 只为列清单就取全部源码；用它去修改/启动插件 |
| `cordis_define` | 创建第一个版本，或给已有插件追加不可变 Package | 期望 define 会执行 apply、请求审批或更新 current |
| `cordis_run` | 激活一个精确 Package；`run`=首次/重启/回滚，`update`=切换版本 | 用 `run` 隐式切换版本；把 pending/starting 当成成功 |
| `cordis_stop` | 暂停当前副作用，保留 Package、授权与版本指针 | 用 stop 表达永久删除 |
| `cordis_undefine` | 永久删除插件及全部 Package、授权与历史视图 | 在还需要回滚/检查/重启时调用 |

## 平台选择

| 需求 | 平台 | 先查 |
|------|------|------|
| 文件、命令、进程、网络 | Host | `fs`、`shell`、`subprocess`、`web` 于 `Service.listService` |
| Agent、会话数据、Host 生命周期 | Host | 相关 Service 与 `Event.listEvents` |
| 注册下一步可被模型调用的动态 Tool | Host | `harness` 于 `Builtin.listBuiltins`，加 `Tool.listTools` |
| 页面主题/布局/页面状态 | Client | `Theme.listTokens` 与 Client `Service.listService` |
| 会话快照或 session/workspace 列表 | Client | 目标 Slot 的标准 props 与 owner props |
| 设置页、侧边栏、输入区、覆盖层、Tool 卡片 | Client | `Slots.listSubTree` |
| Host 取数据、Client 展示 | 两者 | Host Service + `harness.handle`；Client Slot + `host.call` |

优先选择最靠近数据所有者的能力。Slot props 已给会话快照就别再经 Host 取；只改自身样式就别覆盖全局主题；只需一个小入口就别替换整块产品 UI。

## 执行环境

`code.host` 与 `code.client` 都是**返回 Cordis 插件的普通 JavaScript 函数体**，不经 TypeScript/JSX/bundler 转换。

禁止：
- `import`、`require`、TypeScript 类型、`as`、装饰器、JSX；
- 未经 `Builtin.listBuiltins` 确认的全局变量；
- 臆测 `window`、`document`、`process`、`Buffer`、`fetch`、原生定时器。

Client 的 React 代码必须用 `React.createElement(...)`，不能写 `<div/>`。

### Host 半内建符号

- `ctx` — 受限 Cordis 上下文：`ctx.get(name)`、`ctx.on(name, listener)`、`ctx.provide(name, value)`、`ctx.effect(callback, label?)`。
- `harness` — Host 助手：
  - `harness.handle(method, handler)` — 注册包私有 Client→Host 方法。
  - `harness.defineTool(definition)` / `harness.registerTool(ctx, tool)` — 注册动态模型 Tool。
- `console`（包标签日志）、`btoa`/`atob`（base64）、`TextEncoder`/`TextDecoder`。

### Client 半内建符号

- `ctx` — 同上（get/on/provide/effect）。
- `React` — `React.createElement` / `React.useState` / `React.useEffect`（无 JSX）。
- `host` — `host.call(method, args?)`：包私有 JSON RPC，调用本包 Host 半。
- `styles` — `styles.insert(css)`：包私有样式表，随 Client run 清理。
- `console`。

**Client guard 门面**：`apply` 收到的是真 fiber ctx 之上的白名单代理，只能拿到「返回的 plugin 自己在 `inject` 里声明」的服务。因此要用对象形态 `{ inject: ['slots'], apply(ctx) {} }`；裸函数 `(ctx) => {}` 没有声明位，拿不到任何服务。

## Cordis 插件模型

### 读服务：默认用 `ctx.get`

可选能力用 `ctx.get(name)` 读取并处理缺失：

```js
return {
  apply(ctx) {
    const service = ctx.get('serviceName')
    if (service === undefined) return
    service.someMethod()
  },
}
```

### 硬依赖：用 `inject` 声明

只有当一个服务是硬依赖、且插件应在服务出现后由 Cordis 重新激活时，才在插件对象上声明 `inject`：

```js
return {
  inject: ['requiredService'],
  apply(ctx) {
    ctx.requiredService.someMethod()
  },
}
```

不要为了省 `undefined` 判断而滥用 `inject`；也不要未声明就访问 `ctx.xxx`（guard 会拒绝未声明依赖）。

### 生命周期：副作用必须可逆

每个贡献都要在 stop/update/remove 后被移除。优先用 Cordis 生命周期 API：

- `ctx.on(name, listener)` 注册事件监听（返回 disposer）。
- `ctx.effect(callback)` 持有返回 disposer 的外部订阅。
- 保留 Service/Tool/Slot/timer/theme API 返回的 disposer。
- 不要在 `apply()` 之外或模块作用域制造进程级/页面级副作用。

```js
return {
  apply(ctx) {
    const service = ctx.get('serviceName')
    if (service === undefined) return
    ctx.effect(() => service.subscribe((value) => console.log(value)))
  },
}
```

### 定时器

两个平台的定时器都是名为 `timer` 的**服务**（不是内建符号）。先查对应平台的 `Service.listService`（`{ service: 'timer' }`），并 `inject: ['timer']` 后使用混入方法：`ctx.timeout`、`ctx.interval`、`ctx.throttle`、`ctx.debounce`。不要用原生 `setTimeout`/`setInterval`（全局不存在或被遮蔽）。

### 监听事件

先查 Event Provider 确认平台、参数顺序、返回值和 `mode`。

- 普通 `emit` 事件：`ctx.on('some/event', (payload) => {...})`。
- `waterfall` 事件的最后一个参数是 `next`，除非有意截断下游，必须调用并返回它：

```js
return {
  apply(ctx) {
    ctx.on('some/waterfall', (payload, next) => {
      console.log(payload)
      return next()
    })
  },
}
```

### 提供服务

`ctx.provide(name, value)` 向运行时的 service 注册表发布一个服务（返回 disposer）。注意：**动态包发布服务受同一注册规则约束**，重复注册同名服务会抛错；除非你确认该服务归本包独占，否则不要轻易 provide。

## Client UI：Slot 注册

先用 `Slots.listSubTree`（不带 `root`）选目标，再带 `root` 查精确 Slot 的完整契约再写注册。精确结果决定：

- Slot 在布局中的用途；
- 注册协议是 `single` / `list` / `keyed` / `chain`；
- 注册选项（`id`/`order`/`label`，或 `key`，或 `select`）；
- scope 标准 props 与业务 owner props；
- 当前占用者、替换风险与后代 Slot。

用 `ctx.get('slots')` 并处理缺失，再用 `slots.inject` 等 Slot 声明、在回调里 `slots.register`：

```js
return {
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return
    slots.inject('target.slot', () => slots.register(
      { name: 'target.slot', id: 'my-view' },
      (props) => React.createElement('div', null, String(props.someValue)),
    ))
  },
}
```

不要臆测 `id`/`key`/`selector`/props；不要默认替换 root 级 `root`/`sidebar`/`conversation`/`details`（替换整个占用者会连它声明的后代 Slot 一起移除）。`ctx.get('slots')` 不需要注入；但 `ctx.slots` 只有在声明 `inject: ['slots']` 时才能用。

### 常用 Slot 定位

- **设置页**：完整设置页通常注册 `settings.section`；单个通用偏好才用 `settings.general.item`。查实际 subtree、选项与 props，选最窄够用的入口。动态插件是临时的，设置 UI 无需持久化存储。
- **会话/页面数据**：会话作用域 Slot 常通过标准 props 提供 `useSession`/`useSessions`/`useWorkspaces` 等。优先直接用，别为已有数据加 Host RPC。
- **Cordis Run 专属面板**：把交互 UI 放进最新 `cordis_run` 卡片，注册 `tool.view.cordis` 且 `key: 'self'`：

```js
return {
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return
    slots.inject('tool.view.cordis', () => slots.register(
      { name: 'tool.view.cordis', key: 'self' },
      (props) => React.createElement('div', null, `Package ${props.packageId}`),
    ))
  },
}
```

`self` 在运行时绑定为 `pluginId + packageId`；不要在 key 里放 `pluginRunId`。

- **普通 Tool 卡片**：定制普通模型 Tool 的调用卡，查 `tool.call.toolview`，其 key 是 Tool 名。
- **覆盖层/本地入口**：toast/通知用 `shell.overlay`；侧边栏小按钮优先加法式内部 Slot 如 `sidebar.footer.action`；对话轮次后附加内容查 `conversation.chat.turnTail`（chain 协议）。

## 主题与样式

先定范围：

1. 全局主题：先查 `Theme.listTokens`，再经 Client `Service.listService` 查 `{ service: 'theme' }`；按查询要求给每个覆盖提供 light/dark 两套值，保留返回的 disposer。
2. 包自身组件：用 `styles.insert(css)`，颜色优先用主题 CSS 变量。
3. 新可见内容：先选 Slot，再决定本地 CSS 还是全局 token。

不要动 `document.body`、`window` 或硬编码产品 DOM 选择器。

## Client → Host 私有 RPC

Host 用 `harness.handle(method, handler)` 注册包私有方法，Client 用 `host.call(method, args)` 调用。方向只有 Client→Host，且只能过 lossless JSON。

```js
// Host 半
return {
  apply(ctx) {
    harness.handle('read-state', async (args) => ({ value: args.key }))
  },
}
```

```js
// Client 半
return {
  async apply(ctx) {
    const result = await host.call('read-state', { key: 'demo' })
    console.log(result.value)
  },
}
```

不要跨线传函数、React 元素、类实例、Context、Service 等运行时对象；无返回数据时返回 `null`。不要注册公开 Remote Service，也不用 `ctx.remote` 做包私有通信。

## 注册动态模型 Tool

Host 用 `harness` 注册下一步可被模型调用的 Tool。先查 Host `Builtin.listBuiltins` 拿 `harness` 签名，再用 `Tool.listTools` 检查已有 Tool 名避免冲突。Tool 参数与返回值必须 JSON 兼容；`execute` 持有业务结果。Tool 注册必须归属当前插件 fiber，stop/update 后自动移除。

## 内部实时数据

Service 实例、Event 载荷、Slot props、Session/会话快照、Tool 状态等都是内部实时数据。

不要：
- 对它们（或其子孙）`JSON.stringify` / `structuredClone`；
- 递归枚举、整体复制或整体展示；
- 把 Host 对象放进包的长时状态或 RPC 返回值。

只读当前功能需要的叶子字段，抽取最小标量值再构造自有 JSON。

## 版本、审批与修复

选择 `cordis_run` 的 mode：

| 当前状态 | 目标 | mode |
|----------|------|------|
| 无 current | 该插件下任意 Package | `run` |
| 有 current | 同一个 Package | `run` |
| 有 current | 不同的 Package | `update` |
| update 失败 | `nextPackageId` | `update` 重试 |
| update 失败 | `currentPackageId` | `run` 回滚 |

- 未授权的 Client Package 返回 `awaiting-approval`；单个勾只授权当前 Package，双勾授权该插件未来版本；授权在技术失败后仍保留。
- 已授权返回 `starting`，在浏览器异步完成；`starting` 不等于成功。
- 技术失败后：① `cordis_inspect_self(pluginId, packageId)` 读失败版本源码与诊断；② 若涉及未知能力，重新 list/query 对应 Provider；③ 在**同一插件**下定义新 Package（不覆盖失败版本）；④ 用新 `packageId` + 正确 mode 再 run。
- 用户拒绝审批后不要自动重试。失败的 update 不会自动恢复旧 Run，需要时显式 run current 回滚。

## 修改 @pluginId

用户用 `@pluginId` 指向某插件时，**不要另建同名插件**（注入上下文只含身份、版本指针、默认基础 Package，不含源码）：

1. 用 `cordis_inspect_self(pluginId, packageId)` 读基础 Package。
2. 保留不需改的 Host/Client 半，只改目标代码。
3. `cordis_define` 用 `plugin.kind: 'existing'` 与原 `pluginId` 追加 Package。
4. 用返回的 `packageId`；有 current 时通常用 `update` 激活。

若引用不可用，说明插件已被移除、属于别的会话或进程重启后丢失；不要重建同名替代。

## 常见错误检查

| 失败 | 首先检查 |
|------|----------|
| `service "x" is not declared` | 是否未声明 `inject` 就用了 `ctx.x`；改 `ctx.get('x')` + 缺失判断，或声明真正的硬依赖 |
| `cannot get property "timer" without inject` | 查 timer 服务并声明 `inject: ['timer']` |
| Client 解析失败 | 是否用了 JSX、TypeScript、import 或不可用全局 |
| Slot 注册失败 | 是否查了实时 subtree、Slot 存在、选项/key/selector 满足返回协议 |
| UI 已加载但页面报错 | 读 `client-render` 诊断与堆栈；错误归属某次 Run，定义新 Package 修复 |
| `host.call` 失败 | Host handler 名、当前 `pluginRunId`、JSON 参数、handler 内真实服务依赖 |
| update 失败 | 保持 current/next 语义；修复 next 后 update，或 run current 回滚 |

## 关键服务/事件/Slot 索引（速查，写码前仍需实时查询）

这些名字来自当前运行时，写码前务必用 `cordis_inspect_query` 确认签名：

- **Host 服务（常用）**：`fs`（文件）、`shell`（bash 执行）、`subprocess`、`web`（搜索/抓取）、`timer`、`tools`（工具注册表）、`agents`、`sessions`、`agentPresets`、`goals`、`jobs`、`skills`、`settings`、`llm`、`subagents`、`workflowEngine`、`workspaceRegistry`、`sandboxPolicy`。
- **Client 服务**：`slots`、`theme`、`timer`、`layout`、`locale`、`sessions`、`workspaces`。
- **Host 事件（类别）**：`agent/*`（created/disposed/error/pre-step/request/status/turn-stopping…）、`tools/*`（pre-execute/execute/post-execute/result…）、`session/*`、`settings/*`、`llm/*`、`subagent/*`、`workflow/*`、`approval/request`、`fs/*`、`goal/changed`、`skills/change`。多数含 waterfall 模式，需调 `next()`。
- **Client 事件**：`connection/reset`、`locale/change`、`slots/changed`、`theme/change`。
- **Slot（常用）**：`root`、`shell.overlay`、`sidebar`、`sidebar.footer.action`、`sidebar.workspaces`、`settings.section`、`settings.general.item`、`conversation`、`conversation.session`、`conversation.session.header.actions`、`conversation.composer`、`conversation.input.left/right/dock/overlay`、`conversation.chat.node`、`conversation.chat.turnTail`、`conversation.chat.assistant-actions`、`tool.call.toolview`、`tool.view.cordis`、`details`。
- **主题 token**：`--dsw-alias-*`（bg/border/brand/label/state…）与 `--dsw-specific-*`，大多需 light+dark 两套值。
