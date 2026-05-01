# SCENE_INTERACTION_SPEC: 黑账小册

## Scene Objects

- 事件碎片
- 暗号小册
- 藏点格
- 搜查灯
- 解码面板

## Player Input

- primary_input: 把事件碎片编码成暗号并选择藏匿位置
- minimum_interaction: 玩家必须调整记录详略/暗号复杂度并把小册藏到具体藏点，影响清晰度和搜查风险

## Feedback Channels

- evidence_clarity
- stash_risk 热度
- encoding_difficulty
- 搜查结果

## Forbidden UI

- 不允许做笔记软件
- 不允许只用“详细/简略”按钮

## Acceptance Rule

- 首屏必须让玩家看到至少一个可直接操作的场景对象
- 玩家操作必须产生即时可见反馈，且反馈能追溯到 Required State
- 不得只靠随机事件文本或普通选择按钮完成主循环
