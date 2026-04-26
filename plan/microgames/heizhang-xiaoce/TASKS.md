# TASKS: 黑账小册

本文件保留给旧入口兼容；任务真源见 `TASK_BREAKDOWN.md`。

# TASK_BREAKDOWN: 黑账小册

## Standard Worker Bundle

1. `heizhang-xiaoce-foundation`
   - lane: foundation
   - level: M
   - goal: 建立只服务「选择事件 -> 编码记录 -> 藏匿 -> 经历搜查 -> 最终解码证据」的可运行骨架

2. `heizhang-xiaoce-state`
   - lane: logic
   - level: M
   - goal: 实现 Direction Lock 状态的一次分配/操作结算

3. `heizhang-xiaoce-content`
   - lane: content
   - level: M
   - goal: 用事件池强化「证据编码 + 藏匿风险 + 解码难度」

4. `heizhang-xiaoce-ui`
   - lane: ui
   - level: M
   - goal: 让玩家看见核心压力、可选操作和后果反馈

5. `heizhang-xiaoce-integration`
   - lane: integration
   - level: M
   - goal: 把已有 state/content/ui 接成单一主循环

6. `heizhang-xiaoce-qa`
   - lane: qa
   - level: S
   - goal: 用测试和 scripted playthrough 确认方向没跑偏
