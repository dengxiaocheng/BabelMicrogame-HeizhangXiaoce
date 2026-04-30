/**
 * Scene Feedback: 黑账小册
 *
 * Scene object descriptions and feedback text for Feedback Channels.
 * Tied to Scene Objects: 事件碎片, 暗号小册, 藏点格, 搜查灯, 解码面板
 * Tied to Feedback Channels: evidence_clarity, stash_risk, encoding_difficulty, search results
 */

// ============================================================
// Phase Scene Descriptions
// What the player sees and hears at each core loop phase.
// ============================================================

export const PHASE_SCENES = {
  selectEvent: {
    scene: '桌上散落着几张写满数字的纸条。你拿起每一张，快速扫过——这些是今天的"工作成果"，需要记进暗号小册。',
    instruction: '选择一个事件碎片，准备编码进小册。',
  },
  encodeRecord: {
    scene: '你翻开暗号小册，钢笔悬在纸面上方。用什么方式记录？记得太清楚，被搜出来就完了；记得太模糊，将来自己都看不懂。',
    instruction: '选择编码方式和记录详略。',
  },
  hideEvidence: {
    scene: '小册已经记好。你环顾四周——藏在哪里？每个藏点都有不同的风险和取用难度。',
    instruction: '把小册拖到一个藏点。',
  },
  underSearch: {
    scene: '门被推开，搜查灯的光束扫进房间。你屏住呼吸，祈祷藏匿的质量经得起考验。',
    instruction: '搜查进行中...',
  },
  decodeEvidence: {
    scene: '需要把编码的信息还原出来。解码面板上的指针颤动着——编码越复杂，解码消耗越大。',
    instruction: '解码证据。',
  },
};

// ============================================================
// Feedback Channel Text
// Maps state values to player-visible feedback.
// ============================================================

export const CLARITY_FEEDBACK = {
  low: '小册上的记录模糊不清，关键信息几乎丢失。',
  medium: '记录勉强可读，核心信息保留了大半。',
  high: '小册上的暗号清晰有力，每一个细节都完整保留。',
  critical: '完美的记录。即使经过编码，关键信息依然准确无误。',
};

export function clarityLevel(value) {
  if (value >= 5) return 'critical';
  if (value >= 3) return 'high';
  if (value >= 2) return 'medium';
  return 'low';
}

export const SEARCH_FEEDBACK = {
  safe: '搜查灯从藏点上扫过，没有停留。你的小册安全了。',
  close: '搜查灯在藏点附近徘徊了几秒，但最终移开了。差一点。',
  detected: '搜查灯停住了。光束聚焦在你的藏点上——他们发现了什么。',
  narrowly_safe: '搜查人员翻动了一下附近的物品，但没有进一步搜查。',
};

export function searchFeedbackKey(detected, defense, attack) {
  if (!detected) {
    return defense - attack >= 3 ? 'safe' : (defense - attack >= 1 ? 'narrowly_safe' : 'close');
  }
  return 'detected';
}

export const ENCODING_FEEDBACK = {
  1: '速记完成。简单的编码让你快速记录，但安全性存疑。',
  2: '替换密码写好了。需要对照才能阅读，安全性有所提高。',
  3: '书页暗码编码完毕。每一条信息都变成了页码和行号，安全性很高。',
  4: '拆分记录完成。一条信息分成了三份，安全性极高，但重新拼合会很困难。',
};

// ============================================================
// State Change Display
// ============================================================

export function formatStateChanges(changes) {
  const parts = [];
  if (changes.evidence_clarity !== undefined && changes.evidence_clarity !== 0) {
    parts.push(`证据清晰度 ${changes.evidence_clarity > 0 ? '+' : ''}${changes.evidence_clarity}`);
  }
  if (changes.stash_risk !== undefined && changes.stash_risk !== 0) {
    parts.push(`藏匿风险 ${changes.stash_risk > 0 ? '+' : ''}${changes.stash_risk}`);
  }
  if (changes.encoding_difficulty !== undefined && changes.encoding_difficulty !== 0) {
    parts.push(`编码难度 ${changes.encoding_difficulty > 0 ? '+' : ''}${changes.encoding_difficulty}`);
  }
  if (changes.search_pressure !== undefined && changes.search_pressure !== 0) {
    parts.push(`搜查压力 ${changes.search_pressure > 0 ? '+' : ''}${changes.search_pressure}`);
  }
  return parts.join(' | ');
}

// ============================================================
// Endings
// ============================================================

export const ENDINGS = {
  exposed: {
    title: '黑账暴露',
    description: '你的暗号小册被搜了出来，编码方式被破解。所有记录成了铁证。',
  },
  breakdown: {
    title: '压力崩溃',
    description: '搜查一次又一次，你再也承受不住了。小册从手中滑落。',
  },
  decoded: {
    title: '证据链完整',
    description: '你成功解码了所有关键证据。完整的黑账记录在你手中，等待结算。',
  },
  resource_depleted: {
    title: '解码失败',
    description: '编码太复杂，你耗尽了所有精力也无法还原证据。信息永远丢失了。',
  },
  survived: {
    title: '存活',
    description: '你在高压下保存了部分证据，虽然不完整，但足以自保。',
  },
};
