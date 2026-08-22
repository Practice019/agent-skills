---
name: project-tech-profile
description: "Analyze a project (local directory path or GitHub repository link) at the big-picture level and distill it into reusable knowledge points: tech stack, architecture layers, key concepts, and a learning path — explicitly NOT line-by-line implementation details. Use this Skill when the user hands you a project and wants to understand what technologies it uses, how it is structured, what concepts matter, and how to learn them."
---

# 项目技术画像（Project Tech Profile）

## 目标与边界

**做**：把项目提炼成"大局知识点"——技术栈清单、架构分层、关键概念、学习路径，让用户快速建立宏观认知。

**不做**：
- ❌ 不深入具体代码实现（用户不需要知道"某函数怎么写的"——那是用户让 AI 直接完成的部分）
- ❌ 不逐文件讲解源码
- ❌ 不做代码审查 / 找 bug / 性能分析

记住：用户给项目是为了**学知识**，不是为了听代码讲解。分析要像"技术记者写报道"，不像"代码审查员写报告"。

## 工作流程

### 1. 定位项目

- **本地路径**：直接扫描该目录。
- **GitHub 链接**：判断是否能直接读取（通常需先确认是否需要 clone 到临时目录再分析）；分析前先说明项目来源。

### 2. 快速扫描（识别"骨架"）

用文件工具扫描（不要陷入任何文件的具体实现）：

1. **README / 文档**：项目定位、徽章（技术栈信号）、快速开始
2. **清单文件**（识别语言与依赖）：
   - Node: `package.json`（依赖 + scripts）→ 锁文件推断包管理器（`pnpm-lock.yaml`/`yarn.lock`/`package-lock.json`/`bun.lockb`）
   - Python: `pyproject.toml` / `requirements.txt` / `uv.lock` / `Pipfile` / `poetry.lock`
   - Go: `go.mod`；Rust: `Cargo.toml`；Java/Kotlin: `pom.xml` / `build.gradle`；PHP: `composer.json`；Ruby: `Gemfile`；C#: `.csproj`；C/C++: `CMakeLists.txt`
3. **配置文件**：`.env.example`、`tsconfig.json`、`vite.config.*`、`next.config.*`、`docker-compose.yml`、`.github/workflows/`、`vercel.json`、`Dockerfile`
4. **目录结构**（只看一层/两层）：`src/`、`app/`、`lib/`、`components/`、`api/`、`tests/` 等，判断分层与模块划分

### 3. 归类技术栈

按类别整理（每项标注**作用**，一句话）：

| 类别 | 举例 |
|------|------|
| 编程语言 | TypeScript、Python、Go、Rust… |
| 运行时 | Node.js、Deno、Bun、JVM… |
| Web 框架 | Next.js、Nuxt、Express、FastAPI、Django、Spring Boot… |
| UI/前端 | React、Vue、Tailwind、shadcn/ui… |
| 状态管理/数据流 | Redux、Zustand、Pinia、TanStack Query… |
| 数据库 | PostgreSQL、MySQL、MongoDB、SQLite、Redis… |
| ORM | Prisma、SQLAlchemy、TypeORM、Drizzle… |
| 消息/缓存 | Redis、RabbitMQ、Kafka、BullMQ… |
| 工具链 | Vite、Webpack、esbuild、tsx、uv、pnpm… |
| 测试 | Vitest、Jest、pytest、Playwright… |
| CI/部署 | GitHub Actions、Docker、K8s、Vercel、Nginx… |
| AI/ML | CrewAI、LangChain、OpenAI SDK、PyTorch… |
| 其他 | WebSocket、gRPC、GraphQL、JWT、Monorepo 工具… |

### 4. 提炼架构分层

用**一张 ASCII 图 + 简短文字**描述大局：入口 → 分层/模块 → 数据流 → 基础设施。关注"有哪些层、层间怎么协作"，不关注具体实现。

### 5. 提取关键概念

列出这个项目**代表的概念/模式/术语**（用户通过它能学到这个领域通用的知识），每个配一句话解释。例如：SSR/CSR 区别、事件驱动、微服务 vs 单体、Agent 编排、ORM 与迁移、JWT 认证、Monorepo 等。

### 6. 输出学习路径

对每个**核心技术**给出：

- **是什么**：一句话定义
- **为什么用它**（相比同类方案的取舍，可选）
- **怎么学**：学习顺序 + 推荐资源（官方文档、知名教程、实践项目）
- **延伸方向**：这个技术背后值得继续深挖的领域

## 输出模板（中文，技术名词保留英文）

```markdown
# 📊 项目技术画像：<项目名>

> 来源：本地路径 / GitHub 链接（选择说明）

## 一、一句话定位
<这个项目是什么，解决什么问题>

## 二、技术栈全景
| 类别 | 技术 | 作用 |
|------|------|------|
| ... | ... | ... |

## 三、架构分层
<ASCII 图>
<简短的层间协作说明>

## 四、关键概念
- **概念名**：一句话解释（学完可迁移到其他项目）

## 五、学习路径
| 核心技术 | 是什么 | 为什么用 | 怎么学 |
|----------|--------|----------|--------|
| ... | ... | ... | 推荐资源+顺序 |

## 六、延伸方向
<如果想深入这个领域，值得探索的主题>
```

## 注意事项

- **扫描要快**：优先清单文件 + 目录结构 + 配置，不要逐个打开源码文件。
- **诚实标注**：不确定的技术标注"疑似"，识别不出就说"未识别到"。
- **用户可追问**：输出后可以问"想深入了解哪个技术？"（用户可以选择深入某个知识点，此时再展开讲解概念）。
- **粒度适中**：一个中大型项目的技术栈控制在 10–20 项，别罗列几百个依赖；只列**有大局意义**的。