# TASK_BREAKDOWN: 黑账小册

## Worker Dependency Graph

```
foundation ──┐
             ├──> state ──┐
             │             ├──> content ──┐
             │             │              ├──> ui ──┐
             │             │              │         ├──> integration ──> qa
             │             │              │         │
             └─────────────┴──────────────┴─────────┘
```

foundation 必须先完成。state 和 content 可并行。ui 依赖 content 数据。integration 依赖所有其他。qa 最后。

---

## 1. heizhang-xiaoce-foundation

- **lane**: foundation
- **level**: M
- **goal**: 建立可运行的 HTML 入口 + 空游戏骨架，让后续 worker 有文件可填充

### File Contract
- `index.html` — 游戏入口，含 CSS 布局骨架（状态栏/场景区/交互区/反馈区/日志）
- `src/game.js` — Game 类骨架：constructor 初始化 Required State，空 phase 方法
- `src/main.js` — 最小 DOM 渲染入口

### Acceptance
- `index.html` 可在浏览器打开，不报错
- Game 类 constructor 产出完整 Required State（evidence_clarity=0, stash_risk=0, encoding_difficulty=0, search_pressure=0, round=1）
- 状态栏显示 5 个 Required State 的初始值

### Forbidden
- 不填充事件内容或编码逻辑
- 不实现场景对象交互
- 不引入外部依赖

### Serves Primary Input
- 提供空骨架让后续 worker 填入事件选择、编码操作、藏匿交互

---

## 2. heizhang-xiaoce-state

- **lane**: logic
- **level**: M
- **goal**: 实现 game.js 的完整游戏逻辑：5 阶段流转、状态计算、结算判断

### File Contract
- `src/game.js` — 完整 Game 类：阶段流转、executeAction、状态数学、isGameOver、getEndResult

### Acceptance
- 5 阶段顺序流转：selectEvent → encodeRecord → hideEvidence → underSearch → decodeEvidence → selectEvent(下一轮)
- 每个阶段的状态变化符合 MECHANIC_SPEC Phase → State Math
- isGameOver 正确判断 3 个终止条件（risk≥15, pressure≥12, round>5）
- getEndResult 正确返回 4 种结局
- `npm test` 通过 game.test.js 中所有测试
- 状态耦合：每次操作至少改变一个进度状态和一个风险/生存状态

### Forbidden
- 不修改 index.html 或 main.js
- 不修改 content-pool.js 中的数据值
- 不引入外部依赖

### Serves Primary Input
- 状态数学直接服务编码选择和藏匿位置如何影响清晰度和风险

---

## 3. heizhang-xiaoce-content

- **lane**: content
- **level**: M
- **goal**: 用事件池 + 编码方式 + 藏点 + 搜查场景 + 解码表强化核心循环

### File Contract
- `src/content/content-pool.js` — EVENT_FRAGMENTS, ENCODING_METHODS, STASH_POINTS, SEARCH_SCENARIOS, DECODE_TABLE + 计算函数
- `src/content/scene-feedback.js` — PHASE_SCENES, 反馈文本, formatStateChanges, ENDINGS

### Acceptance
- 至少 5 个事件碎片，覆盖 evidence_value 2-5
- 4 种编码方式，complexity 1-4
- 至少 4 个藏点，stash_risk 1-3
- 4 级搜查场景，search_pressure 随 round 递增
- computeEncodingResult, computeSearchResult, computeDecodeResult 输出符合 MECHANIC_SPEC
- 场景描述文本覆盖所有 5 个阶段
- 反馈文本覆盖 clarity 低/中/高/极高

### Forbidden
- 不修改 game.js 的逻辑
- 不修改 index.html 或 main.js
- 不引入外部依赖

### Serves Primary Input
- 事件碎片提供选择的素材，编码方式提供操作手段，藏点提供藏匿空间

---

## 4. heizhang-xiaoce-ui

- **lane**: ui
- **level**: M
- **goal**: 把 game.js 的 availableActions 渲染成场景对象交互，替代纯按钮列表

### File Contract
- `src/main.js` — 场景对象渲染：事件卡片、暗号小册+详略拨盘+编码条、藏点网格、搜查灯动画、解码面板
- `index.html` — 更新 CSS 支持场景对象视觉样式

### Acceptance
- 状态栏显示 5 个 Required State，标签为中文（证据清晰度/藏匿风险/编码难度/搜查压力/回合）
- selectEvent: 至少 3 张可点击的事件卡片，显示名称和关键属性
- encodeRecord: 详略控制（3档）+ 编码方式选择，不是纯文字按钮
- hideEvidence: 至少 3 个藏点，显示风险/取用属性，有拖拽或空间选择交互
- underSearch: 显示搜查动画 + defense/attack 结果
- decodeEvidence: 显示解码前后的 clarity 对比
- 每次操作后显示状态变化反馈
- 不使用 `s.resource / s.pressure / s.risk / s.relation`（旧字段名），必须用 `s.evidence_clarity / s.stash_risk / s.encoding_difficulty / s.search_pressure / s.round`

### Forbidden
- 不修改 game.js 的逻辑
- 不修改 content-pool.js 的数据
- 不做纯按钮列表（每阶段只展示 2-4 个文字按钮）
- 不做笔记软件功能
- 不引入外部 CSS/JS 框架

### Serves Primary Input
- 场景对象交互让玩家的编码选择和藏匿操作可视化、可操作

---

## 5. heizhang-xiaoce-integration

- **lane**: integration
- **level**: M
- **goal**: 把 state/content/ui 接成单一主循环，让 ACCEPTANCE_PLAYTHROUGH 的 Playthrough B 可试玩

### File Contract
- 协调 `src/game.js`, `src/main.js`, `src/content/content-pool.js`, `src/content/scene-feedback.js` 的对接
- 确保主循环完整：从 selectEvent 到结算画面

### Acceptance
- Playthrough B（ACCEPTANCE_PLAYTHROUGH.md）可完整走通
- 每步状态值与预期一致
- 结局画面正确显示（标题 + 描述 + 重新开始按钮）
- 无控制台错误

### Forbidden
- 不偏离 Direction Lock 的核心循环
- 不修改 content-pool.js 的数值平衡（如需调整，在 report 中建议）
- 不引入新的游戏机制或第二套主循环

### Serves Primary Input
- 确保编码选择和藏匿操作的完整闭环

---

## 6. heizhang-xiaoce-qa

- **lane**: qa
- **level**: S
- **goal**: 用测试和 scripted playthrough 确认方向没跑偏

### File Contract
- `src/game.test.js` — 补充测试覆盖 Playthrough A 的状态验证
- 可能微调测试以匹配最新 game.js 接口

### Acceptance
- `npm test` 全部通过
- Playthrough A 每步状态值与 ACCEPTANCE_PLAYTHROUGH.md 预期一致
- 所有 4 种结局可通过测试触发
- State coupling 测试覆盖每个阶段

### Forbidden
- 不修改 game.js 逻辑
- 不修改 content-pool.js 数据
- 不修改 main.js 或 index.html
- 如发现方向问题，写 report 不改代码

### Serves Primary Input
- 验证编码+藏匿操作的数学正确性
