# nginx 反向代理参考

## location 匹配算法

优先级从高到低：

| 修饰符 | 类型 | 示例 |
|---|---|---|
| `=` | 精确匹配 | `location = /` |
| `^~` | 前缀匹配，命中后跳过正则 | `location ^~ /images/` |
| `~` | 正则，区分大小写 | `location ~ \.php$` |
| `~*` | 正则，不区分大小写 | `location ~* \.(jpg\|png)$` |
| （无） | 普通前缀 | `location /docs/` |

**算法**：先遍历所有前缀 location（记住最长的那个）→ 若最长者带 `^~` 则直接用它 → 否则按配置顺序检查正则，**第一个命中即胜出** → 都没命中则回退到最长前缀。

## proxy_pass 尾斜杠行为（高频踩坑）

```nginx
# 带斜杠：剥掉 location 前缀
location /api/ {
    proxy_pass http://backend/;    # /api/users -> /users
}

# 不带斜杠：原样传递完整 URI
location /api/ {
    proxy_pass http://backend;     # /api/users -> /api/users
}
```

规则：`proxy_pass` 带 URI 部分（哪怕只是一个 `/`）就会做前缀替换；不带 URI 部分则原样透传。

## 基础反代（含转发头）

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host  $host;
        proxy_set_header X-Forwarded-Port  $server_port;

        proxy_connect_timeout 5s;
        proxy_read_timeout    60s;
        proxy_send_timeout    60s;
    }
}
```

`X-Forwarded-Proto` 缺失会导致后端生成 `http://` 链接 → mixed content。

## HTTPS 终止（完整安全块）

```nginx
# HTTP 全量跳转（保留 ACME 挑战路径）
server {
    listen 80;
    server_name example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    http2 on;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    ssl_protocols             TLSv1.2 TLSv1.3;
    ssl_ciphers               ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;   # TLS1.3 下交给客户端选择更优
    ssl_session_cache         shared:SSL:10m;
    ssl_session_timeout       10m;
    ssl_session_tickets       off;

    server_tokens off;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header X-Frame-Options           "SAMEORIGIN" always;
    add_header X-Content-Type-Options    "nosniff" always;
    add_header Referrer-Policy           "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy   "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'" always;

    client_max_body_size 50m;   # 默认仅 1MB，上传必踩

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~ /\. { deny all; }   # 屏蔽隐藏文件
}
```

`add_header` 注意：在 `location` 里再写 `add_header` 会**覆盖**继承来的父级头。要么全放 server 级，要么每层写全。

## 路径分流多服务

```nginx
server {
    listen 443 ssl;
    server_name app.example.com;

    ssl_certificate     /etc/letsencrypt/live/app.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.example.com/privkey.pem;

    # 前端 SPA
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API 后端（剥 /api 前缀）
    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        client_max_body_size 100m;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host       $host;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # 静态资源
    location /static/ {
        alias /var/www/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

`root` 会在后面**追加** URI，`alias` 会**替换**匹配到的 location 部分：

```nginx
location /images/ { root  /data;        }   # /images/a.jpg -> /data/images/a.jpg
location /images/ { alias /data/photos/; }  # /images/a.jpg -> /data/photos/a.jpg
```

## WebSocket（用 map 而非写死 upgrade）

```nginx
http {
    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }

    server {
        location /ws/ {
            proxy_pass http://ws_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade    $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_read_timeout 3600s;
            proxy_send_timeout 3600s;
        }
    }
}
```

写死 `Connection "upgrade"` 会让非 WebSocket 请求也带上 upgrade 语义；`map` 写法只在真有 Upgrade 头时才升级。

## 负载均衡

```nginx
upstream backend {
    least_conn;
    server backend1.example.com:3000 weight=3 max_fails=2 fail_timeout=10s;
    server backend2.example.com:3000;
    server backend3.example.com:3000 backup;
    keepalive 32;
}
```

| 策略 | 指令 | 行为 |
|---|---|---|
| 轮询 | （默认） | 均分 |
| 最少连接 | `least_conn` | 发给最闲的 |
| IP 哈希 | `ip_hash` | 同 IP 固定后端（粘性会话） |
| 加权 | `server x weight=N` | 按权重比例 |

### server 参数

| 参数 | 含义 | 默认 |
|---|---|---|
| `weight=N` | 权重 | 1 |
| `max_fails=N` | 判定不可用的失败次数 | 1 |
| `fail_timeout=T` | 失败统计窗口 + 不可用持续时间 | 10s |
| `max_conns=N` | 最大并发连接 | 0（无限） |
| `backup` | 仅在主节点全挂时启用 | — |
| `down` | 永久标记不可用 | — |

### upstream keepalive（必需配套）

```nginx
location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Connection "";   # 清空才能复用长连接
}
```

不设 `keepalive` + `Connection ""`，每个请求都会新建到后端的 TCP 连接。

## 限流与连接限制

```nginx
http {
    limit_req_zone  $binary_remote_addr zone=api_limit:10m   rate=10r/s;
    limit_req_zone  $binary_remote_addr zone=login_limit:10m rate=1r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

    server {
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            limit_req_status 429;
            proxy_pass http://127.0.0.1:8080;
        }

        location /api/auth/ {
            limit_req zone=login_limit burst=5;
            limit_req_status 429;
            proxy_pass http://127.0.0.1:8080;
        }

        location / {
            limit_conn conn_limit 100;
            proxy_pass http://127.0.0.1:3000;
        }
    }
}
```

- `rate=Nr/s` 或 `Nr/m`，漏桶算法
- `burst=N` 允许排队的超额请求
- `nodelay` 突发立即处理，不排队延迟
- 用 `$binary_remote_addr`（4/16 字节）而非 `$remote_addr`（字符串），内存省得多
- 登录/认证类端点单独用更严的 zone，不要和 API 共用

## 访问控制与内网限制

```nginx
location /admin/ {
    allow 203.0.113.0/24;
    allow 198.51.100.5;
    deny  all;
    proxy_pass http://127.0.0.1:3000;
}

