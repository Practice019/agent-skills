# Caddy 反向代理参考

Caddy 的核心优势：**自动 HTTPS**、配置即文档、零样板。

## Caddyfile 基础

```caddyfile
# 单服务反代（自动申请并续期证书）
app.example.com {
    reverse_proxy localhost:8080
}

# 多域名指向同一后端
app1.example.com, app2.example.com {
    reverse_proxy backend:3000
}

# 通配符 + 按需签发
*.example.com {
    tls {
        on_demand
    }
    reverse_proxy localhost:8080
}
```

HTTP → HTTPS 跳转、证书申请、证书续期**都是自动的**，不需要单独写 `server` 块。

## 路由：handle 与 matcher

```caddyfile
example.com {
    # 按路径分流（注意 handle 是按顺序匹配，不是最长前缀）
    handle /api/* {
        reverse_proxy api-server:3000
    }
    handle /static/* {
        root * /srv/static
        file_server
    }
    handle {
        reverse_proxy frontend:80      # 兜底
    }
}

# 按 Host 分流（命名 matcher）
*.example.com {
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }

    @grafana host grafana.example.com
    handle @grafana {
        reverse_proxy grafana:3000
    }

    @n8n host n8n.example.com
    handle @n8n {
        reverse_proxy n8n:5678
    }

    handle {
        respond "Not found" 404
    }
}

# 路径剥离：handle_path 会去掉匹配到的前缀
example.com {
    handle_path /api/* {
        reverse_proxy api-server:3000     # /api/users -> /users
    }
}
```

`handle` 与 `handle_path` 的区别等价于 nginx 的 `proxy_pass http://x;` 与 `proxy_pass http://x/;`。

## 负载均衡与健康检查

```caddyfile
app.example.com {
    reverse_proxy node1:8080 node2:8080 node3:8080 {
        lb_policy round_robin        # 或 least_conn / random / first / ip_hash / uri_hash
        lb_try_duration 5s
        health_uri /health
        health_interval 10s
        health_timeout 3s
    }
}
```

粘性会话用 `lb_policy ip_hash`（按客户端 IP）或 `cookie`（Caddy 2.8+ 支持 cookie 会话保持）。

## 转发头

Caddy **默认自动设置** `X-Forwarded-For`、`X-Forwarded-Proto`、`X-Forwarded-Host`、`Host`。需要覆盖或补充时：

```caddyfile
service.example.com {
    reverse_proxy backend:8080 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-Proto {scheme}
        header_up Host {upstream_hostport}
    }
}
```

## TLS / 证书三条路径

### 1. 自动 HTTPS（HTTP-01，最简）

```caddyfile
app.example.com {
    reverse_proxy localhost:8080
}
```

前提：DNS 指向本机、80/443 公网可达。

### 2. DNS challenge（通配符证书 / 80 端口不可达）

需要带 DNS 插件的构建（如 `caddybuilds/caddy-cloudflare`）：

```caddyfile
*.example.com {
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }
    @app1 host app1.example.com
    handle @app1 {
        reverse_proxy app1:8080
    }
}
```

### 3. 内网 / 自签（无公网）

```caddyfile
:80 {
    reverse_proxy localhost:8080
}

# 或用 Caddy 内部 CA 签发（需要在客户端信任 Caddy 根证书）
service.lan {
    tls internal
    reverse_proxy localhost:8080
}
```

### 限制仅内网访问

```caddyfile
service.example.com {
    @denied not remote_ip 192.168.0.0/16 10.0.0.0/8 172.16.0.0/12
    respond @denied 403

    reverse_proxy backend:8080
}
```

### HTTP/3 开关

```caddyfile
{
    servers {
        protocols h1 h2        # 显式关闭 HTTP/3（默认会监听 UDP 443）
    }
}
```

需要严格只占 TCP 80/443 时使用；确认已装版本支持该指令。

## 可维护布局（多站点）

```text
/etc/caddy/Caddyfile
/etc/caddy/snippets/common.caddy
/etc/caddy/sites-available/<subdomain>.caddy
/etc/caddy/sites-enabled/<subdomain>.caddy -> ../sites-available/<subdomain>.caddy
```

全局 `Caddyfile`：

```caddyfile
{
    email admin@example.com
}

import /etc/caddy/snippets/*.caddy
import /etc/caddy/sites-enabled/*.caddy
```

`/etc/caddy/snippets/common.caddy`（复用片段）：

```caddyfile
(common_proxy) {
    encode zstd gzip
    header {
        Strict-Transport-Security "max-age=63072000; includeSubDomains"
        X-Content-Type-Options    "nosniff"
        X-Frame-Options           "SAMEORIGIN"
        Referrer-Policy           "strict-origin-when-cross-origin"
        -Server
    }
    log {
        output file /var/log/caddy/access.log
        format json
    }
}
```

站点文件 `/etc/caddy/sites-available/app.example.com.caddy`：

