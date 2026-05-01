# MINI_GDD: 黑账小册

## Scope

- runtime: web (single HTML, no build step)
- duration: 20min (5 rounds × 5 phases)
- project_line: 黑账小册
- single_core_loop: 选择事件 -> 编码记录 -> 藏匿 -> 经历搜查 -> 最终解码证据

## Core Loop

1. 执行核心循环：选择事件 -> 编码记录 -> 藏匿 -> 经历搜查 -> 最终解码证据
2. 按 20 分钟节奏推进，每轮约 4 分钟：
   - Round 1-2: 基础记录，低压力搜查，玩家学习机制
   - Round 3: 编码变复杂，搜查升级，压力开始吃紧
   - Round 4-5: 高压搜查，解码关键证据，结算在即

## State

- evidence_clarity: 0+，≥6 在结算时为成功
- stash_risk: 0+，≥15 游戏结束（暴露）
- encoding_difficulty: 1-4（每轮重置）
- search_pressure: 0+，≥12 游戏结束（崩溃）
- round: 1-5，>5 进入结算

## Interaction Model

- 场景对象驱动：玩家操作视觉对象（事件卡、暗号小册、藏点格、解码面板）
- 不做笔记软件，不做纯文字选择列表
- 每个操作必须产生可追溯的状态变化

## UI

- 单页面，5 个区域：状态栏、场景描述、交互区、操作反馈、日志
- 只保留主界面、结果反馈、结算入口
- 不加多余菜单和后台页

## Content

- 6 个事件碎片（evidence_value 2-5，suspicion 1-4）
- 4 种编码方式（complexity 1-4）
- 5 个藏点（risk 1-3，accessibility 1-3）
- 4 级搜查场景（pressure 1-4，随 round 递增）
- 用小型事件池支撑主循环，一次只验证一条 Babel 创意线

## File Structure

```
index.html          — 入口和布局
src/main.js         — DOM 渲染和事件绑定
src/game.js         — 游戏逻辑（Game 类）
src/content/content-pool.js    — 事件/编码/藏点/搜查数据 + 计算函数
src/content/scene-feedback.js  — 场景描述 + 反馈文本
src/game.test.js    — 测试
```

## Constraints

- 总体规模目标控制在 5000 行以内
- 单个 worker 任务必须服从 packet budget
- 如需扩线，交回 manager 重新拆
- 所有内容数据在 content-pool.js 中定义，game.js 只引用不硬编码
