---
name: feishu-cli
description: "用 lark-cli 命令行工具操作飞书：读写文档、编辑内容（含表格行列级块编辑）、搜索、上传下载文件、电子表格、多维表格、消息、日历、邮件等。当用户需要查看/编辑/创建飞书文档、在表格中增删行、操作飞书云空间或调用飞书开放平台能力时使用。 Operate Feishu/Lark from the command line with lark-cli: read and write documents, edit content (including row/column-level table blocks), search, upload and download files, spreadsheets, bitables, messages, calendar, and mail. Use when the user needs to view, edit, or create Feishu docs, add or remove table rows, manage Feishu cloud space, or call Feishu Open Platform APIs."
whenToUse: "用户提到飞书/Lark 文档的读取、编辑、创建、搜索，或云空间文件管理、表格操作、消息发送等，且机器上已安装 lark-cli 时使用。"
user-invocable: true
disable-model-invocation: false
---

# lark-cli 飞书操作

用 `lark-cli`（官方 CLI）控制飞书：文档、云空间、电子表格、多维表格、消息、日历、邮件、任务、审批、OKR、妙记、视频会议等 18 大业务域。

## 前置检查（每次会话首次使用时执行一次）

### 1. 检查安装与版本

```powershell
lark-cli --version
lark-cli doctor
```

- `doctor` 输出各项检查。`cli_update` 为 warn 时建议先升级：`lark-cli update`
- 若提示 "Check the installed lark-doc skill first; if it is not the v2 skill, run `lark-cli update`"，先执行 `lark-cli update`（升级 CLI，同时更新配套 lark-doc 等 agent skills）

### 2. 检查授权状态

```powershell
lark-cli auth status
```

- `token expired` → 重新登录（见下）
- `no token` → 首次登录

### 3. 登录（Device Flow）

**关键点**：`auth login` 是阻塞式命令，必须用 `--no-wait` 先拿到授权 URL，再交给用户完成浏览器授权。

```powershell
# 步骤 A：发起授权，立即返回
lark-cli auth login --no-wait --json --domain docs,drive,im,calendar
```

返回 JSON 中含 `verification_uri`、`user_code`。把这两个信息告诉用户：

> 请打开 {verification_uri}，输入验证码 {user_code} 完成授权。

```powershell
# 步骤 B：用户在浏览器完成授权后，用 device-code 完成登录
lark-cli auth login --device-code <DEVICE_CODE> --json
```

**scope 选择**（`--domain` 参数，可逗号分隔多个）：
- 只操作文档：`docs,drive`
- 操作表格：`sheets`
- 操作多维表格：`base`
- 发消息：`im`
- 日历：`calendar`
- 邮件：`mail`
- 任务：`task`
- 全部：`all`（不推荐，scope 越多审批越慢）

### 4. 常用授权管理命令

```powershell
lark-cli auth status                 # 查看当前用户/token状态
lark-cli auth list                   # 列出所有已登录用户
lark-cli auth scopes                 # 查看应用已开通的 scopes
lark-cli auth check --scope docs:document:read   # 检查是否具备某 scope
lark-cli auth logout                 # 登出
lark-cli config show                 # 查看当前应用配置
```

## 常用命令速查

### 文档（docs）

| 操作 | 命令 |
|------|------|
| 读取文档 | `lark-cli docs +fetch --api-version v2 --doc "<URL或token>"` |
| 创建文档 | `lark-cli docs +create --api-version v2 --title "标题" --markdown "<内容或@file>"` |
| 追加内容 | `lark-cli docs +update --api-version v2 --doc "<token>" --mode append --markdown "<内容>"` |
| 覆盖全文 | `lark-cli docs +update --api-version v2 --doc "<token>" --mode overwrite --markdown "<内容>"` |
| 替换某段 | `lark-cli docs +update --api-version v2 --doc "<token>" --mode replace_range --selection-by-title "## 小节" --markdown "<新内容>"` |
| 更新标题 | `lark-cli docs +update --api-version v2 --doc "<token>" --new-title "新标题"` |
| 删除范围 | `lark-cli docs +update --api-version v2 --doc "<token>" --mode delete_range --selection-by-title "## 小节"` |
| 搜索文档 | `lark-cli docs +search --query "关键词"` |
| 插入图片 | `lark-cli docs +media-insert --doc "<token>" --file "D:\path\img.png"` |

**文档 token 提取**：URL `https://xxx.feishu.cn/docx/I005dwk5poSRtExG0RpcRG5Knrf` 中的 `I005dwk5poSRtExG0RpcRG5Knrf` 就是 doc token，可直接传给 `--doc`。