```caddyfile
app.example.com {
    import common_proxy
    reverse_proxy 127.0.0.1:3000
}
```

新增站点：写 `sites-available/<域名>.caddy` → `ln -s` 到 `sites-enabled/` → `caddy reload`。

## 其他常用模式

```caddyfile
# Basic Auth（生成哈希：caddy hash-password）
admin.example.com {
    basicauth {
        admin $2a$14$REPLACE_WITH_HASH
    }
    reverse_proxy backend:8080
}

# 明文重定向
old.example.com {
    redir https://new.example.com{uri} permanent
}

# 文件服务
files.example.com {
    root * /srv/files
    file_server browse
}

# 环境变量插值
service.example.com {
    reverse_proxy {env.BACKEND_HOST}:{env.BACKEND_PORT}
}
```

## 环境变量与日志

```caddyfile
service.example.com {
    log {
        output file /var/log/caddy/access.log
        format json
        level INFO
    }
    reverse_proxy backend:8080
}
```

Caddyfile 中用 `{env.VAR_NAME}` 读环境变量。

## Docker 部署

```yaml
services:
  caddy:
    image: caddy:2-alpine
    # 通配符 / DNS challenge 用：caddybuilds/caddy-cloudflare
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"     # HTTP/3，不需要可删
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data        # 证书存这里，必须持久化
      - caddy_config:/config
    environment:
      - CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
    restart: unless-stopped

volumes:
  caddy_data:
  caddy_config:
```

同网络内的其他容器直接用**容器名**当后端地址：

```caddyfile
app.example.com {
    reverse_proxy container-name:8080
}
```

跨网络时让 caddy 同时加入两个网络：

```yaml
services:
  caddy:
    networks: [frontend, backend]
```

**数据卷警告**：`caddy_data` 丢了等于证书全丢，会触发 Let's Encrypt 速率限制。必须持久化并纳入备份。

## 管理命令

```bash
caddy validate --config /etc/caddy/Caddyfile   # 校验配置（改动后必跑）
caddy reload   --config /etc/caddy/Caddyfile   # 平滑重载，不停服
caddy adapt    --config /etc/caddy/Caddyfile   # 转成 JSON 便于调试
caddy fmt      --overwrite /etc/caddy/Caddyfile # 格式化
caddy hash-password                            # 生成 basicauth 哈希
caddy list-modules                             # 查看可用插件（含 DNS provider）

# 容器内
docker exec <caddy-container> caddy reload --config /etc/caddy/Caddyfile
```

## Caddy ↔ nginx 等价对照

| 需求 | nginx | Caddy |
|---|---|---|
| 反代 | `proxy_pass http://backend:8080;` | `reverse_proxy backend:8080` |
| 证书 | `ssl_certificate /path/fullchain.pem;` + certbot | 自动（写域名即可） |
| 路径路由 | `location /api { ... }` | `handle /api/* { ... }` |
| 剥前缀 | `location /api/` + `proxy_pass http://x/;` | `handle_path /api/* { ... }` |
| 多域名 | 多个 `server` 块 | `a.com, b.com { ... }` |
| HTTP→HTTPS | 单独 `server { return 301 ... }` | 自动 |
| 校验 + 生效 | `nginx -t && nginx -s reload` | `caddy validate && caddy reload` |
| 负载均衡 | `upstream { least_conn; ... }` | `reverse_proxy a b { lb_policy least_conn }` |
| 健康检查 | 商业版 | `health_uri /health` |
| 限流 | `limit_req_zone` + `limit_req` | 无内置，用 `rate_limit` 插件或前置代理 |
| 静态文件 | `root` + `try_files` | `root * /srv/x` + `file_server` |
| 响应压缩 | `gzip on;` | `encode zstd gzip` |
| 安全头 | `add_header X-... always;` | `header { X-... "..." }` |
| Basic Auth | `auth_basic` + htpasswd | `basicauth { user HASH }` |

**限流是 Caddy 的短板**：内置无反代层限流，需要 `caddy-ratelimit` 插件，或把限流放到应用/上游 CDN。对上文 `agent-gateway.md` 的按 key 配额场景，优先考虑 nginx 或 Traefik。

## 排障要点

| 现象 | 修复 |
|---|---|
| 证书签不下来 | 检查 DNS 是否指向本机、80/443 是否可达；否则改用 DNS challenge |
| 502 Bad Gateway | 后端没起或容器名/端口写错：`docker network ls`、`docker ps` 核对 |
| 配置不生效 | 用 `caddy reload` 而非 restart；先 `caddy validate` |
| 通配符证书失败 | 默认镜像不含 DNS 插件，需换 `caddybuilds/caddy-*` 或自建 |
| WebSocket 断连 | 通常是超时：加 `transport http { keepalive 30s }` 或调后端超时 |
| 内网服务被公网访问到 | 加 `remote_ip` matcher 限制 |
| 证书反复重新签发 | `caddy_data` 卷没持久化 |
