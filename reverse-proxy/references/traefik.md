# Traefik 反向代理参考

Traefik 的核心优势：**服务自动发现**（Docker/K8s label）+ 内置 dashboard。配置分两层：

- **静态配置**（`traefik.yml`）：入口点、证书解析器、provider、日志——**启动时读取，改动需重启**
- **动态配置**（file provider / Docker labels）：routers、services、middlewares——**热加载，无需重启**

## 静态配置 `traefik.yml`

```yaml
entryPoints:
  web:
    address: ":80"
    http:
      redirections:                 # 全站 HTTP -> HTTPS
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /letsencrypt/acme.json     # 权限必须是 600，否则 Traefik 拒绝启动
      httpChallenge:
        entryPoint: web
      # 通配符证书改用 DNS challenge：
      # dnsChallenge:
      #   provider: cloudflare
      #   resolvers: ["1.1.1.1:53"]

providers:
  docker:
    exposedByDefault: false         # 关键：不给 label 的容器一律不暴露
    network: traefik_default
  file:
    directory: /etc/traefik/dynamic
    watch: true

api:
  dashboard: true
  insecure: false                   # 不要开 true，dashboard 会裸奔在 8080

log:
  level: INFO

accessLog:
  filePath: /var/log/traefik/access.log
```

**两个必踩点**：
1. `acme.json` 权限不是 `600` → Traefik 启动失败：`chmod 600 /letsencrypt/acme.json`
2. `exposedByDefault: true`（默认值）→ 所有容器自动公开

## 动态配置（file provider）

`/etc/traefik/dynamic/services.yml`：

```yaml
http:
  routers:
    app:
      rule: "Host(`app.example.com`)"
      entryPoints: [websecure]
      service: app
      tls:
        certResolver: letsencrypt
      middlewares: [security-headers, rate-limit]

    api:
      rule: "Host(`app.example.com`) && PathPrefix(`/api`)"
      entryPoints: [websecure]
      service: api
      tls:
        certResolver: letsencrypt
      middlewares: [security-headers, api-ratelimit]

  services:
    app:
      loadBalancer:
        servers:
          - url: "http://127.0.0.1:3000"
        healthCheck:
          path: /health
          interval: 10s
          timeout: 3s
        # 粘性会话
        sticky:
          cookie:
            name: traefik_sticky
            httpOnly: true
            secure: true

    api:
      loadBalancer:
        servers:
          - url: "http://127.0.0.1:8080"
        healthCheck:
          path: /api/health
          interval: 10s
          timeout: 3s

  middlewares:
    security-headers:
      headers:
        stsSeconds: 63072000
        stsIncludeSubdomains: true
        frameDeny: true
        contentTypeNosniff: true
        referrerPolicy: strict-origin-when-cross-origin
        customResponseHeaders:
          Server: ""

    rate-limit:
      rateLimit:
        average: 100
        burst: 50
        period: 1m

    api-ratelimit:
      rateLimit:
        average: 20
        burst: 10
        period: 1s
```

`rule` 语法用反引号包裹表达式，`&&` 连接条件。常用 matcher：`Host()`、`PathPrefix()`、`Path()`、`Headers()`、`Method()`、`Query()`、`ClientIP()`。

## Docker labels 自动发现（Traefik 最大价值）

```yaml
services:
  traefik:
    image: traefik:v3.0
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro     # 只读挂载
      - ./traefik.yml:/etc/traefik/traefik.yml:ro
      - ./dynamic:/etc/traefik/dynamic:ro
      - letsencrypt:/letsencrypt
    environment:
      - CF_DNS_API_TOKEN=${CF_DNS_API_TOKEN}
    restart: unless-stopped

  frontend:
    image: my-frontend:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`app.example.com`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=3000"

  api:
    image: my-api:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`app.example.com`) && PathPrefix(`/api`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      - "traefik.http.services.api.loadbalancer.server.port=8080"
      - "traefik.http.routers.api.middlewares=api-ratelimit@file"
      - "traefik.http.middlewares.api-ratelimit.ratelimit.average=50"
      - "traefik.http.middlewares.api-ratelimit.ratelimit.burst=25"

volumes:
  letsencrypt:
```

label 的命名结构：`traefik.http.<routers|services|middlewares>.<名字>.<属性>`。

**用 Docker provider 时，容器目标端口不会被自动感知**——必须显式写 `loadbalancer.server.port`，否则路由到错误的端口。

## 中间件常用项

```yaml
http:
  middlewares:
    # 剥离前缀
    strip-api:
      stripPrefix:
        prefixes: ["/api"]
        forceSlash: false

    # 添加前缀
    add-api:
      addPrefix:
        prefix: "/api"

    # HTTP Basic Auth（htpasswd 格式的字符串）
    auth:
      basicAuth:
        users:
          - "admin:$apr1$REPLACE_WITH_HTPASSWD_HASH"

    # IP 白名单
    internal-only:
      ipAllowList:
        sourceRange:
          - 192.168.0.0/16
          - 10.0.0.0/8

    # 重定向
    redirect-www:
      redirectRegex:
        regex: "^https://example\\.com/(.*)"
        replacement: "https://www.example.com/${1}"
        permanent: true
```

## 校验与排障

**Traefik 没有独立的配置校验命令**——静态配置错误会导致启动失败，动态配置错误会写进日志。校验方式是看日志：

```bash
# 启动/重启后立刻看日志
docker compose logs --tail=80 traefik

# 确认 dashboard（生产环境应关闭或加访问控制）
# api.insecure: false 时通过 label 暴露 dashboard 路由
```

| 现象 | 成因 | 修复 |
|---|---|---|
| 所有路由返回 404 | Docker provider 没发现容器 | 确认 socket 已挂载、`exposedByDefault` 设置、容器与 traefik 在同一网络 |
| 启动即崩 | `acme.json` 权限不对 | `chmod 600 /letsencrypt/acme.json` |
| 证书签不下来 | DNS 未指向 / 80 端口被占 | 检查 `httpChallenge.entryPoint` 指向的入口点确实监听 80 |
| 通配符证书失败 | 未配 `dnsChallenge` | 只用 `httpChallenge` 无法签通配符 |
| 路由到错误端口 | 缺 `loadbalancer.server.port` | 显式声明容器内端口 |
| 中间件不生效 | 跨 provider 引用没加后缀 | file provider 的中间件引用要写 `名字@file` |
| 容器重启后路由丢失 | 用了 file provider 硬编码容器 IP | 改用 Docker provider + labels |

## nginx ↔ Traefik 对照

| 需求 | nginx | Traefik |
|---|---|---|
| 域名路由 | `server_name` | `rule: Host(...)` |
| 路径路由 | `location /api/` | `rule: PathPrefix('/api')` |
| 反代目标 | `proxy_pass http://127.0.0.1:8080;` | `services.*.loadBalancer.servers[].url` |
| 剥前缀 | `proxy_pass http://x/;` | `middlewares.stripPrefix` |
| 限流 | `limit_req_zone` + `limit_req` | `middlewares.rateLimit.average/burst` |
| 安全头 | `add_header` | `middlewares.headers` |
| 健康检查 | 商业版 | `healthCheck.path` |
| 粘性会话 | `ip_hash` | `loadBalancer.sticky.cookie` |
| 服务发现 | 手写 `upstream` | Docker/K8s provider 自动 |
| 校验 | `nginx -t` | 无，看日志 |
| 生效 | `nginx -s reload` | 动态配置热加载 |
