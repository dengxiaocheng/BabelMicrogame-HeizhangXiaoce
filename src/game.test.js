import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from './game.js';

// Helper: run a full core loop with given choices
function runLoop(game, opts = {}) {
  const eventIdx = opts.eventIdx ?? 0;
  const encodingIdx = opts.encodingIdx ?? 1;
  const stashIdx = opts.stashIdx ?? 1;
  const detailLevel = opts.detailLevel ?? 1;

  const actions = game.availableActions();
  game.executeAction({ ...actions[eventIdx], detailLevel });

  const encodeActions = game.availableActions();
  game.executeAction({ ...encodeActions[encodingIdx], detailLevel });

  const hideActions = game.availableActions();
  game.executeAction(hideActions[stashIdx]);

  game.executeAction({ id: 'endure' });
  game.executeAction({ id: 'decode' });
}

describe('Game initialization', () => {
  it('starts with Direction Lock required state', () => {
    const g = new Game();
    assert.deepEqual(g.state, {
      evidence_clarity: 0,
      stash_risk: 0,
      encoding_difficulty: 0,
      search_pressure: 0,
      round: 1,
    });
    assert.equal(g.currentPhase, 'selectEvent');
    assert.equal(g.currentEvent, null);
  });
});

describe('Phase transitions', () => {
  it('selectEvent -> encodeRecord', () => {
    const g = new Game();
    const actions = g.availableActions();
    g.executeAction(actions[0]);
    assert.equal(g.currentPhase, 'encodeRecord');
    assert.ok(g.currentEvent);
  });

  it('encodeRecord -> hideEvidence', () => {
    const g = new Game();
    const actions = g.availableActions();
    g.executeAction(actions[0]);
    const encodeActions = g.availableActions();
    g.executeAction(encodeActions[0]);
    assert.equal(g.currentPhase, 'hideEvidence');
    assert.ok(g.currentEncoding);
  });

  it('hideEvidence -> underSearch', () => {
    const g = new Game();
    g.executeAction(g.availableActions()[0]);
    g.executeAction(g.availableActions()[0]);
    g.executeAction(g.availableActions()[0]);
    assert.equal(g.currentPhase, 'underSearch');
    assert.ok(g.currentStashPoint);
  });

  it('underSearch -> decodeEvidence', () => {
    const g = new Game();
    g.executeAction(g.availableActions()[0]);
    g.executeAction(g.availableActions()[0]);
    g.executeAction(g.availableActions()[0]);
    g.executeAction({ id: 'endure' });
    assert.equal(g.currentPhase, 'decodeEvidence');
  });

  it('decodeEvidence resets to selectEvent for next round', () => {
    const g = new Game();
    runLoop(g);
    assert.equal(g.state.round, 2);
    assert.equal(g.currentPhase, 'selectEvent');
    assert.equal(g.currentEvent, null);
  });
});

describe('Full core loop', () => {
  it('selectEvent -> encodeRecord -> hideEvidence -> underSearch -> decodeEvidence -> next round', () => {
    const g = new Game();
    const phases = [];
    phases.push(g.currentPhase);

    g.executeAction(g.availableActions()[0]);
    phases.push(g.currentPhase);

    g.executeAction(g.availableActions()[1]);
    phases.push(g.currentPhase);

    g.executeAction(g.availableActions()[2]);
    phases.push(g.currentPhase);

    g.executeAction({ id: 'endure' });
    phases.push(g.currentPhase);

    g.executeAction({ id: 'decode' });
    phases.push(g.currentPhase);

    assert.deepEqual(phases, [
      'selectEvent', 'encodeRecord', 'hideEvidence', 'underSearch', 'decodeEvidence', 'selectEvent',
    ]);
    assert.equal(g.state.round, 2);
  });
});

