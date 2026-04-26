# MINI_GDD: 黑账小册

## Scope

- runtime: web
- duration: 20min
- project_line: 黑账小册
- single_core_loop: 选择事件 -> 编码记录 -> 藏匿 -> 经历搜查 -> 最终解码证据

## Core Loop
1. 执行核心循环：选择事件 -> 编码记录 -> 藏匿 -> 经历搜查 -> 最终解码证据
2. 按 20 分钟节奏推进：基础记录 -> 搜查 -> 编码变复杂 -> 解码关键证据

## State

- resource
- pressure
- risk
- relation
- round

## UI

- 只保留主界面、结果反馈、结算入口
- 不加多余菜单和后台页

## Content

- 用小型事件池支撑主循环
- 一次只验证一条 Babel 创意线

## Constraints

- 总体规模目标控制在 5000 行以内
- 单个 worker 任务必须服从 packet budget
- 如需扩线，交回 manager 重新拆
