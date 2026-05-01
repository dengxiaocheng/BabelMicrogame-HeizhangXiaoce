# SCENE_INTERACTION_SPEC: 黑账小册

## Scene Objects and Interaction Model

### 事件碎片 (Event Fragments) — selectEvent phase

- **Visual**: 卡片/磁贴散落在桌面上。每张卡片显示事件名称 + 片段文字摘要。
- **Interaction**: 玩家点击/触碰选中一张事件卡片。选中卡片高亮并移至中央。
- **State Effect**: stash_risk += event.base_suspicion
- **Minimum**: 至少展示 3 张可选事件卡，每张显示名称和可疑度。

### 暗号小册 (Code Booklet) — encodeRecord phase

- **Visual**: 中央打开的小册，显示已选事件文本。两个控制区域：
  - 详略拨盘：3 档控制（简略 / 适中 / 详细），用滑块或旋转控件实现
  - 编码方式条：一排编码图标（速记/替换/书页/拆分），拖拽或点选应用到小册
- **Interaction**: 玩家调节详略级别并选择一种编码方式应用到小册上
- **State Effect**: evidence_clarity, stash_risk, encoding_difficulty 变化
- **Minimum**: 详略控制和编码方式选择都必须是可操作的场景对象，不能只是文字按钮。

### 藏点格 (Stash Grid) — hideEvidence phase

- **Visual**: 藏点网格布局（抽屉/书脊/地板/墙壁/盟友），每个藏点用颜色强度或图标显示风险。
- **Interaction**: 玩家将编码后的小册从中央拖到某个藏点。
- **State Effect**: stash_risk 增加，evidence_clarity 可能减少
- **Minimum**: 至少展示 3 个藏点，每个显示风险和取用难度。必须有拖拽或明确的空间选择交互。

### 搜查灯 (Searchlight) — underSearch phase

- **Visual**: 动画搜查灯光束扫过场景。显示 defense vs attack 对比。
- **Interaction**: 被动——玩家观看搜查结算过程。无玩家输入。
- **State Effect**: search_pressure 增加，如被检测到则 stash_risk 增加
- **Minimum**: 必须显示 defense/attack 数值和是否被检测到的结果。动画时长不超过 3 秒。

### 解码面板 (Decode Panel) — decodeEvidence phase

- **Visual**: 面板显示 effective_clarity 进度条、decode_cost、success_threshold、解码触发器。
- **Interaction**: 玩家点击解码触发器。结果立即显示。
- **State Effect**: evidence_clarity 调整，search_pressure -= 1，round += 1
- **Minimum**: 必须显示解码前后的 clarity 对比和成功/失败结果。

## Feedback Channels

状态栏必须实时显示所有 5 个 Required State，每个有中文标签：

| State               | Label    | Visual             |
|---------------------|----------|--------------------|
| evidence_clarity    | 证据清晰度 | 进度条/数字         |
| stash_risk          | 藏匿风险  | 热度指示器（颜色渐变） |
| encoding_difficulty | 编码难度  | 难度徽章           |
| search_pressure     | 搜查压力  | 压力表             |
| round               | 回合     | 回合计数器          |

操作反馈区必须显示每次操作引起的状态变化（用 scene-feedback.js 的 formatStateChanges）。

## Layout

```
┌──────────────────────────────────┐
│ 状态栏: clarity|risk|diff|press|rnd │
├──────────────────────────────────┤
│ 场景描述文本（scene-feedback.js）    │
├──────────────────────────────────┤
│                                  │
│ 场景对象交互区                     │
│  selectEvent: 事件卡片网格          │
│  encodeRecord: 小册+详略拨盘+编码条  │
│  hideEvidence: 藏点网格+拖拽目标     │
│  underSearch: 搜查灯动画            │
│  decodeEvidence: 解码面板           │
│                                  │
├──────────────────────────────────┤
│ 操作反馈 + 状态变化显示              │
├──────────────────────────────────┤
│ 操作日志                           │
└──────────────────────────────────┘
```

## Forbidden UI

- 不允许做笔记软件
- 不允许只用"详细/简略"按钮模拟编码
- 不允许用纯文字选择列表替代场景对象交互
- encodeRecord 必须有可调节的详略控制 + 可选择的编码方式
- 不允许用下拉菜单（select）替代场景对象
- 不允许在 underSearch 阶段要求玩家输入（此阶段为系统自动结算）

## Acceptance Rule

- 首屏必须让玩家看到至少一个可直接操作的场景对象
- 玩家操作必须产生即时可见反馈，且反馈能追溯到 Required State
- 不得只靠随机事件文本或普通选择按钮完成主循环
- 每个场景对象的操作必须映射到 content-pool.js 中定义的具体数据
- 状态栏字段必须与 game.js 的 state 属性名一致（evidence_clarity, stash_risk, encoding_difficulty, search_pressure, round）
