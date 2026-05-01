import {
  EVENT_FRAGMENTS,
  ENCODING_METHODS,
  STASH_POINTS,
  computeEncodingResult,
  computeSearchResult,
  computeDecodeResult,
  selectSearchByRound,
} from './content/content-pool.js';

const PHASES = ['selectEvent', 'encodeRecord', 'hideEvidence', 'underSearch', 'decodeEvidence'];

const MAX_ROUNDS = 5;
const RISK_LIMIT = 15;
const PRESSURE_LIMIT = 12;
const CLARITY_SUCCESS = 6;

export class Game {
  constructor() {
    this.state = {
      evidence_clarity: 0,
      stash_risk: 0,
      encoding_difficulty: 0,
      search_pressure: 0,
      round: 1,
    };
    this.currentPhase = 'selectEvent';
    this.phaseIndex = 0;
    this.currentEvent = null;
    this.currentEncoding = null;
    this.currentStashPoint = null;
    this.currentDetailLevel = 1;
    this.lastSearchResult = null;
    this.lastDecodeResult = null;
  }

  phaseDescription() {
    switch (this.currentPhase) {
      case 'selectEvent':
        return '选择一个需要记录的事件碎片。不同事件的证据价值和可疑度不同。';
      case 'encodeRecord':
        return `为「${this.currentEvent.name}」选择编码方式。编码越复杂越安全，但解码也越难。`;
      case 'hideEvidence':
        return '选择藏匿位置。藏得越隐蔽越安全，但取用越困难。';
      case 'underSearch':
        return '搜查进行中！你的藏匿质量将接受考验。';
      case 'decodeEvidence':
        return '最终阶段：解码证据。编码越复杂，需要越高的清晰度才能成功。';
      default:
        return '';
    }
  }

  availableActions() {
    switch (this.currentPhase) {
      case 'selectEvent':
        return EVENT_FRAGMENTS.map((e) => ({
          id: 'selectEvent',
          target: e.id,
          label: e.name,
          event: e,
        }));
      case 'encodeRecord':
        return ENCODING_METHODS.map((m) => ({
          id: 'encode',
          label: `${m.name} (复杂度${m.complexity}/安全${m.security}/清晰度保留${Math.round(m.clarity_preservation * 100)}%)`,
          encoding: m,
        }));
      case 'hideEvidence':
        return STASH_POINTS.map((s) => ({
          id: 'hide',
          label: `${s.name} (风险${s.stash_risk}/取用${s.accessibility}/防御${s.search_resistance})`,
          stashPoint: s,
        }));
      case 'underSearch':
        return [{ id: 'endure', label: '硬抗搜查' }];
      case 'decodeEvidence':
        return [{ id: 'decode', label: '开始解码' }];
      default:
        return [];
    }
  }

  executeAction(action) {
    switch (this.currentPhase) {
      case 'selectEvent':
        this._doSelectEvent(action);
        break;
      case 'encodeRecord':
        this._doEncode(action);
        break;
      case 'hideEvidence':
        this._doHide(action);
        break;
      case 'underSearch':
        this._doSearch(action);
        break;
      case 'decodeEvidence':
        this._doDecode(action);
        break;
    }
  }

  // --- Phase handlers ---
  // Each handler must change at least one "progress" state AND one "risk" state
  // per MECHANIC_SPEC State Coupling requirement.

  _doSelectEvent(action) {
    this.currentEvent = action.event || EVENT_FRAGMENTS.find((e) => e.id === action.target);
    // Progress: reset encoding_difficulty for new round
    // Risk: stash_risk increases by event base suspicion
    this.state.encoding_difficulty = 0;
    this.state.stash_risk += this.currentEvent.base_suspicion;
    this._advancePhase();
  }

