# 反向代理排障对照表

## 快速诊断入口

```bash
# 1) 代理进程活着吗
systemctl status nginx caddy 2>/dev/null; docker ps | grep -E 'traefik|caddy|nginx'

# 2) 配置校验过了吗
sudo nginx -t
sudo caddy validate --config /etc/caddy/Caddyfile
docker compose logs --tail=80 traefik

# 3) 谁在监听 80/443
sudo ss -tulpn | grep -E ':(80|443)\b'

# 4) 后端活着吗（从代理主机上直接打后端）
curl -sS -o /dev/null -w '%{http_code} %{time_total}s\n' http://127.0.0.1:3000/health

# 5) 边看日志边复现
sudo tail -f /var/log/nginx/error.log
```

## 症状 → 成因 → 修复

### 502 Bad Gateway

| 项 | 内容 |
|---|---|
| 成因 | 后端没起、端口写错、后端只监听 `127.0.0.1` 而代理在另一容器/主机、SELinux 拦截 |
| 诊断 | `curl -v http://127.0.0.1:<port>/` 从**代理所在的命名空间**打；`docker exec <nginx> curl -v http://backend:3000/`；`tail /var/log/nginx/error.log` 看 `connect() failed` |
| 修复 | 修正 `proxy_pass` 目标；后端改监听 `0.0.0.0` 或让代理加入同一 Docker 网络（**优先**，不要为省事把后端暴露到公网）；`setsebool -P httpd_can_network_connect 1` |

跨 Docker 容器的 502 有 90% 是"用了 `localhost` 而不是容器名"。

### 504 Gateway Timeout

| 项 | 内容 |
|---|---|
| 成因 | 后端处理超过 `proxy_read_timeout`（默认 60s）；后端卡死；数据库慢查询 |
| 诊断 | 日志看 `$upstream_response_time`；`curl -w '%{time_total}'` 直接打后端测真实耗时 |
| 修复 | 按 location 提高 `proxy_read_timeout` / `proxy_send_timeout`；**同时**排查后端为何慢——单纯调大超时只是把问题藏起来 |

### 413 Request Entity Too Large

| 项 | 内容 |
|---|---|
| 成因 | `client_max_body_size` 默认仅 1MB |
| 诊断 | 错误日志明确写 `client intended to send too large body` |
| 修复 | 对应 server/location 加 `client_max_body_size 50m;`；上传类接口单独放宽，不要全局放开 |

### Mixed content 警告（HTTPS 页面加载 http 资源）

| 项 | 内容 |
|---|---|
| 成因 | 未设 `X-Forwarded-Proto`，后端以为自己在 HTTP 上，生成了 `http://` 链接 |
| 诊断 | `curl -sSI https://example.com/ \| grep -i x-forwarded`；浏览器控制台看被拦的 URL |
| 修复 | `proxy_set_header X-Forwarded-Proto $scheme;` 并确认后端框架信任该头（如 Django `SECURE_PROXY_SSL_HEADER`、Express `trust proxy`） |

后端"不信任代理头"是这条的第二层坑——只加头不改后端配置仍会出错。

### WebSocket 60 秒后断开

| 项 | 内容 |
|---|---|
| 成因 | `proxy_read_timeout` 默认 60s，空闲连接被判定超时 |
| 诊断 | 断开时间点与 60s 高度吻合；error log 有 `upstream timed out` |
| 修复 | WS location 设 `proxy_read_timeout 86400s; proxy_send_timeout 86400s;`；同时让后端发 ping 帧保活（只调超时不如加心跳） |

### 流式响应"卡住后一次性刷出"

| 项 | 内容 |
|---|---|
| 成因 | 代理缓冲了响应体 |
| 诊断 | `curl -N ...` 输出行时间戳全部集中在末尾 |
| 修复 | `proxy_buffering off; proxy_cache off;` + `X-Accel-Buffering: no`（Caddy 用 `flush_interval -1`） |

### 429 Too Many Requests（正常用户被误伤）

| 项 | 内容 |
|---|---|
| 成因 | 限流 zone 太粗（全站一个 zone）、`rate` 太低、NAT 后多用户共享 IP |
| 诊断 | 看 429 触发的路径分布；确认 `$binary_remote_addr` 是否把整栋楼用户算作一个 |
| 修复 | 按端点分 zone；登录类单独收紧、静态类直接豁免；改用 `$http_authorization` 等业务维度替代 IP；调大 `burst` |

