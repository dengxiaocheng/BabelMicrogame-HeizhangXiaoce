# MECHANIC_SPEC: 黑账小册

## Primary Mechanic

- mechanic: 证据编码 + 藏匿风险 + 解码难度
- primary_input: 把事件碎片编码成暗号并选择藏匿位置
- minimum_interaction: 玩家必须调整记录详略/暗号复杂度并把小册藏到具体藏点，影响清晰度和搜查风险

## Mechanic Steps

1. 选择要记录的事件
2. 设置编码复杂度
3. 拖到藏点
4. 经历 search_pressure 后尝试解码

## State Coupling

每次有效操作必须同时推动两类后果：

- 生存/资源/进度压力：从 Required State 中选择至少一个直接变化
- 关系/风险/秩序压力：从 Required State 中选择至少一个直接变化

## Not A Choice List

- 不能只展示 2-4 个文字按钮让玩家选择
- UI worker 必须把 primary input 映射到场景对象操作
- integration worker 必须让这个操作进入状态结算，而不是只写叙事反馈
