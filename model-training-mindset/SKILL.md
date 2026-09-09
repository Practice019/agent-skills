---
name: model-training-mindset
description: "用模型训练思维攻坚多步骤任务:先把大问题分解为带完成标准的小子问题并向用户确认,再对每个子问题跑 epoch 训练循环(基线 commit → 每轮一个原子改进 → 真实验证 → 通过则 commit 固化 / 失败则 reset 回退换思路),子问题之间逐级固化衔接,直到大任务完成。当用户点名模型训练思维、训练循环、epoch 循环,或需要带 checkpoint 与回退的逐步攻坚任务时使用。 Attack multi-step tasks with a model-training mindset: decompose the big problem into sub-problems with explicit completion criteria, confirm with the user, then run an epoch training loop on each (baseline commit -> one atomic improvement per round -> real verification -> commit on pass / reset and change approach on fail), freezing each sub-problem before moving on. Use when the user names the training loop or epoch loop, or when a long task needs git checkpoints, rollback, and independently verifiable steps."
whenToUse: "用户要求以模型训练/训练循环/epoch 方式工作,或长任务需要 git checkpoint、可回滚、每步可独立验证时。"
user-invocable: true
disable-model-invocation: false
---

# 模型训练思维(Model Training Mindset)

## 目标与边界

**做**:
- 把大任务当作一次训练 run:分解为有序子问题序列(里程碑),每个子问题用 epoch 训练循环攻破
- 全程只用 git 做版本控制:每步有基线 commit(checkpoint),通过 = commit 固化,失败 = reset 回退
- 诚实报告:每步报告验证命令与真实输出,不自我宣称完成

**不做**:
- ❌ 不跳过验证直接宣称完成
- ❌ 不堆积改动:每轮一个原子改进,像训练一次只更新一步权重
- ❌ 回退后不原样重试,必须带着失败原因换思路
- ❌ 不引入 git 之外的任务管理框架
- ❌ 不把多轮迭代、中途回退当失败——那是训练循环的正常过程

## 0. 前置:git 基线

开工前工作目录必须是 git 仓库:

1. 确认:`git rev-parse --is-inside-work-tree`;exit 128 表示不是仓库
2. 不是仓库:`git init`;若目录含大量历史杂物(二进制、旧项目),先写 `.gitignore` 把追踪范围收窄到交付物路径,再提交基线
3. 首次 commit = 本任务的起点 checkpoint

## 1. 第一层:任务分解(先确认,后执行)

拿到任务,先分解、不执行:

分解原则:
- 每个子问题足够小、可独立验证,有明确的完成标准(能由真实命令/真实输出判定)
- 按依赖排序:前面的完成了后面的才能做——像课程安排,先易后难,逼近最终目标
- 子问题数量与粒度不预设,按"一步一可验证"标准现场拆

把分解方案给用户确认:

```text
## 分解方案
目标:<一句话总目标>
子问题序列(按依赖序):
  S1 <名称> — 完成标准:<可验证的命令/信号>
  S2 <名称> — 完成标准:<可验证的命令/信号>
  ...
是否确认开始?
```

- 用户确认 → 进入第二层
- 用户要求调整 → 只改分解,不动执行
- 用户已声明"分解不必预先固定" → 只给总目标+总思路,执行时动态拆,每个新子问题开工前报出它的完成标准再动手

## 2. 第二层:epoch 训练循环(每个子问题)

对每个子问题执行 epoch 循环:

```text
基线 = 当前状态 git commit(该子问题的 checkpoint)
for epoch in 1..N:
    1. 原子改进:本轮只推进一个点,不一次改一堆
    2. 验证:检查完成标准是否达成(测试/构建/命令输出/结果检查)
    3. 达成/变好 → git commit 保存为新基线,下一轮继续深化
       失败/变差 → git reset --hard 回退到基线,
                   记录失败原因,换思路重试(不原样重试)
直到该子问题达成完成标准
```

原子改进的定义:一次 commit 只对应一个可独立验证的改动(如写 frontmatter、写正文某一节、修某个字段)。改动大到无法独立验证时,继续拆小。

## 3. 第三层:子问题之间的衔接

- 一个子问题通过后 `git commit` 固化,它成为后续所有工作的新起点(新基线)
- 进入下一个子问题,重复第二层循环
- 若下一个子问题反复失败(≥3 轮同类失败),允许回退到上一个已验证子问题的状态,重新规划这一步的拆分思路,再进入循环
- 循环往复,直到所有子问题全部完成——大任务完成

## 4. 纪律红线(最高优先级)

1. **绝不跳过验证直接宣称完成**——验证 = 真实命令/真实测试的输出,自我宣称无效
2. **绝不堆积改动**——每轮一个原子改进;堆积后失败将无法定位是哪处改动破坏
3. **回退后带失败原因换思路**——不原样重试
4. **多轮迭代、中途回退是正常过程**——不是失败,不需要为此道歉或解释
5. **全程只用 git**——不引入额外工具或框架(验证用的最小脚本属于"验证"步骤,不算任务管理框架)

## 5. 输出模板

### 分解方案(执行前)

```text
## 分解方案
目标:<一句话>
子问题序列:
  S1 <名称> — 完成标准:<可验证的命令/信号>
  S2 ...
是否确认开始?
```

### 单轮报告(每个 epoch 结束)

```text
[S<n> 第<k>轮]
原子改动:<本轮改了什么,一个点>
验证:<命令> → <输出摘要>
结果:达成 → commit <hash>(新基线)
    / 失败 → reset 回基线 <hash>,失败原因:<...>,下轮换思路:<...>
```

### 交付清单(收尾)

```text
交付物:
1. <文件路径>(一句话说明)
2. ...
git 历史:<commit 数>,自 <首 hash> 至 <末 hash>,每步可追溯可回滚
```

## 6. 注意事项

- 工作目录不是 git 仓库时,先 git init 再开工(见第 0 节);目录含大量历史杂物时用 `.gitignore` 把 git 追踪范围收窄到交付物路径,不要把二进制和历史杂物 commit 进库
- 完成标准必须能由"真实可运行的命令/信号"判定,不接受"看起来合理"这类模糊标准
- 进入子问题前的基线 commit 是该子问题的安全网,不可省略
- 连续 3 轮同类失败,不要在当前子问题内死磕——回退到上一个已验证子问题,重新规划分解
- 报告时如实展示验证输出;发生过失败与 reset 要一并展示,不隐瞒
- 回退用 `git reset --hard <基线 hash>`;未固化的实验性改动不要进 commit,失败直接丢弃即可
