---
name: reverse-proxy
description: "配置与排障反向代理（nginx / Caddy / Traefik）：TLS 终止、路径与域名分流、负载均衡、限流、WebSocket 与 SSE 流式透传、LLM/agent 网关。当需要搭建应用网关、把公网域名转发到后端服务、在边缘终止 HTTPS、或排查 502/504/证书/WebSocket 断连时使用。Configure and troubleshoot reverse proxies with nginx, Caddy, or Traefik — TLS termination, path and host routing, load balancing, rate limiting, WebSocket/SSE passthrough, and LLM agent gateways. Use when setting up application gateways, exposing backend services on a public domain, terminating HTTPS at the edge, or debugging 502/504/certificate/WebSocket issues."
---

# 反向代理配置与排障（Reverse Proxy）

把客户端流量汇聚到一个入口，终止 TLS，再按域名/路径分发到后端服务。

## 目标与边界

**做**：

- 用 nginx / Caddy / Traefik 搭建反向代理入口
- TLS 终止（Let's Encrypt 自动签发、DNS challenge 通配符、内网自签）
- 域名分流、路径分流、多服务单入口
- 负载均衡、健康检查、粘性会话
- 限流、安全头、访问控制、IP/内网限制
- WebSocket、SSE/流式响应、gRPC 透传
- LLM / agent 网关（按 key 配额、流式代理、MCP server 代理）
- **自建网关的排障**：逐跳抓包定位层级、HTTP 200 里藏业务错误、
  上游参数契约、错误分类、并发排队、额度标记
- 502 / 504 / 413 / 证书 / WebSocket 断连排障

**不做**（明确超出范围，遇到请换技能或直接说明）：

- ❌ Kubernetes Ingress 控制器、Istio/Envoy 服务网格
- ❌ 应用层代码（后端框架自身的路由、认证实现）
- ❌ **正向代理**（客户端出网代理、SOCKS、HTTP CONNECT 隧道）——那是 forward-proxy 领域
- ❌ Windows / IIS ARR 反代（本技能所有配置与命令均基于 Linux 侧）
- ❌ CDN / 云厂商托管网关的控制台操作

## 触发信号

用户提到任一即适用：反向代理、反代、网关、`proxy_pass`、`upstream`、`server_name`、Caddyfile、`traefik.yml`、SSL 终止、TLS 终止、certbot、Let's Encrypt、通配符证书、502 Bad Gateway、504 Gateway Timeout、413、mixed content、WebSocket 代理、SSE 流式、粘性会话、sticky session、`ip_hash`、负载均衡、`limit_req`、`X-Forwarded-For`、443 端口冲突、`0.0.0.0` 暴露。

**自建网关排障**额外触发：某个客户端全部失败而其它正常、上游报参数非法、
"流异常结束"、`finish_reason` 缺失、业务错误藏在 200 里、账号被莫名冷却、
并发上限、额度耗尽、`insufficient quota`、错误的字段名（`max_completion_tokens`）、
"谁在请求"、网关日志全 200 但客户端说失败。

英文触发：reverse proxy, gateway, TLS termination, load balancing, rate limiting, WebSocket passthrough, SSE streaming, certificate renewal, ACME, self-hosted gateway debugging, business error in HTTP 200, upstream parameter contract, quota exhaustion, concurrency queueing.

## 第一步：选工具（先选型，再取模板）

**不要默认输出 nginx。** 先按下表选：

| 判据 | 选 nginx | 选 Caddy | 选 Traefik |
|---|---|---|---|
| 已有 nginx 运维经验/存量配置 | ✅ 首选 | | |
| 想少写配置、自动 HTTPS | | ✅ 首选 | |
| 服务跑在 Docker/K8s，要自动发现 | | | ✅ 首选 |
| 需要动态增删服务不改主配置 | | | ✅ 首选 |
| 需要精细调优（buffering/时间轴/变量） | ✅ | | |
| 内网/LAN 自签证书 | ✅ | ✅ `tls internal` | |
| 通配符证书 + DNS challenge | ✅ | ✅ 最简 | ✅ |
| 需要内置 dashboard | | | ✅ |
| 团队零学习成本、配置即文档 | | ✅ | |

**默认建议**：单机、少量服务、要自动 HTTPS → **Caddy**；复杂调优或存量环境 → **nginx**；容器编排动态环境 → **Traefik**。

