# ACCEPTANCE_PLAYTHROUGH: 黑账小册

## Minimum Playable Script

以下为 QA worker 和 integration worker 必须验证的最小可试玩流程。
每步标注预期状态值，基于 content-pool.js 的数据和 game.js 的逻辑。

### Playthrough A: 安全线（3 轮，压力崩溃收束）

**初始状态**: clarity=0, risk=0, diff=0, pressure=0, round=1

#### Round 1

**Step 1: selectEvent — 选择「虚报费用」(expense_fabrication)**
- 预期: stash_risk += 1 → **risk=1**, encoding_difficulty = 0
- 验证: phase 变为 encodeRecord, currentEvent.id === 'expense_fabrication'

**Step 2: encodeRecord — 选择「个人速记」(personal_shorthand), detail=2(详细)**
- clarity_potential[2] = 3, preservation = 0.9
- 预期: evidence_clarity += round(3 × 0.9) = 3 → **clarity=3**
- stash_risk += max(0, 1-1) = 0 → **risk=1**
- encoding_difficulty = 1
- 验证: phase 变为 hideEvidence

**Step 3: hideEvidence — 选择「书桌抽屉」(desk_drawer)**
- stash_risk=3, accessibility=3, search_resistance=0
- 预期: stash_risk += 3 → **risk=4**
- clarityPenalty = max(0, 3-3) = 0 → **clarity=3**
- 验证: phase 变为 underSearch

**Step 4: underSearch — routine_inspection (round=1)**
- defense = 0 + 1 = 1, attack = 1 + floor(1×0.5) = 1
- detected = 1 > 1 → false
- search_pressure += 1 + 1 = 2 → **pressure=2**
- 验证: phase 变为 decodeEvidence, lastSearchResult.detected === false

**Step 5: decodeEvidence — complexity=1**
- decode_cost=1, threshold=2, effective = 3 + 3 = 6 ≥ 2 → success
- evidence_clarity = max(0, 3-1) + 2 = 4 → **clarity=4**
- search_pressure = max(0, 2-1) = 1 → **pressure=1**
- round = 2
- 验证: phase 回到 selectEvent, round === 2

**Round 1 结束**: clarity=4, risk=4, pressure=1, round=2

#### Round 2

**Step 6: selectEvent — 选择「灰色资金流」(slush_fund)**
- 预期: stash_risk += 2 → **risk=6**

**Step 7: encodeRecord — 选择「个人速记」, detail=2(详细)**
- clarity_potential[2] = 4, preservation = 0.9
- evidence_clarity += round(4 × 0.9) = 4 → **clarity=8**
- stash_risk += max(0, 2-1) = 1 → **risk=7**
- encoding_difficulty = 1

**Step 8: hideEvidence — 选择「地板缝隙」(floor_gap)**
- stash_risk=1, accessibility=1, search_resistance=2
- stash_risk += 1 → **risk=8**
- clarityPenalty = max(0, 3-1) = 2 → **clarity=6**

**Step 9: underSearch — surprise_sweep (round=2)**
- defense = 2 + 1 = 3, attack = 2 + floor(2×0.5) = 3
- detected = 3 > 3 → false
- search_pressure += 2 + 2 = 4 → **pressure=5**

**Step 10: decodeEvidence — complexity=1**
- effective = 6 + 1 = 7 ≥ 2 → success
- evidence_clarity = max(0, 6-1) + 2 = 7 → **clarity=7**
- search_pressure = max(0, 5-1) = 4 → **pressure=4**
- round = 3

**Round 2 结束**: clarity=7, risk=8, pressure=4, round=3

#### Round 3

**Step 11: selectEvent — 选择「空饷名单」(wage_ghost)**
- stash_risk += 2 → **risk=10**

**Step 12: encodeRecord — 选择「个人速记」, detail=2(详细)**
- clarity_potential[2] = 4
- evidence_clarity += round(4 × 0.9) = 4 → **clarity=11**
- stash_risk += max(0, 2-1) = 1 → **risk=11**

**Step 13: hideEvidence — 选择「书脊夹层」(book_binding)**
- stash_risk=2, accessibility=2, search_resistance=1
- stash_risk += 2 → **risk=13**
- clarityPenalty = max(0, 3-2) = 1 → **clarity=10**

**Step 14: underSearch — targeted_raid (round=3)**
- defense = 1 + 1 = 2, attack = 3 + floor(3×0.5) = 4
- detected = 4 > 2 → **true**!
- stash_risk += 2 → **risk=15**
- search_pressure += 3 + 3 = 6 → **pressure=10**

**Step 15: decodeEvidence — complexity=1**
- effective = 10 + 2 = 12 ≥ 2 → success
- evidence_clarity = max(0, 10-1) + 2 = 11 → **clarity=11**
- search_pressure = max(0, 10-1) = 9 → **pressure=9**
- round = 4

**Round 3 结束**: clarity=11, risk=15, pressure=9, round=4

**isGameOver**: risk(15) >= 15 → **true**
**getEndResult**: risk >= 15 → **「黑账暴露」**

### Playthrough B: 快速验证（1 轮最小核心循环）

用于 smoke test，验证核心循环 5 个阶段都能走通：

1. selectEvent: 点击第一张事件卡
2. encodeRecord: 选择第一个编码方式
3. hideEvidence: 选择第一个藏点
4. underSearch: 点击「硬抗搜查」
5. decodeEvidence: 点击「开始解码」
6. 验证: round === 2, phase === 'selectEvent', 所有 state 值 > 初始值中的至少一个

## Feedback Channel Verification

试玩过程中必须验证：
1. 每次操作后状态栏数值更新
2. 操作反馈区显示状态变化文字（formatStateChanges 输出）
3. underSearch 显示 defense/attack 对比和是否被检测
4. decodeEvidence 显示解码成功/失败和 clarity 变化

## Settlement Verification

必须验证以下结局至少触发一个：
- 「黑账暴露」: stash_risk >= 15
- 「压力崩溃」: search_pressure >= 12
- 「证据链完整」: round > 5 且 evidence_clarity >= 6
- 「存活」: round > 5 且 evidence_clarity < 6

## Direction Gate

- integration worker 必须让 Playthrough B 可试玩
- qa worker 必须用测试或手工记录验证 Playthrough A 的每步状态值
- 如试玩要求需要偏离 Direction Lock，停止并回交 manager
