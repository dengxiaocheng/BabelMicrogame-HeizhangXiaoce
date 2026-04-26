# CREATIVE_CARD: 黑账小册

- slug: `heizhang-xiaoce`
- creative_line: 黑账小册
- target_runtime: web
- target_minutes: 20
- core_emotion: 证据编码 + 藏匿风险 + 解码难度
- core_loop: 选择事件 -> 编码记录 -> 藏匿 -> 经历搜查 -> 最终解码证据
- failure_condition: 关键状态崩溃，或在本轮主循环中被系统淘汰
- success_condition: 在限定时长内完成主循环，并稳定进入至少一个可结算结局

## Intent

- 做一个 Babel 相关的单创意线微游戏
- 只保留一个主循环，不扩成大项目
- 让 Claude worker 能按固定 packet 稳定并行