**内容格式**：
- `--markdown` 支持 Lark-flavored Markdown，也支持 `@文件路径`（读取本地文件）或 `-`（stdin）
- 也可用 `--doc-format xml` 使用 XML 格式获得更强的结构控制（表格/画板/图表等）
- ⚠️ 已知问题：v2 `+create --title T --content @file.md` 可能静默丢弃 title 和 content（GitHub issue #827），返回 ok 但文档是空的。**建议创建时用 `--markdown` 而非 `--content`**，创建后立即 `+fetch` 验证非空。
- **版本差异（实测 lark-cli 1.0.31）**：`docs +update --api-version v2` 的实际 flag 是 `--command append|overwrite|replace_range|...`、`--content`、`--doc-format xml|markdown`，**没有 `--mode` / `--markdown`**（上表是新版 CLI 写法；用前先 `lark-cli docs +update --api-version v2 --help` 确认）。`+update` 不支持 `--format`。表格行列级编辑请直接用下方块级 API。

### 云空间（drive）

| 操作 | 命令 |
|------|------|
| 上传文件 | `lark-cli drive +upload --file "D:\path\file.pdf" --folder-token <token>` |
| 下载文件 | `lark-cli drive +download --token <file_token> --output "D:\path\save.pdf"` |
| 搜索文件 | `lark-cli drive +search --query "关键词"` |
| 创建文件夹 | `lark-cli drive +create-folder --name "新文件夹" --folder-token <父token>` |
| 移动文件 | `lark-cli drive +move --token <file_token> --folder-token <目标token>` |
| 删除文件 | `lark-cli drive +delete --token <file_token>` |
| 导出文档 | `lark-cli drive +export --token <doc_token> --type docx` |
| 添加评论 | `lark-cli drive +add-comment --token <doc_token> --content "评论内容"` |

### 电子表格（sheets）

| 操作 | 命令 |
|------|------|
| 创建表格 | `lark-cli sheets +create --title "表名" --header "A,B,C"` |
| 读取数据 | `lark-cli sheets +read --spreadsheet-token <token> --range "Sheet1!A1:C10"` |
| 写入数据 | `lark-cli sheets +write --spreadsheet-token <token> --range "Sheet1!A1" --values "[[1,2,3]]"` |
| 追加数据 | `lark-cli sheets +append --spreadsheet-token <token> --values "[[1,2,3]]"` |
| 查找替换 | `lark-cli sheets +find --spreadsheet-token <token> --find "关键词"` |
| 查看信息 | `lark-cli sheets +info --spreadsheet-token <token>` |

### 多维表格（base）

| 操作 | 命令 |
|------|------|
| 创建 | `lark-cli base +base-create --name "表名"` |
| 查看字段 | `lark-cli base +field-list --app-token <token> --table-id <table_id>` |
| 读取记录 | `lark-cli base +record-list --app-token <token> --table-id <table_id>` |
| 搜索记录 | `lark-cli base +record-search --app-token <token> --table-id <table_id> --query "关键词"` |

### 消息（im）

| 操作 | 命令 |
|------|------|
| 发消息 | `lark-cli im +message-send --receive-id <open_id> --receive-id-type open_id --msg-type text --content "内容"` |
| 搜索消息 | `lark-cli im +message-search --query "关键词"` |
| 列出群聊 | `lark-cli im +chat-list` |

### 通用 API（兜底，透传飞书开放平台 OpenAPI）

```powershell
# GET（无查询参数）
lark-cli api GET /open-apis/docx/v1/documents/<doc>/raw_content

# GET（带查询参数）—— PowerShell 会吃掉 --params 里的双引号，必须"单引号 + 反斜杠转义"：
lark-cli api GET "/open-apis/docx/v1/documents/<doc>/blocks" --params '{\"page_size\":500}'

# PATCH/POST（带请求体）—— 复杂 JSON 先写 body.json（UTF-8 无 BOM），再 --data @file：
[IO.File]::WriteAllText("$PWD\body.json", $json, (New-Object System.Text.UTF8Encoding($false)))
lark-cli api PATCH "/open-apis/docx/v1/documents/<doc>/blocks/<block_id>" --data "@body.json"
```

实测三个坑：
- **HTTP 动词必须严格照官方文档**：docx「更新块」是 `PATCH`；用 PUT/POST 调它得到的是 `HTTP 404: 404 page not found`（不是 405），容易误判成接口不存在
- `--params` 报 `invalid format, expected JSON object` = 双引号被 PowerShell 剥掉了，改用 `'{\"k\":v}'` 写法
- `schema` 子命令只覆盖 approval/calendar/drive/im/mail/sheets/wiki 等，**不含 docx**（报 `Unknown service: docx`），docx 参数直接查官方文档（链接见下节）

## 官方块级 API（docx v1：表格行列级、块级精细编辑）

`docs +update` 只能整段 Markdown 追加/覆盖，**表格加行、单格改字、删行列这类结构级编辑它做不到**，要直接调官方块级 OpenAPI（`lark-cli api` 透传）。官方文档入口：