## 主流程（固定六步）

### Step 1 — 只读审计（禁止先改配置）

改任何东西之前，先摸清现状并落盘一份审计记录：

```bash
# 主机与网络现状
hostname; date -Is; ip -brief addr

# 谁在监听 80 / 443（含 UDP 443，HTTP/3 用）
sudo ss -tulpn | grep -E ':(80|443)\b'

# 容器与端口发布（Docker 经 iptables 发布，UFW 可能是开启但没拦住）
docker ps --format '{{.Names}}\t{{.Ports}}'
docker network ls

# 现存的 web/proxy 配置与证书
ls -la /etc/nginx /etc/caddy /etc/apache2 /etc/letsencrypt 2>/dev/null

# 防火墙状态
sudo ufw status verbose 2>/dev/null; sudo nft list ruleset 2>/dev/null | head -50
```

**必须检查的暴露风险**：Compose 文件里出现 `0.0.0.0` 或无 IP 限定的 `ports:`，且指向数据库 / Redis / 队列 / 管理 API / 内部后端，都是待收敛项：

```bash
grep -rn -E '^\s*-\s*"?[0-9]+:[0-9]+' docker-compose*.yml compose*.yml 2>/dev/null
```

**443 抢占检查**：若已有服务占用 `:443`，先拿到用户明确指令再动它。获批后**先关掉它的重启策略再停**，否则重启时会和代理抢端口：

```bash
docker inspect <container> --format '{{.HostConfig.RestartPolicy.Name}}'
```

**DNS 前置检查**（ACME 签发成败的关键）：

```bash
dig +short A  example.com
dig +short AAAA example.com          # AAAA 指向别处会让客户端和 ACME 打到错误主机
dig +trace A example.com | tail -20  # 绕过递归缓存看权威应答
```

### Step 2 — 写前备份（强制）

没有备份不许往下走。备份目录带时间戳，连同审计记录一起存：

```bash
BK=~/backups/proxy-$(date +%Y%m%d-%H%M%S); mkdir -p "$BK"
sudo cp -a /etc/nginx "$BK"/ 2>/dev/null
sudo cp -a /etc/caddy  "$BK"/ 2>/dev/null
sudo cp -a /etc/letsencrypt "$BK"/ 2>/dev/null
cp -a docker-compose*.yml "$BK"/ 2>/dev/null
echo "backup: $BK"
```

### Step 3 — 取模板

按选定的工具读对应参考文件（相对本技能目录）：

```text
read references/nginx.md        # nginx 全量：location/upstream/TLS/限流/缓存/调优/anti-patterns
read references/caddy.md        # Caddyfile 语法、自动 HTTPS、handle 路由、nginx↔Caddy 对照
read references/traefik.md      # 静态+动态配置、Docker labels 自动发现
```

若代理对象是 **LLM / agent / 流式接口**（SSE、长连接、按 key 配额），**额外必读**：

```text
read references/agent-gateway.md
```

排障或用户直接贴报错时：

```text
read references/troubleshoot.md
```

若排障对象是**自己写的网关**（不是 nginx 配置），或症状表现为
"某客户端全失败"、"上游报参数错"、"日志全 200 但客户端说失败"、
"账号被莫名冷却"，**必读**：

```text
read references/gateway-debugging.md
```

### Step 4 — 校验后 reload（不许 restart）

**先校验，再 reload**；校验失败就地回滚，不要把坏配置推上线。

```bash
# nginx
sudo nginx -t && sudo nginx -s reload

# Caddy
sudo caddy validate --config /etc/caddy/Caddyfile && sudo caddy reload --config /etc/caddy/Caddyfile

# Traefik：配置无效会拒绝启动，先看日志
docker compose logs --tail=50 traefik
```

校验失败的处理：

```bash
# nginx 回滚
sudo cp -a "$BK/nginx/." /etc/nginx/ && sudo nginx -t && sudo nginx -s reload
```

### Step 5 — 端到端验证

按这个顺序验证，**每一环都是独立门禁**，不要跳：

