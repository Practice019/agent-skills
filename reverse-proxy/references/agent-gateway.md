# LLM / Agent 网关的代理要点

通用反代技能都不会讲这一节。LLM 与 agent 流量的特征是：**长连接、流式响应、按 key 计费、状态敏感**，用默认反代配置必然出问题。

## 一、SSE / 流式响应（最高频故障）

默认反代会把后端响应**攒满缓冲区再一次性下发**，导致用户看到"卡住 30 秒然后一次性刷出全部内容"。必须关缓冲。

### nginx

```nginx
location /v1/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;

    proxy_buffering off;                    # 逐块转发
    proxy_cache off;
    proxy_request_buffering off;            # 请求体也流式转发（大 prompt）
    chunked_transfer_encoding on;

    proxy_set_header X-Accel-Buffering no;  # 告诉后端不要触发加速缓冲
    proxy_set_header Connection "";

    proxy_set_header Host              $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;

    proxy_read_timeout 3600s;               # 长生成时间
    proxy_send_timeout 3600s;
}
```

`proxy_read_timeout` 默认 60s：一次长推理超过 60 秒无数据到达就会被掐断。

### Caddy

```caddyfile
api.example.com {
    reverse_proxy backend:8080 {
        flush_interval -1          # -1 = 立即刷写，不做缓冲（流式必需）
        transport http {
            read_timeout  1h
            write_timeout 1h
        }
    }
}
```

### Traefik

Traefik 默认即为流式透传（不缓冲响应体），通常无需额外配置。若前置还有 CDN/其他代理，需要在那一层关缓冲。相应服务超时由后端与 `entryPoints` 的 `transport.respondingTimeouts` 控制：

```yaml
entryPoints:
  websecure:
    address: ":443"
    transport:
      respondingTimeouts:
        readTimeout: 0        # 0 = 不限，适合长流
        idleTimeout: 3600s
```

### 验证流式是否真的通

```bash
# -N 禁用 curl 自身缓冲；观察是否逐块输出而非一次性刷出
curl -N -sS -X POST https://api.example.com/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -H 'Accept: text/event-stream' \
  -d '{"model":"MODEL","stream":true,"messages":[{"role":"user","content":"count to 20"}]}' \
  | while IFS= read -r line; do printf '%s %s\n' "$(date +%T)" "$line"; done
```

**判据**：输出行的时间戳应逐条递增、跨度覆盖整个生成过程；若所有行时间戳相同或集中在末尾，说明某层仍在缓冲。

## 二、WebSocket 长连接

Agent 控制台、工具调用回传常用 WS。

### nginx

```nginx
http {
    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }

    server {
        location /ws/ {
            proxy_pass http://127.0.0.1:8080;
            proxy_http_version 1.1;
            proxy_set_header Upgrade    $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header Host       $host;

            proxy_read_timeout 86400s;   # 默认 60s：空闲连接会被误杀
            proxy_send_timeout 86400s;
            proxy_buffering off;
        }
    }
}
```

### Caddy

WebSocket 升级**自动处理**，无需额外头。只需注意超时：

```caddyfile
ws.example.com {
    reverse_proxy backend:8080 {
        transport http {
            keepalive 30s
        }
    }
}
```

### Traefik

自动处理，无需配置。长空闲连接按 `entryPoints.transport.respondingTimeouts.idleTimeout` 控制。

## 三、粘性会话（状态型 agent 丢上下文的根因）

**症状**：agent 在多副本后端后运行，多轮对话突然"失忆"、工具调用状态丢失。

**成因**：负载均衡把后续请求分发到了**另一个实例**。HTTP 请求之间没有共享状态时就会断链。

三种解法，按优先级：

### 方案 A：共享状态（首选）

把会话状态外置到 Redis/DB，让任意实例都能接管。这是唯一能同时获得**高可用 + 可弹性伸缩**的方案。

### 方案 B：粘性会话

**nginx**：

```nginx
upstream agents {
    ip_hash;                # 同客户端 IP 固定到同一后端
    server agent1:8080;
    server agent2:8080;
}
```

`ip_hash` 的局限：NAT 后的多用户会共享同一后端；后端上下线时映射会改变，仍会丢会话。

**Traefik**（cookie 粘性，比 ip_hash 更准）：

```yaml
services:
  agents:
    loadBalancer:
      sticky:
        cookie:
          name: agent_sticky
          httpOnly: true
          secure: true
          sameSite: none
```

**Caddy**：

```caddyfile
agents.example.com {
    reverse_proxy agent1:8080 agent2:8080 {
        lb_policy ip_hash
    }
}
```

### 方案 C：单副本

调试期可用，生产不可用（无高可用）。

> **判断依据**：如果会话状态包含不可序列化的内存对象（如已建立的 WS 连接池、本地缓存），粘性会话是唯一可行解；否则应改造成方案 A。