| 接口 | 方法与 URL | 官方文档 |
|---|---|---|
| 获取所有块 | `GET /open-apis/docx/v1/documents/<doc>/blocks?page_size=500` | [文档概述（块级接口总览）](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/docx-overview) |
| 获取单块 | `GET .../blocks/<block_id>` | 同上 |
| 更新块 | `PATCH .../blocks/<block_id>` | [更新块](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/patch?lang=zh-CN) |
| 批量更新块 | `PATCH .../blocks/batch_update` | [批量更新块](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/batch_update?lang=zh-CN) |
| 创建块 | `POST .../blocks/<parent_id>/children`，body `{"children":[...],"index":n}` | 文档概述 |
| 创建嵌套块（一次建出表格+单元格） | `POST .../blocks/<parent_id>/descendant` | 文档概述 |
| 删除块 | `DELETE .../blocks/<block_id>/children/batch_delete`，body `{"start_index":0,"end_index":2}` | 文档概述 |

权限：`创建及编辑新版文档` 或 `编辑新版文档`（scope 里有 `docx:document:write_only` 即可）。

### 块模型（GET blocks 实测确认的 block_type）

| block_type | 含义 | 识别特征 |
|---|---|---|
| 1 | 页面（根块，page 的 block_id = document_id） | children 是文档顶层块序列 |
| 2 | 文本段落 | `text.elements[].text_run` |
| 3–11 | 标题 1–9 级 | `heading1` / `heading2` … |
| 14 | 代码块 | `code.elements`，`style.language` |
| 31 | 表格 | `table.property.{row_size,column_size,header_row}`；`table.cells` 为 cell 的 block_id **按行主序**排列（每行 column_size 个） |
| 32 | 单元格 | `table_cell`，children 通常是一个 block_type 2 的段落 |

### 更新块（PATCH /blocks/<block_id>）请求体键

一次 PATCH 只做一个操作，请求体取以下键之一（标 ✋ 的仅 Table 块可用）：

| 键 | 用途 |
|---|---|
| `update_text_elements` | 重写段落文本。elements 数组支持 text_run / mention_user / mention_doc / equation；样式放 `text_element_style`（bold/italic/underline/strikethrough/inline_code/background_color/text_color/link） |
| `update_text_style` | 只改段落样式（align/folded），不动内容 |
| `update_table_property` ✋ | 表格属性（列宽 column_width 等） |
| `insert_table_row` ✋ | `{"row_index":n}`：n=-1 插在最前，n=row_size 追加末尾；**响应直接返回新行各 cell 的 block_id** |
| `insert_table_column` ✋ | `{"column_index":n}` |
| `delete_table_rows` / `delete_table_columns` ✋ | 批量删行/列（行/列索引数组） |
| `merge_table_cells` / `unmerge_table_cells` ✋ | 合并/取消合并（row/column_start_index、row/column_end_index） |

### 批量更新块（PATCH /blocks/batch_update）

请求体 `requests` 为数组，每项 = `block_id` + 上面任意一个操作键。一次调用改多个段落：

```json
{ "requests": [
  { "block_id": "<段落block1>", "update_text_elements": { "elements": [
      { "text_run": { "content": "加粗文字", "text_element_style": { "bold": true } } } ] } },
  { "block_id": "<段落block2>", "update_text_elements": { "elements": [
      { "text_run": { "content": "https://example.com",
        "text_element_style": { "link": { "url": "https%3A%2F%2Fexample.com" } } } } ] } }
] }
```

⚠️ `link.url` 必须 **percent-encode**（`https://` → `https%3A%2F%2F`），写原始 URL 会得到坏链接。响应带 `document_revision_id`；可传 `client_token` 幂等。

### 表格追加一行：完整调用序列（实测 5 步）

1. `GET .../blocks` → 找 `block_type:31` 的 table 块，记 `block_id` 与 `property.row_size`
2. `PATCH .../blocks/<table_block_id>` + `{"insert_table_row":{"row_index":<row_size>}}` → 末尾加空行，响应返回新行 3 个 cell 的 block_id
3. **再 `GET .../blocks`** → 用 cell id 反查各 cell 的 children，拿到新行的文本段落 block id（insert 响应里只有 cell id，没有段落 id）
4. `PATCH .../blocks/batch_update` → 对三个段落 block 分别 `update_text_elements` 填入各列内容（名称 bold、纯文本、link 三件套）
5. `docs +fetch` 回读 → 确认行数 +1、新行内容与样式正确

## 工作流程

### 场景 A：读取飞书文档

