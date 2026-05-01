# MECHANIC_SPEC: 黑账小册

## Primary Mechanic

- mechanic: 证据编码 + 藏匿风险 + 解码难度
- primary_input: 把事件碎片编码成暗号并选择藏匿位置
- minimum_interaction: 玩家必须调整记录详略/暗号复杂度并把小册藏到具体藏点，影响清晰度和搜查风险

## Mechanic Steps

1. 选择要记录的事件 (selectEvent)
2. 设置编码方式 + 记录详略 (encodeRecord)
3. 选择藏点 (hideEvidence)
4. 经历搜查 (underSearch) — 系统自动结算，玩家观看
5. 解码证据 (decodeEvidence) — 玩家触发，系统结算

## State Ranges and Limits

| State               | Range   | Fail Condition         | Win Condition               |
|---------------------|---------|------------------------|-----------------------------|
| evidence_clarity    | 0+      | —                      | ≥ 6 at game end → 证据链完整 |
| stash_risk          | 0+      | ≥ 15 → 黑账暴露        | —                           |
| encoding_difficulty | 1-4     | —                      | —                           |
| search_pressure     | 0+      | ≥ 12 → 压力崩溃        | —                           |
| round               | 1-5     | > 5 → 进入结算         | —                           |

## Phase → State Math

### selectEvent
- `stash_risk += event.base_suspicion`
- `encoding_difficulty = 0` (reset for new round)

### encodeRecord
Player picks encoding method + detail level:
- detail level: 0 = 简略, 1 = 适中, 2 = 详细
- `evidence_clarity += round(event.clarity_potential[detail] * encoding.clarity_preservation)`
- `stash_risk += max(0, event.base_suspicion - encoding.security)`
- `encoding_difficulty = encoding.complexity`

### hideEvidence
Player picks stash point:
- `stash_risk += stashPoint.stash_risk`
- `evidence_clarity -= max(0, 3 - stashPoint.accessibility)` (取用难度惩罚)

### underSearch (auto-resolve)
Scenario selected by `selectSearchByRound(round)`:
- `defense = stashPoint.search_resistance + encoding.security`
- `attack = scenario.search_intensity + floor(round * 0.5)`
- `detected = attack > defense`
- `search_pressure += scenario.search_pressure + round`
- if detected: `stash_risk += stashPoint.stash_risk`

### decodeEvidence
- `effective_clarity = evidence_clarity + stashPoint.accessibility`
- `success = effective_clarity >= DECODE_TABLE[complexity].success_threshold`
- `evidence_clarity = max(0, evidence_clarity - decode_cost)`
- if success: `evidence_clarity += 2`
- `search_pressure = max(0, search_pressure - 1)`
- `round += 1`

## State Coupling (Required)

每次有效操作必须同时推动两类后果：

### encodeRecord 必须同时影响：
1. 进度压力：evidence_clarity 变化（证据积累）
2. 风险/资源压力：stash_risk 或 encoding_difficulty 变化

### hideEvidence 必须同时影响：
1. 风险压力：stash_risk 增加
2. 进度压力：evidence_clarity 可能因取用难度减少

### underSearch 必须同时影响：
1. 生存压力：search_pressure 增加
2. 风险压力：如被检测到，stash_risk 增加

### decodeEvidence 必须同时影响：
1. 进度压力：evidence_clarity 变化（解码成本 ± 成功奖励）
2. 生存压力：search_pressure 减少 1，round 推进

## Content-State Mapping (content-pool.js)

| Content       | Key Properties                              | State Impact                        |
|---------------|---------------------------------------------|--------------------------------------|
| EVENT_FRAGMENTS | evidence_value, base_suspicion, clarity_potential[3] | selectEvent → risk, encode → clarity |
| ENCODING_METHODS | complexity, security, clarity_preservation | encode → clarity, risk, difficulty   |
| STASH_POINTS  | stash_risk, accessibility, search_resistance | hide → risk, clarity; search → defense |
| SEARCH_SCENARIOS | search_pressure, search_intensity, focus_area | search → pressure, detection        |
| DECODE_TABLE  | decode_cost, success_threshold              | decode → clarity cost/gain           |

## Not A Choice List

- 不能只展示 2-4 个文字按钮让玩家选择
- encodeRecord 阶段：玩家通过操作场景对象选择编码方式和详略级别
- hideEvidence 阶段：玩家拖拽暗号小册到藏点格中的具体位置
- UI worker 必须把 primary input 映射到场景对象操作
- integration worker 必须让操作进入状态结算，而不是只写叙事反馈
