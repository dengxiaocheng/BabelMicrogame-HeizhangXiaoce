/**
 * Content Pool: 黑账小册
 *
 * All content serves core emotions and core loop:
 *   Core Emotions: 证据编码 + 藏匿风险 + 解码难度
 *   Core Loop: 选择事件 -> 编码记录 -> 藏匿 -> 经历搜查 -> 最终解码证据
 *
 * Scene Objects:  事件碎片, 暗号小册, 藏点格, 搜查灯, 解码面板
 * Feedback Channels: evidence_clarity, stash_risk, encoding_difficulty, search_pressure
 *
 * Required State: evidence_clarity, stash_risk, encoding_difficulty, search_pressure, round
 */

// ============================================================
// Scene Object: 事件碎片 (Event Fragments)
// Player picks which fragment to encode into the codebook.
// Tradeoff: higher evidence_value = more useful as evidence, but more suspicious to record.
// ============================================================

export const EVENT_FRAGMENTS = [
  {
    id: 'slush_fund',
    name: '灰色资金流',
    fragment_text: '资金从公用账户分三次转入私人账户，每次金额递增。',
    evidence_value: 3,
    base_suspicion: 2,
    // evidence_clarity potential at [brief, medium, detailed] encoding detail
    clarity_potential: [1, 2, 4],
    encoding_hint: '金额和时间点是核心编码目标。',
  },
  {
    id: 'ghost_vendor',
    name: '幽灵供应商',
    fragment_text: '三个从未实际供货的供应商，每月固定结算。',
    evidence_value: 4,
    base_suspicion: 3,
    clarity_potential: [1, 3, 5],
    encoding_hint: '供应商名称和结算周期需要保留。',
  },
  {
    id: 'double_book',
    name: '阴阳账目',
    fragment_text: '项目成本在两套账本中记录了不同数字。',
    evidence_value: 5,
    base_suspicion: 4,
    clarity_potential: [2, 4, 6],
    encoding_hint: '差额数字是核心证据，但也最容易暴露。',
  },
  {
    id: 'kickback_chain',
    name: '回扣链条',
    fragment_text: '合同金额按比例返还决策者，经过三层转手。',
    evidence_value: 4,
    base_suspicion: 3,
    clarity_potential: [1, 3, 5],
    encoding_hint: '转手路径比金额更关键。',
  },
  {
    id: 'wage_ghost',
    name: '空饷名单',
    fragment_text: '工资单上五个从未到岗的人员名字。',
    evidence_value: 3,
    base_suspicion: 2,
    clarity_potential: [1, 2, 4],
    encoding_hint: '名字和时间是证据核心。',
  },
  {
    id: 'expense_fabrication',
    name: '虚报费用',
    fragment_text: '连续八个月报销了不存在的出差和招待费用。',
    evidence_value: 2,
    base_suspicion: 1,
    clarity_potential: [1, 2, 3],
    encoding_hint: '日期和金额是关键，单次金额小可模糊处理。',
  },
];

// ============================================================
// Scene Object: 暗号小册 (Code Booklet)
// Encoding methods the player applies to event fragments.
// Tradeoff: higher complexity = more secure but harder to decode later.
// ============================================================

export const ENCODING_METHODS = [
  {
    id: 'personal_shorthand',
    name: '个人速记',
    description: '只有你懂的缩写和符号，快速但容易被识破。',
    complexity: 1,             // adds to encoding_difficulty
    security: 1,               // reduces stash_risk during search
    clarity_preservation: 0.9, // multiplier on evidence_clarity
  },
  {
    id: 'substitution_cipher',
    name: '替换密码',
    description: '用约定的符号替换关键信息，平衡安全和可读性。',
    complexity: 2,
    security: 2,
    clarity_preservation: 0.7,
  },
  {
    id: 'book_cipher',
    name: '书页暗码',
    description: '用书中的页码行号代替原文，安全性高但解码耗时。',
    complexity: 3,
    security: 3,
    clarity_preservation: 0.5,
  },
  {
    id: 'split_record',
    name: '拆分记录',
    description: '将一条信息拆成三份藏在不同位置，极安全但解码极难。',
    complexity: 4,
    security: 4,
    clarity_preservation: 0.3,
  },
];

// ============================================================
// Scene Object: 藏点格 (Stash Grid)
// Hiding locations where the encoded booklet is placed.
// Tradeoff: lower stash_risk = harder to access for decoding.
// ============================================================

export const STASH_POINTS = [
  {
    id: 'desk_drawer',
    name: '书桌抽屉',
    description: '藏在日常使用的书桌抽屉底部夹层。',
    stash_risk: 3,        // base detection risk (higher = more risky)
    accessibility: 3,     // retrieval ease for decode (higher = easier)
    search_resistance: 0, // defense bonus against search
  },
  {
    id: 'book_binding',
    name: '书脊夹层',
    description: '夹在常用参考书的书脊内侧。',
    stash_risk: 2,
    accessibility: 2,
    search_resistance: 1,
  },
  {
    id: 'floor_gap',
    name: '地板缝隙',
    description: '藏在办公桌下地板的一条暗缝里。',
    stash_risk: 1,
    accessibility: 1,
    search_resistance: 2,
  },
  {
    id: 'wall_crack',
    name: '墙壁暗格',
    description: '墙纸后面掏出的一个小空间。',
    stash_risk: 1,
    accessibility: 1,
    search_resistance: 3,
  },
  {
    id: 'ally_keep',
    name: '盟友保管',
    description: '交给可信赖的人暂存，风险转嫁但取用不便。',
    stash_risk: 2,
    accessibility: 1,
    search_resistance: 2,
  },
];