### 证书无法签发（ACME 失败）

| 项 | 内容 |
|---|---|
| 成因 | DNS A/AAAA 未指向本机；80 端口被占或被防火墙拦；`.well-known/acme-challenge/` 被重定向吞掉；递归 DNS 缓存返回旧值 |
| 诊断 | `dig +short A example.com`、`dig +short AAAA example.com`、`dig +trace A example.com \| tail -20`；`curl -sSI http://example.com/.well-known/acme-challenge/test` |
| 修复 | 修正 A/AAAA（**AAAA 指向别处同样会让签发失败**，要么指对要么删掉）；把 ACME 路径的 location 放在 `return 301` 之前；等权威 DNS 传播；用 `curl --resolve example.com:443:<ip>` 绕过本地解析做端到端验证 |

### TLS 握手失败 / 浏览器报证书链不全

| 项 | 内容 |
|---|---|
| 成因 | `ssl_certificate` 只配了站点证书，未含中间证书 |
| 诊断 | `openssl s_client -connect example.com:443 -servername example.com -showcerts` 看返回的链条长度 |
| 修复 | 用带中间证书的 `fullchain.pem`（Let's Encrypt 的 `fullchain.pem` 已包含）；验证 `openssl x509 -noout -subject -issuer -dates -ext subjectAltName` |

### Traefik 所有路由 404

| 项 | 内容 |
|---|---|
| 成因 | Docker provider 没发现容器；socket 未挂载；`exposedByDefault` 配置不符；代理与容器不在同一网络 |
| 诊断 | 看 Traefik 日志有无 provider 扫描记录；访问 dashboard 查看 routers 是否注册 |
| 修复 | 挂载 `/var/run/docker.sock:ro`；容器加 `traefik.enable=true`；确认网络一致；**用 Docker provider 时必须显式写 `loadbalancer.server.port`** |

### 服务莫名其妙能从公网访问

| 项 | 内容 |
|---|---|
| 成因 | Compose 里 `ports: - "5432:5432"` 无 IP 限定 → 绑到 `0.0.0.0`；Docker 经 iptables 发布端口，**UFW 状态不反映真实暴露面** |
| 诊断 | `docker ps --format '{{.Names}}\t{{.Ports}}'`；`sudo ss -tulpn`；`nmap -Pn -p 5432,6379,3000 <public-ip>` 从外部验证 |
| 修复 | 全部改为 `127.0.0.1:${PORT}:${PORT}`；或让服务只加入内部 Docker 网络不发布端口；数据库/Redis/队列永不公网发布 |

### ACME 续期失败（运行一段时间后突然到期）

| 项 | 内容 |
|---|---|
| 成因 | 续期定时器没跑；webroot 路径权限变化；80 端口后来被别的服务占用 |
| 诊断 | `systemctl status certbot.timer`；`sudo certbot renew --dry-run`；`caddy` 看日志中的续期记录 |
| 修复 | 恢复 timer；修 webroot 权限；**不要新增长期占用 80 的服务**（ACME HTTP-01 依赖 80）；改用 DNS challenge 可绕开 80/443 |

## 通用诊断命令

```bash
# 端到端链路（含转发头与耗时分解）
curl -sS -o /dev/null -w 'dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total} code=%{http_code}\n' https://example.com/

# 指定 IP 验证（DNS 未生效时用）
curl -sSI --resolve example.com:443:<vps-ip> https://example.com/

# 单独校验证书 SAN
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName

# 看响应头是否带了预期安全头与转发头
curl -sSI https://example.com/ | grep -iE 'strict-transport|x-frame|x-content-type|referrer-policy|x-forwarded|server'

# 压力验证限流是否真的生效
for i in $(seq 1 200); do curl -s -o /dev/null -w '%{http_code}\n' https://example.com/api/ping; done | sort | uniq -c
```

## 排障纪律

1. **先看 error.log，不要先改配置**——90% 的答案在日志里
2. **确认故障在代理层还是后端层**——从代理主机直接 `curl` 后端，绕开代理
3. **一次只改一个变量**——同时改超时和缓冲会让你无法判断哪个生效了
4. **改完必给回滚**——把回滚命令和验证命令配对写在交付里