1. 用户给 URL → 提取 token（`/docx/<token>` 或 `/wiki/<token>`）
2. `lark-cli docs +fetch --api-version v2 --doc "<token>" --format json`
3. 输出是 JSON，含 markdown 格式正文；如需落盘：
   ```powershell
   lark-cli docs +fetch --api-version v2 --doc "<token>" | Out-File -Encoding utf8 doc.md
   ```
4. wiki 文档可能需要先通过 `lark-cli wiki` 解析 node → 实际 obj_token，再 fetch

### 场景 B：编辑飞书文档

1. 先 `+fetch` 读取现状（拿到 markdown + block 结构）
2. 确认要改动的位置：追加到末尾用 `--mode append`；整篇替换用 `--mode overwrite`；只改某一节用 `--mode replace_range --selection-by-title "## 章节"`
3. 写入临时 md 文件，用 `--markdown @temp.md` 传入，避免命令行转义问题
4. 执行 `+update`，检查返回 JSON 的 `code` 字段是否为 0
5. 再次 `+fetch` 验证修改生效

### 场景 C：创建飞书文档

1. 准备 markdown 内容（写入本地临时文件最稳妥）
2. `lark-cli docs +create --api-version v2 --title "标题" --markdown @temp.md`
3. 检查返回 JSON 中的 `url` / `document_id`
4. **立即 fetch 回读验证内容非空**（见上文 issue #827 的坑）

### 场景 D：批量文档处理

1. `lark-cli docs +search --query "关键词" --page-size 20` 拿到一批文档
2. 逐个提取 token，循环执行 fetch / update
3. 有失败要单独记录，不要让单条失败中断整批

## 输出处理技巧

```powershell
# 用 --jq 过滤 JSON 字段
lark-cli docs +fetch --api-version v2 --doc <token> -q '.data.content'
lark-cli docs +search --query "周报" -q '.data.items[].url'

# 输出格式选择
--format json      # 默认，结构化
--format pretty    # 人类可读
--format table     # 表格
--format ndjson    # 每行一个JSON，便于逐行处理

# 分页
--page-all         # 自动翻页拿全量
--page-size 50     # 每页条数
```

## 常见错误与排查

| 错误 | 原因 | 处理 |
|------|------|------|
| `token expired` | 登录过期 | 重新 `auth login --no-wait --domain ...` |
| `permission denied` / `forbidden` | 缺少 scope 或文档未授权给当前用户 | 检查 `auth scopes`；请文档所有者在飞书客户端里把文档分享给当前登录用户 |
| `InvalidParam` | 参数格式错误 | 检查 token 是否取对、JSON 是否合法 |
| `not exist` | token 错误或文档被删 | 确认 URL 是否最新 |
| `Rate limit` | 触发限流 | 加 `Start-Sleep -Milliseconds 500` 重试 |
| 输出中文乱码 | PowerShell 编码问题 | 命令前先执行 `[Console]::OutputEncoding=[Text.Encoding]::UTF8` |
| v2 create 内容为空 | issue #827 | 用 `--markdown` 而非 `--content`，创建后 fetch 验证 |
| api 透传返回 `404 page not found` | HTTP 动词不对（docx 更新块是 PATCH，用 PUT/POST 就 404）或路径拼错（如 `/all-blocks` 不存在） | 逐字对照官方文档的方法+URL |
| `--params invalid format, expected JSON object` | PowerShell 剥掉了内层双引号 | 写成 `--params '{\"page_size\":500}'` |
| `--file/--content must be a relative path` | `@file` 只接受当前目录内的相对路径 | 临时文件写进工作区，用 `@./file.json` |
| `Unknown service: docx`（schema 命令） | schema 不覆盖 docx | docx 参数查官方文档（「官方块级 API」一节有链接） |
| 表格要加行/改单元格，`+update` 做不到 | CLI 只有整段 Markdown 粒度 | 走官方块级 PATCH/batch_update（见「官方块级 API」一节） |

## 注意事项

1. **身份选择**：`--as user`（用户身份，访问用户有权限的资源）或 `--as bot`（应用身份）。大多数个人文档操作用 user 身份。
2. **Risk 标记**：`+fetch`/`+search` 是 read；`+create`/`+update`/`+delete` 是 write。写操作前确认目标正确。
3. **dry-run**：加 `--dry-run` 只打印请求不执行，可用来验证参数。
4. **大文件/长内容**：优先走 `@file` 方式传内容，避免命令行长度限制和转义坑。
5. **Windows 路径**：`@D:\path\to\file.md` 反斜杠在 PowerShell 里没问题，但如果内容含中文建议文件存 UTF-8（无 BOM 更稳）。
6. **不要把 token/app-secret 写进 skill 或脚本**：凭证由 `lark-cli config` / `auth` 管理，OS keychain 存储。
7. **CLI 升级**：`lark-cli update --json`；升级后 agent skills（lark-doc 等）会同步更新到 v2。