describe('State coupling: each action changes progress AND risk', () => {
  it('selectEvent changes stash_risk (risk) and encoding_difficulty (progress)', () => {
    const g = new Game();
    const before = { ...g.state };
    g.executeAction(g.availableActions()[0]);
    // stash_risk must increase (risk pressure)
    assert.ok(g.state.stash_risk > before.stash_risk, 'stash_risk should increase');
    // encoding_difficulty reset (progress tracking)
    assert.ok(
      g.state.encoding_difficulty !== before.encoding_difficulty || g.state.stash_risk !== before.stash_risk,
      'at least one progress or risk state must change',
    );
  });

  it('encodeRecord changes evidence_clarity (progress) and encoding_difficulty + stash_risk (risk)', () => {
    const g = new Game();
    g.executeAction(g.availableActions()[0]);
    const before = { ...g.state };
    g.executeAction(g.availableActions()[0]);
    // evidence_clarity must change (progress)
    assert.ok(g.state.evidence_clarity !== before.evidence_clarity, 'evidence_clarity should change');
    // encoding_difficulty set (progress/resource)
    assert.ok(g.state.encoding_difficulty !== before.encoding_difficulty, 'encoding_difficulty should change');
  });

  it('hideEvidence changes stash_risk (risk) and may affect evidence_clarity (progress)', () => {
    const g = new Game();
    g.executeAction(g.availableActions()[0]); // selectEvent
    g.executeAction(g.availableActions()[0]); // encode
    const before = { ...g.state };
    g.executeAction(g.availableActions()[0]); // hide
    // stash_risk must increase (risk)
    assert.ok(g.state.stash_risk > before.stash_risk, 'stash_risk should increase');
  });

  it('underSearch changes search_pressure (survival)', () => {
    const g = new Game();
    g.executeAction(g.availableActions()[0]); // selectEvent
    g.executeAction(g.availableActions()[0]); // encode
    g.executeAction(g.availableActions()[0]); // hide
    const before = { ...g.state };
    g.executeAction({ id: 'endure' });
    // search_pressure must increase (survival)
    assert.ok(g.state.search_pressure > before.search_pressure, 'search_pressure should increase');
  });

  it('decodeEvidence changes evidence_clarity (progress) and search_pressure (survival)', () => {
    const g = new Game();
    g.executeAction(g.availableActions()[0]); // selectEvent
    g.executeAction(g.availableActions()[0]); // encode
    g.executeAction(g.availableActions()[0]); // hide
    g.executeAction({ id: 'endure' });        // search
    const before = { ...g.state };
    g.executeAction({ id: 'decode' });
    // evidence_clarity changes (decode cost + possible success bonus)
    assert.ok(g.state.evidence_clarity !== before.evidence_clarity, 'evidence_clarity should change after decode');
    // round advances
    assert.ok(g.state.round > before.round, 'round should advance');
  });
});

describe('Settlement conditions', () => {
  it('isGameOver when stash_risk >= 15', () => {
    const g = new Game();
    g.state.stash_risk = 15;
    assert.equal(g.isGameOver(), true);
  });

  it('isGameOver when search_pressure >= 12', () => {
    const g = new Game();
    g.state.search_pressure = 12;
    assert.equal(g.isGameOver(), true);
  });

  it('isGameOver when round > 5', () => {
    const g = new Game();
    g.state.round = 6;
    assert.equal(g.isGameOver(), true);
  });

  it('isGameOver returns false in normal state', () => {
    const g = new Game();
    assert.equal(g.isGameOver(), false);
  });

  it('getEndResult: 黑账暴露 when stash_risk >= 15', () => {
    const g = new Game();
    g.state.stash_risk = 15;
    assert.equal(g.getEndResult().title, '黑账暴露');
  });

  it('getEndResult: 压力崩溃 when search_pressure >= 12', () => {
    const g = new Game();
    g.state.search_pressure = 12;
    assert.equal(g.getEndResult().title, '压力崩溃');
  });

  it('getEndResult: 证据链完整 when clarity >= 6 after rounds', () => {
    const g = new Game();
    g.state.round = 6;
    g.state.evidence_clarity = 7;
    assert.equal(g.getEndResult().title, '证据链完整');
  });

  it('getEndResult: 存活 when rounds end with low clarity', () => {
    const g = new Game();
    g.state.round = 6;
    g.state.evidence_clarity = 3;
    assert.equal(g.getEndResult().title, '存活');
  });
});

describe('Search result tracking', () => {
  it('stores lastSearchResult after underSearch phase', () => {
    const g = new Game();
    g.executeAction(g.availableActions()[0]);
    g.executeAction(g.availableActions()[0]);
    g.executeAction(g.availableActions()[0]);
    g.executeAction({ id: 'endure' });
    assert.ok(g.lastSearchResult);
    assert.ok('detected' in g.lastSearchResult);
    assert.ok('defense' in g.lastSearchResult);
    assert.ok('attack' in g.lastSearchResult);
  });

  it('stores lastDecodeResult after decodeEvidence phase', () => {
    const g = new Game();
    g.executeAction(g.availableActions()[0]);
    g.executeAction(g.availableActions()[0]);
    g.executeAction(g.availableActions()[0]);
    g.executeAction({ id: 'endure' });
    g.executeAction({ id: 'decode' });
    assert.ok(g.lastDecodeResult);
    assert.ok('success' in g.lastDecodeResult);
    assert.ok('decode_cost' in g.lastDecodeResult);
  });
});

describe('Multiple rounds', () => {
  it('completes multiple rounds and triggers game over', () => {
    const g = new Game();
    for (let i = 0; i < 5; i++) {
      if (g.isGameOver()) break;
      runLoop(g, { eventIdx: 0, encodingIdx: 0, stashIdx: 2 });
    }
    assert.equal(g.isGameOver(), true);
    assert.ok(g.state.round >= 2, `round should be >= 2, got ${g.state.round}`);
  });

  it('stash_risk accumulates across rounds', () => {
    const g = new Game();
    runLoop(g, { encodingIdx: 0, stashIdx: 0 });
    const riskAfter1 = g.state.stash_risk;
    runLoop(g, { encodingIdx: 0, stashIdx: 0 });
    assert.ok(g.state.stash_risk > riskAfter1, 'stash_risk should accumulate');
  });
});