# 仅内网可访问整个站点
server {
    listen 443 ssl;
    server_name internal.example.com;
    allow 192.168.0.0/16;
    allow 10.0.0.0/8;
    allow 172.16.0.0/12;
    deny  all;
    # ...
}
```

`allow`/`deny` 按顺序匹配，第一条命中的生效——`deny all` 必须放最后。

## gzip 压缩

```nginx
http {
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_vary on;
    gzip_proxied any;
    gzip_types text/plain text/css text/javascript
               application/javascript application/json
               application/xml image/svg+xml;
}
```

`text/html` 始终被压缩，不要写进 `gzip_types`。

## 性能调优

```nginx
worker_processes auto;

events {
    worker_connections 1024;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65s;
    keepalive_requests 1000;

    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

## 缓存后端响应

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/public/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 302 10m;
    proxy_cache_valid 404 1m;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    proxy_cache_bypass $http_authorization;   # 带认证的请求不走缓存
    add_header X-Cache-Status $upstream_cache_status;
    proxy_pass http://127.0.0.1:8080;
}
```

`X-Cache-Status` 是排障关键——没有它无法判断是缓存没生效还是后端慢。

## 代理缓冲（默认开启，流式场景需关）

```nginx
location /stream/ {
    proxy_buffering off;                      # 逐块转发，不攒够再发
    proxy_cache off;
    proxy_set_header X-Accel-Buffering no;    # 让后端知道不要缓冲
    proxy_read_timeout 3600s;
    proxy_pass http://127.0.0.1:8080;
}
```

## 日志

```nginx
http {
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    'rt=$request_time urt=$upstream_response_time '
                    'cache=$upstream_cache_status';

    access_log /var/log/nginx/access.log main;
    error_log  /var/log/nginx/error.log warn;

    server {
        location /health {
            access_log off;
            return 200 "OK";
        }
    }
}
```

`$upstream_response_time` 与 `$request_time` 的差值就是代理自身耗时，是定位"慢在代理还是慢在后端"的依据。

## 进程管理

```bash
nginx -t                       # 校验语法（改动后必跑）
nginx -s reload                # 平滑重载，不断连接
nginx -s quit                  # 优雅退出
nginx -s stop                  # 快速退出
nginx -s reopen                # 重开日志文件（配合 logrotate）

nginx -V 2>&1 | grep -o '\-\-conf-path=[^ ]*'   # 确认实际加载的配置路径
```

## production checklist

- [ ] `nginx -t` 通过
- [ ] `server_tokens off`
- [ ] 仅 TLSv1.2 / TLSv1.3
- [ ] HTTP → HTTPS 跳转
- [ ] HSTS 已启用
- [ ] 安全头齐备（X-Frame-Options / CSP / X-Content-Type-Options / Referrer-Policy）
- [ ] 敏感端点有限流
- [ ] `client_max_body_size` 按业务设置
- [ ] gzip 已启用
- [ ] 静态资源有 `expires` + `Cache-Control`
- [ ] 日志已配置并轮转
- [ ] 隐藏文件被拒（`location ~ /\. { deny all; }`）
- [ ] upstream 配了 `keepalive` + `proxy_http_version 1.1` + `Connection ""`
- [ ] `worker_processes auto`、`sendfile on`、`tcp_nopush on`

## anti-patterns

| 别这样 | 改成 |
|---|---|
| 用 `if` 做复杂路由 | `map` + 变量，或多个 `location` |
| 留 `server_tokens` 默认值 | `server_tokens off;` |
| 允许 TLSv1.0/1.1 | `ssl_protocols TLSv1.2 TLSv1.3;` |
| `proxy_pass` 不设 `Host` 头 | `proxy_set_header Host $host;` |
| upstream keepalive 却没设 `proxy_http_version 1.1` | 补 `proxy_http_version 1.1;` + `Connection "";` |
| 配置里硬编码后端 IP | 用 `upstream` 命名块 |
| 长请求不调超时 | 按 location 设 `proxy_read_timeout` |
| 在 `if` 块里写 `root` | `root` 放 `server` 或 `location` 级 |

## 常用变量

| 变量 | 含义 |
|---|---|
| `$host` | Host 头（或 server_name） |
| `$remote_addr` | 客户端 IP |
| `$binary_remote_addr` | 客户端 IP 二进制形式（限流 zone 用） |
| `$proxy_add_x_forwarded_for` | X-Forwarded-For + 客户端 IP |
| `$scheme` | `http` 或 `https` |
| `$request_uri` | 完整原始 URI（含查询串） |
| `$uri` | 规范化后的 URI（不含查询串） |
| `$args` | 查询串 |
| `$upstream_response_time` | 后端响应耗时 |
| `$upstream_cache_status` | 缓存命中状态 |
| `$server_port` | 接收请求的端口 |
