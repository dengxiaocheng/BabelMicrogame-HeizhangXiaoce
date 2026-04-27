const PHASES = ['selectEvent', 'encodeRecord', 'hideEvidence', 'underSearch', 'decodeEvidence'];

const EVENT_POOL = [
  { id: 'bribe', name: '贿赂记录', description: '一笔不明资金流入，需要编码记录。', baseRisk: 2 },
  { id: 'kickback', name: '回扣条目', description: '供应商回扣，证据清晰但危险。', baseRisk: 3 },
  { id: 'theft', name: '挪用痕迹', description: '公款挪用的线索，需要小心处理。', baseRisk: 2 },
];

export class Game {
  constructor() {
    this.state = { resource: 10, pressure: 0, risk: 0, relation: 5, round: 1 };
    this.currentPhase = 'selectEvent';
    this.currentEvent = null;
    this.encodedRecord = null;
    this.hiddenQuality = 0;
    this.phaseIndex = 0;
  }

  phaseDescription() {
    switch (this.currentPhase) {
      case 'selectEvent':
        return '选择一个需要记录的事件。不同事件风险不同。';
      case 'encodeRecord':
        return `为「${this.currentEvent.name}」选择编码方式。编码越复杂越安全，但解码也越难。`;
      case 'hideEvidence':
        return '选择藏匿方式。藏得越好越安全，但可能影响后续取用。';
      case 'underSearch':
        return '搜查进行中！你的藏匿质量将接受考验。';
      case 'decodeEvidence':
        return '最终阶段：解码证据。编码越复杂，解码消耗的资源越多。';
      default:
        return '';
    }
  }

  availableActions() {
    switch (this.currentPhase) {
      case 'selectEvent':
        return EVENT_POOL.map((e) => ({ id: 'select', target: e.id, label: e.name }));
      case 'encodeRecord':
        return [
          { id: 'encode_simple', label: '简单编码 (低安全/易解码)', complexity: 1 },
          { id: 'encode_medium', label: '中等编码 (平衡)', complexity: 2 },
          { id: 'encode_complex', label: '复杂编码 (高安全/难解码)', complexity: 3 },
        ];
      case 'hideEvidence':
        return [
          { id: 'hide_careful', label: '仔细藏匿 (消耗资源)', quality: 3 },
          { id: 'hide_quick', label: '快速藏匿 (节省资源)', quality: 1 },
        ];
      case 'underSearch':
        return [
          { id: 'stay_calm', label: '保持冷静 (低风险)' },
          { id: 'cooperate', label: '有限配合 (降低压力)' },
        ];
      case 'decodeEvidence':
        return [
          { id: 'decode', label: '开始解码' },
        ];
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
    this._applyPressure();
  }

  _doSelectEvent(action) {
    this.currentEvent = EVENT_POOL.find((e) => e.id === action.target);
    this.state.risk += this.currentEvent.baseRisk;
    this._advancePhase();
  }

  _doEncode(action) {
    this.encodedRecord = { complexity: action.complexity };
    this.state.resource -= action.complexity;
    this._advancePhase();
  }

  _doHide(action) {
    this.hiddenQuality = action.quality;
    if (action.quality >= 3) this.state.resource -= 2;
    this._advancePhase();
  }

  _doSearch(action) {
    const searchPower = Math.floor(Math.random() * 4) + 1 + this.state.round;
    const survived = this.hiddenQuality + Math.floor(Math.random() * 2) >= searchPower;
    if (!survived) {
      this.state.risk += 3;
      this.state.pressure += 2;
    } else {
      this.state.relation += 1;
    }
    if (action.id === 'cooperate') this.state.pressure = Math.max(0, this.state.pressure - 1);
    this._advancePhase();
  }

  _doDecode() {
    const cost = this.encodedRecord.complexity * 2;
    this.state.resource -= cost;
    if (this.state.resource < 0) {
      this.state.risk += 5;
    }
    this.state.round += 1;
    if (!this.isGameOver()) {
      this.currentPhase = 'selectEvent';
      this.phaseIndex = 0;
      this.currentEvent = null;
      this.encodedRecord = null;
      this.hiddenQuality = 0;
    }
  }

  _advancePhase() {
    this.phaseIndex += 1;
    if (this.phaseIndex < PHASES.length) {
      this.currentPhase = PHASES[this.phaseIndex];
    }
  }

  _applyPressure() {
    if (this.state.risk > 8) this.state.pressure += 1;
  }

  isGameOver() {
    if (this.state.resource <= 0 && this.currentPhase === 'decodeEvidence') return true;
    if (this.state.risk >= 15) return true;
    if (this.state.pressure >= 10) return true;
    if (this.state.round > 5) return true;
    return false;
  }

  getEndResult() {
    if (this.state.risk >= 15) {
      return { title: '被查出', description: `风险值爆表(${this.state.risk})，黑账暴露，你被淘汰。` };
    }
    if (this.state.pressure >= 10) {
      return { title: '压力崩溃', description: `压力值过高(${this.state.pressure})，你无法继续。` };
    }
    if (this.state.resource <= 0) {
      return { title: '资源耗尽', description: '没有足够资源完成解码，证据链断裂。' };
    }
    return {
      title: '存活结算',
      description: `你撑过了 ${this.state.round - 1} 轮。最终风险:${this.state.risk} 压力:${this.state.pressure} 关系:${this.state.relation}`,
    };
  }
}