## 四、按 key / 按 IP 配额（防爆账）

LLM 网关最常见的生产事故是**一个失控客户端烧光整个月的预算**。限流必须在代理层做，不能只靠应用层。

### nginx：按 API key 限流

```nginx
http {
    # 按 Authorization 头限流（先做 map 归一化，避免头格式差异导致 zone 爆炸）
    map $http_authorization $api_key {
        default                        $http_authorization;
        "~*^Bearer\s+(?<k>.+)$"        $k;
    }

    limit_req_zone $api_key      zone=llm_key:10m   rate=60r/m;   # 每 key 每分钟 60 次
    limit_req_zone $binary_remote_addr zone=llm_ip:10m rate=120r/m;
    limit_conn_zone $api_key     zone=llm_conn:10m;

    server {
        location /v1/ {
            limit_req  zone=llm_key burst=10 nodelay;
            limit_req  zone=llm_ip  burst=20 nodelay;
            limit_conn zone=llm_conn 4;              # 每 key 最多 4 个并发
            limit_req_status 429;
            limit_conn_status 429;

            proxy_pass http://127.0.0.1:8080;
            proxy_buffering off;
            proxy_read_timeout 3600s;
        }

        # 让客户端能区分"被限流"和"上游错误"
        error_page 429 = @ratelimited;
        location @ratelimited {
            add_header Retry-After 60 always;
            add_header X-RateLimit-Scope "per-key" always;
            return 429 '{"error":{"type":"rate_limit_exceeded"}}';
        }
    }
}
```

**注意**：`limit_req` 是请求数维度，不是 token 维度。真正的**按 token 计费配额**必须在应用层实现（读取 `usage` 字段累计），代理层只能挡住请求频率和并发这类廉价攻击面。

### Traefik

```yaml
http:
  middlewares:
    llm-per-key:
      rateLimit:
        average: 60
        period: 1m
        burst: 10
        sourceCriterion:
          requestHeaderName: Authorization     # 按头限流
```

### Caddy

内置无反代层限流。需要 `caddy-ratelimit` 插件，或把限流放在 nginx / CDN 层。**按 key 限流场景优先选 nginx 或 Traefik。**

## 五、大请求体与超时配套

LLM 场景的 prompt 和图片 base64 很容易超过默认限制：

```nginx
client_max_body_size 100m;        # 默认仅 1MB，必踩 413
client_body_timeout 300s;
proxy_request_buffering off;      # 大 body 边收边转发，省磁盘和延迟
```

## 六、MCP server 反向代理要点

把 MCP（Model Context Protocol）server 放到反代后：

1. **协议是 SSE 或 streamable HTTP**——`/sse` 与 `/messages` 两个端点都要暴露，且**必须关缓冲**
2. **session 绑定**：MCP 的 SSE 会话在建立时就绑定到某个 server 实例，粘性会话或共享状态是**必需项**，不是优化项
3. **路径要全透传**：不要在反代层改写 MCP 的 `sessionId` 或消息端点路径
4. **长空闲**：MCP 连接可能长时间无消息，超时要给足

```nginx
location /mcp/ {
    proxy_pass http://127.0.0.1:9000;
    proxy_http_version 1.1;

    proxy_buffering off;
    proxy_set_header X-Accel-Buffering no;
    proxy_set_header Connection "";

    proxy_read_timeout 86400s;
    proxy_send_timeout 86400s;
    proxy_set_header Host $host;
}
```

## 七、可观测性（成本归因的前提）

不记录 usage 的网关无法做成本归因。至少要在访问日志里留下调用方标识：

```nginx
log_format llm '$remote_addr - $http_x_api_key_name [$time_local] '
               '"$request" $status $body_bytes_sent '
               'rt=$request_time urt=$upstream_response_time '
               'model=$upstream_http_x_model '
               'tokens=$upstream_http_x_usage_total';

access_log /var/log/nginx/llm.log llm;
```

若上游不回传 token 用量，需要在应用层解析 SSE 的最后一个 chunk 累计——**代理层做不到这件事**。

## 自检清单

- [ ] 流式接口已关缓冲（`proxy_buffering off` / `flush_interval -1`），并用 `curl -N` 实测逐块输出
- [ ] `proxy_read_timeout` ≥ 业务最长生成时间
- [ ] WebSocket 超时已调大且有 ping/heartbeat
- [ ] 状态型服务的会话一致性方案已明确（共享状态 > 粘性会话 > 单副本）
- [ ] 按 key 限流已生效，429 响应带 `Retry-After`
- [ ] `client_max_body_size` 已按最大 prompt 调整
- [ ] MCP 的 `/sse` 与 `/messages` 均可达且不缓冲
- [ ] 访问日志含调用方标识，可用于成本归因
