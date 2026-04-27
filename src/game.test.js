import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from './game.js';

describe('Game', () => {
  it('initializes with correct state and phase', () => {
    const g = new Game();
    assert.equal(g.currentPhase, 'selectEvent');
    assert.deepEqual(g.state, { resource: 10, pressure: 0, risk: 0, relation: 5, round: 1 });
    assert.equal(g.currentEvent, null);
  });

  it('selectEvent picks an event and advances to encodeRecord', () => {
    const g = new Game();
    g.executeAction({ id: 'select', target: 'bribe' });
    assert.equal(g.currentPhase, 'encodeRecord');
    assert.equal(g.currentEvent.id, 'bribe');
    assert.equal(g.state.risk, 2);
  });

  it('encodeRecord sets complexity and advances to hideEvidence', () => {
    const g = new Game();
    g.executeAction({ id: 'select', target: 'bribe' });
    g.executeAction({ id: 'encode_medium', complexity: 2 });
    assert.equal(g.currentPhase, 'hideEvidence');
    assert.equal(g.encodedRecord.complexity, 2);
    assert.equal(g.state.resource, 8);
  });

  it('hideEvidence advances to underSearch', () => {
    const g = new Game();
    g.executeAction({ id: 'select', target: 'bribe' });
    g.executeAction({ id: 'encode_simple', complexity: 1 });
    g.executeAction({ id: 'hide_quick', quality: 1 });
    assert.equal(g.currentPhase, 'underSearch');
    assert.equal(g.hiddenQuality, 1);
  });

  it('underSearch advances to decodeEvidence', () => {
    const g = new Game();
    g.executeAction({ id: 'select', target: 'bribe' });
    g.executeAction({ id: 'encode_simple', complexity: 1 });
    g.executeAction({ id: 'hide_quick', quality: 1 });
    g.executeAction({ id: 'stay_calm' });
    assert.equal(g.currentPhase, 'decodeEvidence');
  });

  it('decodeEvidence increments round and resets to selectEvent', () => {
    const g = new Game();
    g.executeAction({ id: 'select', target: 'bribe' });
    g.executeAction({ id: 'encode_simple', complexity: 1 });
    g.executeAction({ id: 'hide_quick', quality: 1 });
    g.executeAction({ id: 'stay_calm' });
    g.executeAction({ id: 'decode' });
    assert.equal(g.state.round, 2);
    assert.equal(g.currentPhase, 'selectEvent');
    assert.equal(g.currentEvent, null);
  });

  it('full core loop: selectEvent -> encodeRecord -> hideEvidence -> underSearch -> decodeEvidence', () => {
    const g = new Game();
    const phases = [];
    phases.push(g.currentPhase);
    g.executeAction({ id: 'select', target: 'kickback' });
    phases.push(g.currentPhase);
    g.executeAction({ id: 'encode_complex', complexity: 3 });
    phases.push(g.currentPhase);
    g.executeAction({ id: 'hide_careful', quality: 3 });
    phases.push(g.currentPhase);
    g.executeAction({ id: 'cooperate' });
    phases.push(g.currentPhase);
    g.executeAction({ id: 'decode' });

    assert.deepEqual(phases, [
      'selectEvent', 'encodeRecord', 'hideEvidence', 'underSearch', 'decodeEvidence',
    ]);
  });

  it('isGameOver returns true when risk >= 15', () => {
    const g = new Game();
    g.state.risk = 15;
    assert.equal(g.isGameOver(), true);
  });

  it('isGameOver returns true when pressure >= 10', () => {
    const g = new Game();
    g.state.pressure = 10;
    assert.equal(g.isGameOver(), true);
  });

  it('isGameOver returns true when round > 5', () => {
    const g = new Game();
    g.state.round = 6;
    g.currentPhase = 'decodeEvidence';
    assert.equal(g.isGameOver(), true);
  });

  it('isGameOver returns false in normal state', () => {
    const g = new Game();
    assert.equal(g.isGameOver(), false);
  });

  it('getEndResult returns correct ending for risk overflow', () => {
    const g = new Game();
    g.state.risk = 15;
    const r = g.getEndResult();
    assert.equal(r.title, '被查出');
  });

  it('getEndResult returns survival result when conditions are met', () => {
    const g = new Game();
    g.state.round = 4;
    const r = g.getEndResult();
    assert.equal(r.title, '存活结算');
  });

  it('pressure increases when risk > 8 after any action', () => {
    const g = new Game();
    g.state.risk = 9;
    g.executeAction({ id: 'select', target: 'bribe' });
    assert.ok(g.state.pressure >= 1);
  });
});