```bash
# 1) HTTP 跳转 HTTPS
curl -sSI http://example.com | head -1        # 期望 301/308

# 2) 证书 SAN / 颁发者 / 有效期
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | openssl x509 -noout -subject -issuer -dates -ext subjectAltName

# 3) 反代链路通
curl -sS -o /dev/null -w '%{http_code} %{time_total}s\n' https://example.com/health

# 4) 转发头正确（后端应看到真实协议与客户端 IP）
curl -sSI https://example.com/ | grep -i -E 'x-forwarded|strict-transport|server'

# 5) 后端与数据库端口不对外
nmap -Pn -p 5432,6379,3000 <public-ip>        # 期望 closed/filtered

# 6) 未完成 DNS 时的本地验证（ACME 此时必然无法通过）
curl -sSI --resolve example.com:443:<vps-ip> https://example.com/
```

**部署新鲜度检查**：若公网行为没变，先确认部署工作流是否真的跑过、跑的是哪个镜像，不要假定当前 checkout 就是线上版本。

### Step 6 — 交付回滚命令

最终回复必须同时给出**验证命令**和**回滚命令**，让用户能一键退回：

```bash
# 回滚（替换为上一步记录的实际路径）
sudo cp -a ~/backups/proxy-<timestamp>/nginx/. /etc/nginx/ && sudo nginx -t && sudo nginx -s reload
```

## 输出模板

```markdown
## 拓扑
公网 → <代理> (80/443) → <后端 127.0.0.1:PORT> → <依赖>

## 决策
- 选 <nginx|Caddy|Traefik>，理由：<判据>
- 证书：<Let's Encrypt HTTP-01 | DNS challenge 通配符 | 自签>

## 配置
<完整配置块，含文件路径>

## 校验与生效
<validate 命令> && <reload 命令>

## 验证
<curl / openssl / ss 的实际命令与期望输出>

## 回滚
<一条可执行的回滚命令>

## 遗留风险
- <未实测项 / 待人工确认项>
```

## 硬性约束（违反即事故）

1. **先审计后改动**——不允许在未知 80/443 占用的情况下写配置
2. **先备份后写入**——备份必须落盘到带时间戳的目录
3. **校验通过才 reload**——`nginx -t` / `caddy validate` 是硬门禁
4. **应用只监听 `127.0.0.1` 或 Docker 内网**——不对 `0.0.0.0` 发布后端
5. **数据库/Redis/队列永不公网发布**——需要宿主访问就绑 `127.0.0.1`
6. **必须设 `X-Forwarded-Proto`**——否则后端生成 http 链接，触发 mixed content
7. **WebSocket/SSE 必须调超时**——默认 `proxy_read_timeout 60s` 会掐断长连接
8. **改完给回滚命令**——不给回滚的交付视为未完成

### 自建网关附加约束

9. **不要信 HTTP 状态码**——业务错误常藏在 200 里，必须解析 `error_code`
10. **客户端错误绝不罚账号**——否则一个坏参数能毒化整个账号池
11. **出站用字段白名单，不用黑名单**——上游对未知字段可能直接 400
12. **区分"忙"与"坏"**——并发满应排队，不可用才失败
13. **诊断工具必须有终止条件**——裸 `for {}` 循环会污染你自己的所有观察
14. **限额先确认粒度**——per-account 与 global 的修法完全不同

## 常见坑（速查）

| 坑 | 后果 | 对策 |
|---|---|---|
| `proxy_pass` 尾斜杠差异 | 路径被多剥/少剥一层 | 带 `/` 剥前缀，不带 `/` 传全路径 |
| 漏设 `Host` 头 | 后端虚拟主机/重定向错乱 | `proxy_set_header Host $host;` |
| `client_max_body_size` 默认 1MB | 上传报 413 | 按需调大 |
| location 匹配顺序误判 | 规则不生效 | `=` > `^~` > `~` > `~*` > 前缀 |
| 全局限流打太狠 | 正常用户被 429 | 按端点分 zone，登录类单独收紧 |
| UFW 关着但仍暴露 | 以为安全实则公网可达 | Docker 经 iptables 发布，查 `ss` + `docker ps` |

### 自建网关的坑（详见 `references/gateway-debugging.md`）

