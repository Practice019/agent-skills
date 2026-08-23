---
name: browser-harness
description: "用 browser-harness（CDP 直连 Chrome）控制浏览器完成网页自动化任务的完整手册。当用户要求打开网页、抓取网站内容、登录网站、分析页面、浏览器自动化、复刻网页、爬数据时使用。"
whenToUse: "用户提出任何需要真实浏览器操作的请求：抓取整站、逐页分析、登录操作、爬取数据、验证网页渲染、研究网站设计。优先于 Stagehand 使用。"
user-invocable: true
disable-model-invocation: false
---

# browser-harness 浏览器自动化工具手册

## 目标与边界

**做**：
- 用 browser-harness 连接本机 Chrome，完成：打开网页、抓取页面、整站抓取、登录、点击输入、截图、执行 JS
- 配合 agent_helpers.py 的封装工具（grab_page / crawl_site / login_form）高效抓站
- 工作流：**agent 判断 + browser-harness 执行 + 豆包看截图**

**不做**：
- ❌ 不依赖外部 LLM API（browser-harness 本身不需要任何模型 key）
- ❌ 不直接抄网站源码（复刻 = 观察设计重新实现，注意版权）
- ❌ 不替代 DSH 插件开发（那是 dsh-plugin-development 的职责）

## 环境速查

| 项 | 值 |
|---|---|
| 项目目录 | `<你的目录>\browser-harness-main`（克隆自 github.com/browser-use/browser-harness） |
| 命令 | `~/.local/bin/browser-harness`（uv tool install 后） |
| 调试 Chrome | 端口 **9222**，profile `<你的目录>\bh-chrome-profile` |
| 连接环境变量 | `BU_CDP_URL=http://127.0.0.1:9222` |
| agent 扩展 | `agent-workspace\agent_helpers.py`（每次运行自动加载） |

## 工作流程

### 1. 启动调试 Chrome（如果 9222 未运行）

```powershell
# 先探测：curl http://127.0.0.1:9222/json/version 返回 200 = 已运行
# 未运行则启动（后台）：
$chrome = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
$profile = "$env:USERPROFILE\bh-chrome-profile"
Start-Process -FilePath $chrome -ArgumentList "--remote-debugging-port=9222","--user-data-dir=$profile","--no-first-run","about:blank" -WindowStyle Minimized
Start-Sleep -Seconds 4
```

### 2. 调用 browser-harness（stdin 传 Python 代码）

```powershell
$env:BU_CDP_URL = "http://127.0.0.1:9222"
$code = @'
new_tab("https://example.com")
wait_for_load()
print(page_info())
'@
$code | & "$env:USERPROFILE\.local\bin\browser-harness"
```

**输出编码铁律**：任何脚本开头必须执行，否则遇到特殊字符会崩溃：
```python
import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")
```

### 3. 基础函数（helpers.py 预置）

| 函数 | 作用 |
|---|---|
| `new_tab(url)` / `goto_url(url)` | 开新标签 / 当前标签导航（goto 用完整 URL，相对路径会报错） |
| `page_info()` | 返回 {url, title, w, h, sx, sy, pw, ph} |
| `js(expression)` | 在页面执行 JS 并返回结果（最强大的函数） |
| `fill_input(selector, text)` | 填输入框（**对 React 受控组件无效**，见坑 2） |
| `click_at_xy(x, y)` / `type_text(text)` / `press_key(key)` | 鼠标/键盘 |
| `capture_screenshot(path)` | 截图 |
| `wait(sec)` / `wait_for_load()` / `wait_for_element(sel)` | 等待 |
| `list_tabs()` / `switch_tab(target)` | 标签页管理 |
| `upload_file(selector, path)` / `http_get(url)` | 上传 / HTTP 请求 |
| `cdp(method, **params)` | 底层 CDP 原语 |

### 4. agent_helpers.py 封装工具（整站抓取）

| 工具 | 调用 | 返回/落盘 |
|---|---|---|
| `grab_page(url)` | `d = grab_page("https://...")` | dict：url/title/text/inputs/buttons/links/selects/tables/scripts |
| `crawl_site(urls, out_dir)` | `crawl_site(["https://a.com","https://a.com/b"], r"D:\out")` | 逐页落盘 JSON（`ensure_ascii=True`） |
| `login_form(url, user, pwd)` | `login_form("https://a.com/auth", "u", "p")` | 填前两个 input + 点"登录"按钮，返回登录后 URL |

**标准抓站流程**：
```python
import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")
login_form("https://site.com/auth?mode=login", "user", "pass")
crawl_site(["https://site.com/", "https://site.com/pricing"], r"D:\out")
```

### 5. 复刻网页的标准做法

1. 用 `js("document.body.innerText")` 抓文本、`js("[...document.querySelectorAll('a')]...")` 抓链接
2. 用 `getComputedStyle` 抓 2-3 个关键颜色/字体/侧边栏宽度（**不要抄源码**）
3. **观察设计 → 重新手写 HTML/CSS/JS**（类名、结构、样式全自己写，内容/数据可以来自页面）
4. Chrome headless 截图验证 + 豆包识图检查渲染

## 常见坑（必须遵守）

1. **goto_url 必须完整 URL**：`goto_url("/pricing")` 报 "Cannot navigate to invalid URL"，要 `goto_url("https://site.com/pricing")`
2. **React 受控表单**：`fill_input` 找不到元素或填不进去 → 用原生 setter：
   ```js
   const setVal=(el,v)=>{const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));};
   ```
3. **JS 返回 surrogate 字符**（emoji 等）会让 stdout/stderr 崩溃 → 开头 reconfigure 两个流；数据量大时用 `json.dump(..., ensure_ascii=True)` 落盘而非 print
4. **agent_helpers.py 是独立模块**：内部函数引用基础函数必须显式 `from browser_harness.helpers import goto_url, wait_for_load, wait, js, page_info`（helpers 的注入是单向的）
5. **browser-harness 输出缓冲**：PowerShell 里不要用 `Select-Object -Last N` 管道包住耗时命令（会缓冲到结束才显示，像卡死）
6. **spa 页面**：`wait_for_load()` 后加 `wait(2-3)` 等渲染，必要时抓 `document.body.innerText` 二次确认

## 输出模板（整站分析报告）

```markdown
# {站点名} 全面解析（{页面名}）
- URL / 标题 / 访问要求
- 页面结构（布局图）
- 核心数据（表格化）
- 功能模块解析
- 技术特征（框架/脚本/第三方）
- 业务逻辑要点
- 安全与隐私提醒（敏感信息脱敏）
- 备注
```

## 维护

- 修改 `agent-workspace\agent_helpers.py` 后**下次运行自动生效**（editable 安装），无需重装
- 更新 browser-harness：`browser-harness --update -y`
- 诊断：`browser-harness --doctor`（chrome/daemon/连接状态）
