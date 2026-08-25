"""browser-harness 封装工具：整站抓取 / 表单登录 / 页面结构化提取。

依赖 browser-harness（安装见 SKILL.md：`uv tool install browser-harness`，
命令位于 `~/.local/bin/browser-harness`，通过 stdin 传入本模块执行的 Python 代码）。

本模块作为独立文件随技能分发（<技能目录>/agent_helpers.py），内部显式从
browser_harness.helpers 导入所需基础函数（helpers 的注入是单向的，不能反向引用）。
"""

import json
import os
import sys

# 输出编码铁律：任何脚本开头必须执行，否则遇到特殊字符（emoji/surrogate）会崩溃
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from browser_harness.helpers import (  # noqa: E402
    goto_url,
    js,
    new_tab,
    page_info,
    wait,
    wait_for_load,
)


def grab_page(url, wait_seconds=3):
    """打开 URL 并提取页面结构信息，返回 dict。

    返回字段：url / title / text / inputs / buttons / links / tables / scripts。
    """
    new_tab(url)
    wait_for_load()
    wait(wait_seconds)  # SPA 页面等待渲染
    info = page_info()
    return {
        "url": info.get("url"),
        "title": info.get("title"),
        "text": js("document.body ? document.body.innerText : ''"),
        "inputs": js("[...document.querySelectorAll('input,select,textarea')].map(e => e.outerHTML.slice(0,200))"),
        "buttons": js("[...document.querySelectorAll('button')].map(e => (e.innerText||'').trim()).filter(Boolean).slice(0,100)"),
        "links": js("[...document.querySelectorAll('a[href]')].map(a => a.href)"),
        "tables": js("[...document.querySelectorAll('table')].map(t => t.innerText)"),
        "scripts": js("[...document.querySelectorAll('script[src]')].map(s => s.src)"),
    }


def crawl_site(urls, out_dir):
    """逐页抓取并落盘 JSON（ensure_ascii=True，避免代理/编码问题）。

    urls: list[str]；out_dir: 输出目录（不存在会自动创建）。
    每页独立落盘一个 <url 安全名>.json，中途失败不丢已抓页面。
    返回 {url: 该页 dict}。
    """
    os.makedirs(out_dir, exist_ok=True)
    results = {}
    for url in urls:
        try:
            data = grab_page(url)
        except Exception as exc:  # noqa: BLE001 —— 单页失败不中断整站
            data = {"url": url, "error": str(exc)}
        results[url] = data
        safe = (
            url.replace("https://", "")
            .replace("http://", "")
            .replace("/", "_")
            .replace("?", "_")
            .replace(":", "_")
        )
        with open(os.path.join(out_dir, safe + ".json"), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=True, indent=2)
    return results


def login_form(url, user, pwd, submit_text="登录"):
    """打开登录页，填前两个 input（用户名/密码）并点击"登录"按钮，返回登录后 URL。"""
    from browser_harness.helpers import fill_input

    new_tab(url)
    wait_for_load()
    wait(2)
    fill_input("input[type='text'], input[type='email'], input:not([type])", user)
    fill_input("input[type='password']", pwd)
    js("([...document.querySelectorAll('button')].find(b => (b.innerText||'').includes('{0}')) || {{}}).click && "
       "[...document.querySelectorAll('button')].find(b => (b.innerText||'').includes('{0}')).click()".format(submit_text))
    wait(3)
    return page_info().get("url")


if __name__ == "__main__":
    # 快速自检：python agent_helpers.py --check
    if len(sys.argv) > 1 and sys.argv[1] == "--check":
        print("agent_helpers OK:", [k for k in ("grab_page", "crawl_site", "login_form")])