| 坑 | 后果 | 对策 |
|---|---|---|
| 只看 HTTP 状态码 | 业务错误被当成功 | 解析 `error_code`，末段才是真实状态码 |
| 客户端错误罚账号 | 一个坏参数打挂全池 | 4xx 原样回给客户端，不动账号状态 |
| 出站字段黑名单 | 客户端新字段触发 400 | 改为白名单，只发上游认识的 |
| 未裁剪超限值 | 客户端发 384000 而限额 65536 → 400 | 归一后按上限裁剪 |
| 并发满即失败 | 客户端重试又撞上限 → 持续报错 | 排队等待 + ctx 取消 + 超时兜底 |
| 拿一个额度推另一个 | "积分还剩很多"但某通道已耗尽 | 分通道单独查询与标记 |
| 只标记不清除 | 状态过期，用户避开可用资源 | 成功后清除标记 |
| 裸循环诊断脚本 | 自造流量污染全部观察 | 必须有终止条件，收尾逐个确认已停 |
| 多程序共用状态目录 | 字段格式被覆盖，解析失败 | 文件名前缀隔离 + 落盘前校验必需字段 |

**最重要的一条**：症状出现在 A 层而根因在 B 层时，**在每一跳边界抓报文做对比**，
不要靠猜。见 `references/gateway-debugging.md` 的"先拿证据，再下判断"。

详细对照见 `references/troubleshoot.md`。

## 完成自检

**代理配置**：

- [ ] 80/443 由代理独占，后端只在内网
- [ ] 配置校验通过且已 reload
- [ ] HTTP 跳转 HTTPS，证书 SAN 正确
- [ ] 反代链路返回预期状态码
- [ ] 数据库/Redis/管理端口不对外可达
- [ ] 已提供回滚命令

**自建网关排障**（涉及则勾）：

- [ ] 已定位故障在**哪一跳**（客户端/代理/网关/上游）
- [ ] 抓到**出站**报文（不只是入站），确认改写结果
- [ ] 确认错误分类正确（客户端错误没有罚账号）
- [ ] 并发满时是排队而非立即失败，且 ctx 可取消
- [ ] 诊断用的后台任务已全部停止，二进制已清理
- [ ] 结论已沉淀到界面或日志（下次不必重查）

- [ ] 未实测部分已显式标注

## 关联资源

按需 `read`，不要全部加载。下列路径**相对本技能目录**解析：

- `references/nginx.md` — nginx 全量参考
- `references/caddy.md` — Caddy 全量参考 + nginx↔Caddy 对照
- `references/traefik.md` — Traefik 静态/动态配置与 Docker labels
- `references/agent-gateway.md` — LLM/agent 流量的代理特殊处理
- `references/troubleshoot.md` — 症状 → 成因 → 修复 → 诊断命令
- `references/gateway-debugging.md` — **自建网关**的逐跳定位纪律、错误分类、限额与标记

## 来源致谢

本技能整合并改写了以下公开 Agent Skill 的公开内容，配置片段均已重写与去重：

- [bagelhole/devops-security-agent-skills — reverse-proxy](https://claudeskills.info/skills/bagelhole/devops-security-agent-skills/reverse-proxy/)（nginx/Traefik 主骨架、限流、排障表）
- [pjt222 — configure-nginx](https://www.skillavatars.com/skills/configure-nginx)（Compose+certbot 编排、LB 算法表、location 优先级）
- [0xdarkmatter/claude-mods — nginx-ops](https://www.claudepluginhub.com/skills/0xdarkmatter-claude-mods/nginx-ops)（拆分式 references 结构范式）
- [fellipeutaka/leon — nginx](https://github.com/fellipeutaka/leon/blob/main/skills/nginx/SKILL.md)（location 匹配算法、upstream 参数表、anti-patterns）
- [ddnetters/homelab-agent-skills — caddy-reverse-proxy](https://github.com/ddnetters/homelab-agent-skills/blob/87d227837896c30d9307f4d98fe31140793c5d70/caddy-reverse-proxy/SKILL.md)（Caddyfile 语法、DNS challenge、Caddy↔nginx 对照）
- [ylazakovich/skills — vps-reverse-proxy-operations](https://github.com/ylazakovich/skills/blob/main/skills/devops/vps-reverse-proxy-operations/SKILL.md)（只读审计优先、备份与回滚纪律、DNS/ACME 陷阱）
- [curiositech/port-daddy — reverse-proxy-for-agents](https://skills.rest/skill/reverse-proxy-for-agents)（流式代理、粘性会话、按 key 配额）