  _doEncode(action) {
    this.currentEncoding = action.encoding;
    this.currentDetailLevel = action.detailLevel ?? 1;
    const result = computeEncodingResult(
      this.currentEvent, this.currentEncoding, this.currentDetailLevel,
    );
    // Progress: evidence_clarity accumulates, encoding_difficulty set
    // Risk: stash_risk changes based on encoding security vs suspicion
    this.state.evidence_clarity += result.evidence_clarity;
    this.state.stash_risk += result.stash_risk;
    this.state.encoding_difficulty = result.encoding_difficulty;
    this._advancePhase();
  }

  _doHide(action) {
    this.currentStashPoint = action.stashPoint;
    // Risk: stash_risk increases by stash point risk value
    // Progress: evidence_clarity penalized for low accessibility (harder to retrieve later)
    this.state.stash_risk += this.currentStashPoint.stash_risk;
    const clarityPenalty = Math.max(0, 3 - this.currentStashPoint.accessibility);
    this.state.evidence_clarity = Math.max(0, this.state.evidence_clarity - clarityPenalty);
    this._advancePhase();
  }

  _doSearch() {
    const scenario = selectSearchByRound(this.state.round);
    const result = computeSearchResult(
      this.currentStashPoint, this.currentEncoding, scenario, this.state.round,
    );
    this.lastSearchResult = result;
    // Survival: search_pressure always increases
    // Risk: stash_risk increases if detected
    this.state.search_pressure += result.search_pressure;
    if (result.detected) {
      this.state.stash_risk += result.stash_risk_change;
    }
    this._advancePhase();
  }

  _doDecode() {
    const result = computeDecodeResult(
      this.currentEncoding, this.state.evidence_clarity, this.currentStashPoint,
    );
    this.lastDecodeResult = result;
    // Progress: evidence_clarity boosted on success, taxed by decode cost
    // Survival: encoding_difficulty determines decode cost pressure
    const decodeCost = result.decode_cost;
    this.state.evidence_clarity = Math.max(0, this.state.evidence_clarity - decodeCost);
    if (result.success) {
      this.state.evidence_clarity += 2;
    }
    // Search pressure eases slightly between rounds
    this.state.search_pressure = Math.max(0, this.state.search_pressure - 1);
    this.state.round += 1;
    if (!this.isGameOver()) {
      this._resetForNextRound();
    }
  }

  // --- Helpers ---

  _resetForNextRound() {
    this.currentPhase = 'selectEvent';
    this.phaseIndex = 0;
    this.currentEvent = null;
    this.currentEncoding = null;
    this.currentStashPoint = null;
    this.currentDetailLevel = 1;
  }

  _advancePhase() {
    this.phaseIndex += 1;
    if (this.phaseIndex < PHASES.length) {
      this.currentPhase = PHASES[this.phaseIndex];
    }
  }

  // --- Settlement ---

  isGameOver() {
    if (this.state.stash_risk >= RISK_LIMIT) return true;
    if (this.state.search_pressure >= PRESSURE_LIMIT) return true;
    if (this.state.round > MAX_ROUNDS) return true;
    return false;
  }

  getEndResult() {
    if (this.state.stash_risk >= RISK_LIMIT) {
      return {
        title: '黑账暴露',
        description: `藏匿风险爆表(${this.state.stash_risk})，暗号小册被搜出，编码被破解。`,
      };
    }
    if (this.state.search_pressure >= PRESSURE_LIMIT) {
      return {
        title: '压力崩溃',
        description: `搜查压力过高(${this.state.search_pressure})，你无法继续。`,
      };
    }
    if (this.state.evidence_clarity >= CLARITY_SUCCESS) {
      return {
        title: '证据链完整',
        description: `你成功保存了高清晰度证据(清晰度${this.state.evidence_clarity})，黑账记录完整可读。`,
      };
    }
    return {
      title: '存活',
      description: `你撑过了${this.state.round - 1}轮。清晰度:${this.state.evidence_clarity} 风险:${this.state.stash_risk} 搜查压力:${this.state.search_pressure}`,
    };
  }
}