// ============================================================
// Scene Object: 搜查灯 (Searchlight)
// Search scenarios that test stash quality.
// Creates search_pressure; intensity scales with round.
// ============================================================

export const SEARCH_SCENARIOS = [
  {
    id: 'routine_inspection',
    name: '例行检查',
    description: '搜查灯缓缓扫过，检查表面区域。',
    search_pressure: 1,
    search_intensity: 1,
    focus_area: 'surface',
  },
  {
    id: 'surprise_sweep',
    name: '突然清场',
    description: '毫无预警的全场扫描，搜查灯覆盖每一寸空间。',
    search_pressure: 2,
    search_intensity: 2,
    focus_area: 'broad',
  },
  {
    id: 'targeted_raid',
    name: '定向突击搜查',
    description: '搜查灯聚焦特定区域，光线集中而锐利。',
    search_pressure: 3,
    search_intensity: 3,
    focus_area: 'hidden',
  },
  {
    id: 'informant_tip',
    name: '线人举报',
    description: '有人泄露了线索，搜查灯直指关键位置。',
    search_pressure: 4,
    search_intensity: 4,
    focus_area: 'any',
  },
];

// ============================================================
// Scene Object: 解码面板 (Decode Panel)
// Encoding difficulty comes back as decode cost.
// ============================================================

export const DECODE_TABLE = {
  1: { decode_cost: 1, success_threshold: 2, label: '速记可直读' },
  2: { decode_cost: 2, success_threshold: 4, label: '需要对照解码' },
  3: { decode_cost: 4, success_threshold: 6, label: '需要参考原书逐字破译' },
  4: { decode_cost: 6, success_threshold: 8, label: '需要拼合三份碎片才能还原' },
};

// ============================================================
// Content-to-State Mapping Functions
// These define how content properties produce Required State changes.
// Integration worker wires these into the game loop.
// ============================================================

/**
 * Compute state changes after encoding an event fragment.
 * @param {object} event - item from EVENT_FRAGMENTS
 * @param {object} encoding - item from ENCODING_METHODS
 * @param {number} detailLevel - 0=brief, 1=medium, 2=detailed
 * @returns {object} { evidence_clarity, stash_risk, encoding_difficulty }
 */
export function computeEncodingResult(event, encoding, detailLevel) {
  const rawClarity = event.clarity_potential[detailLevel] ?? event.clarity_potential[0];
  return {
    evidence_clarity: Math.round(rawClarity * encoding.clarity_preservation),
    stash_risk: Math.max(0, event.base_suspicion - encoding.security),
    encoding_difficulty: encoding.complexity,
  };
}

/**
 * Compute search outcome.
 * @param {object} stashPoint - item from STASH_POINTS
 * @param {object} encoding - item from ENCODING_METHODS
 * @param {object} scenario - item from SEARCH_SCENARIOS
 * @param {number} round - current round number
 * @returns {object} { search_pressure, stash_risk_change, detected, defense, attack }
 */
export function computeSearchResult(stashPoint, encoding, scenario, round) {
  const defense = stashPoint.search_resistance + encoding.security;
  const attack = scenario.search_intensity + Math.floor(round * 0.5);
  const detected = attack > defense;
  return {
    search_pressure: scenario.search_pressure + round,
    stash_risk_change: detected ? stashPoint.stash_risk : 0,
    detected,
    defense,
    attack,
  };
}

/**
 * Compute decode outcome.
 * @param {object} encoding - item from ENCODING_METHODS
 * @param {number} evidenceClarity - accumulated evidence_clarity
 * @param {object} stashPoint - item from STASH_POINTS
 * @returns {object} { decode_cost, success, effective_clarity, threshold, label }
 */
export function computeDecodeResult(encoding, evidenceClarity, stashPoint) {
  const entry = DECODE_TABLE[encoding.complexity];
  const effective_clarity = evidenceClarity + stashPoint.accessibility;
  return {
    decode_cost: entry.decode_cost,
    success: effective_clarity >= entry.success_threshold,
    effective_clarity,
    threshold: entry.success_threshold,
    label: entry.label,
  };
}

/**
 * Select search scenario appropriate to the current round.
 * Later rounds -> higher pressure scenarios.
 * @param {number} round - current round (1-based)
 * @returns {object} scenario from SEARCH_SCENARIOS
 */
export function selectSearchByRound(round) {
  const index = Math.min(round - 1, SEARCH_SCENARIOS.length - 1);
  return SEARCH_SCENARIOS[index];
}
