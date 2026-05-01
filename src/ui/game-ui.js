/**
 * Scene-based UI for 黑账小册
 * Renders scene objects (事件碎片, 暗号小册, 藏点格, 搜查灯, 解码面板)
 * with interactive primary input: encode + drag-to-hide.
 */

import {
  PHASE_SCENES, CLARITY_FEEDBACK, SEARCH_FEEDBACK, ENCODING_FEEDBACK,
  clarityLevel, searchFeedbackKey, formatStateChanges, ENDINGS,
} from '../content/scene-feedback.js';
import { EVENT_FRAGMENTS, ENCODING_METHODS, STASH_POINTS } from '../content/content-pool.js';

const DETAIL_LABELS = ['简略', '适中', '详细'];
const RISK_LIMIT = 15;
const PRESSURE_LIMIT = 12;

let pendingBanner = null;
let onStartGame = null;
const $ = (s) => document.querySelector(s);

// ── Styles ──────────────────────────────────────────────────
function injectStyles() {
  if (document.getElementById('gui-styles')) return;
  const s = document.createElement('style');
  s.id = 'gui-styles';
  s.textContent = `
.gauge-row{display:flex;gap:6px;margin:8px 0;flex-wrap:wrap}
.gauge{flex:1;min-width:90px}
.gauge-label{font-size:.72em;color:#999;display:block}
.gauge-track{height:6px;background:#222;border-radius:3px;margin:3px 0;overflow:hidden}
.gauge-fill{height:100%;border-radius:3px;transition:width .5s}
.gauge-val{font-size:.78em;color:#bbb}
.scene-text{padding:12px;background:#16213e;border-radius:8px;margin:8px 0;font-size:.92em;line-height:1.6;color:#bbb}
.scene-text .inst{color:#f5a623;margin-top:8px;font-size:.88em}
.card-grid{display:grid;gap:8px;margin:10px 0}
.card-grid.cols2{grid-template-columns:repeat(2,1fr)}
.card-grid.cols3{grid-template-columns:repeat(3,1fr)}
.card{padding:10px;background:#1e2a4a;border:2px solid #2a3a5c;border-radius:8px;cursor:pointer;transition:all .2s}
.card:hover{border-color:#e94560;transform:translateY(-2px)}
.card.sel{border-color:#f5a623;background:#2a3a5c;box-shadow:0 0 12px rgba(245,166,35,.3)}
.card-name{font-weight:bold;color:#ddd;margin-bottom:3px;font-size:.9em}
.card-desc{font-size:.76em;color:#888;line-height:1.4}
.card-tags{display:flex;gap:4px;margin-top:5px;font-size:.7em;flex-wrap:wrap}
.tag{padding:2px 5px;border-radius:3px;background:#0f3460;color:#aab}
.tag.warn{background:#3a1a1a;color:#e94560}
.tag.good{background:#1a3a2a;color:#4a8}
.booklet{width:72px;height:90px;background:linear-gradient(135deg,#4a1942,#2d1b4e);border:2px solid #e94560;border-radius:6px;cursor:grab;display:flex;align-items:center;justify-content:center;font-size:.75em;color:#e94560;text-align:center;padding:6px;box-shadow:0 4px 12px rgba(233,69,96,.4);margin:12px auto;transition:box-shadow .2s,transform .2s;user-select:none}
.booklet:hover{box-shadow:0 6px 20px rgba(233,69,96,.6);transform:scale(1.05)}
.booklet.dragging{opacity:.4;cursor:grabbing}
.stash-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;margin:10px 0}
.stash-slot{padding:14px 8px;background:#1e2a4a;border:2px dashed #2a3a5c;border-radius:8px;text-align:center;min-height:70px;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:all .2s}
.stash-slot:hover{border-color:#4a8}
.stash-slot.over{border-color:#f5a623;background:#2a3a5c;box-shadow:0 0 16px rgba(245,166,35,.3)}
.stash-slot .sn{font-size:.85em;font-weight:bold;color:#ccc}
.stash-slot .si{font-size:.68em;color:#888;margin-top:3px}
.hide-layout{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;justify-content:center}
.hide-left{display:flex;flex-direction:column;align-items:center;gap:4px}
.hide-right{flex:1;min-width:200px}
.drag-hint{font-size:.75em;color:#f5a623;text-align:center;margin-top:4px}
.search-scene{text-align:center;padding:16px}
.searchlight{width:100%;height:100px;position:relative;overflow:hidden;background:#0a0a14;border-radius:8px;margin:10px 0}
.sbeam{position:absolute;top:0;width:50px;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,200,.25),transparent);animation:sweep 1.8s ease-in-out infinite}
@keyframes sweep{0%{left:-50px}50%{left:calc(100% + 50px)}100%{left:-50px}}
.slider-wrap{margin:10px 0;padding:10px;background:#16213e;border-radius:8px}
.slider-wrap input[type=range]{width:100%;margin:6px 0;accent-color:#e94560}
.slider-lbl{font-size:.88em;color:#f5a623;text-align:center}
.clarity-prev{font-size:.78em;color:#aaa;text-align:center;margin-top:4px}
.decode-panel{text-align:center;padding:16px}
.decode-bar{height:14px;background:#333;border-radius:7px;overflow:hidden;position:relative;margin:8px auto;max-width:280px}
.decode-fill{height:100%;border-radius:7px;transition:width .5s}
.decode-thr{position:absolute;top:0;height:100%;width:2px;background:#fff;transition:left .3s}
.decode-labels{display:flex;justify-content:space-between;max-width:280px;margin:0 auto;font-size:.7em;color:#888}
.result-banner{padding:8px 14px;border-radius:6px;margin:8px 0;animation:fslide .3s ease}
.result-banner.ok{background:#1a3a2a;border-left:4px solid #4a8;color:#4a8}
.result-banner.bad{background:#3a1a1a;border-left:4px solid #e94560;color:#e94560}
.result-banner.info{background:#1a2a3a;border-left:4px solid #4a8aea;color:#4a8aea}
@keyframes fslide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.end-screen{text-align:center;padding:20px}
.end-title{font-size:1.4em;color:#e94560;margin:10px 0}
.end-desc{color:#bbb;line-height:1.6;margin-bottom:12px}
.abtn{padding:9px 22px;margin:6px;border:none;border-radius:6px;background:#e94560;color:#fff;cursor:pointer;font-size:.95em;transition:background .2s}
.abtn:hover{background:#c73550}
.abtn.sec{background:#2a3a5c}
.abtn.sec:hover{background:#3a4a6c}
#log{margin-top:8px;font-size:.76em;color:#555;max-height:80px;overflow-y:auto}
.log-e{padding:2px 0;border-bottom:1px solid #1a1a2e}
.log-e .ch{color:#f5a623}
.encode-layout{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}
.encode-event{min-width:180px;padding:10px;background:#16213e;border-radius:8px;border-left:3px solid #e94560}
.encode-opts{flex:1;min-width:200px}
.confirm-row{text-align:center;margin:10px 0}
.selected-enc{padding:8px;background:#1a2a3a;border-radius:6px;margin:6px 0;font-size:.85em;color:#4a8aea}
`;
  document.head.appendChild(s);
}

// ── Helpers ─────────────────────────────────────────────────
function executeAndTrack(game, action) {
  const before = { ...game.state };
  game.executeAction(action);
  const changes = {};
  for (const k of Object.keys(before)) {
    const d = game.state[k] - before[k];
    if (d !== 0) changes[k] = d;
  }
  return changes;
}

function addLog(text, changes) {
  const log = $('#log');
  if (!log) return;
  const d = document.createElement('div');
  d.className = 'log-e';
  const chStr = changes && Object.keys(changes).length ? ` <span class="ch">[${formatStateChanges(changes)}]</span>` : '';
  d.innerHTML = `${text}${chStr}`;
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
}

function banner(type, title, text, changes) {
  pendingBanner = { type, title, text, changes };
}

function renderBanner() {
  const area = $('#result-area');
  if (!area || !pendingBanner) { if (area) area.innerHTML = ''; return; }
  const b = pendingBanner;
  const chStr = b.changes ? `<br><small>${formatStateChanges(b.changes)}</small>` : '';
  area.innerHTML = `<div class="result-banner ${b.type}"><strong>${b.title}</strong>: ${b.text}${chStr}</div>`;
  pendingBanner = null;
}

// ── State Bar ───────────────────────────────────────────────
function renderStateBar(state) {
  const bar = $('#status-bar');
  if (!bar) return;
  const pct = (v, m) => Math.min(100, Math.round((v / m) * 100));
  bar.innerHTML = [
    gauge('证据清晰度', state.evidence_clarity, 10, '#4a8'),
    gauge('藏匿风险', state.stash_risk, RISK_LIMIT, '#e94560'),
    gauge('搜查压力', state.search_pressure, PRESSURE_LIMIT, '#f5a623'),
    gauge('编码难度', state.encoding_difficulty, 4, '#4a8aea'),
    `<div class="gauge"><span class="gauge-label">回合</span><span class="gauge-val" style="font-size:1.2em;color:#ddd">${state.round}/5</span></div>`,
  ].join('');

  function gauge(label, val, max, color) {
    const p = pct(val, max);
    return `<div class="gauge"><span class="gauge-label">${label}</span><div class="gauge-track"><div class="gauge-fill" style="width:${p}%;background:${color}"></div></div><span class="gauge-val">${val}</span></div>`;
  }
}

// ── Scene Text ──────────────────────────────────────────────
function renderSceneText(game) {
  const el = $('#scene-text');
  if (!el) return;
  const scene = PHASE_SCENES[game.currentPhase];
  if (!scene) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="scene-text">${scene.scene}<div class="inst">${scene.instruction}</div></div>`;
}

// ── Phase Renderers ─────────────────────────────────────────

function renderSelectEvent(game, area) {
  area.innerHTML = `<div class="card-grid cols2" id="event-cards"></div>`;
  const grid = $('#event-cards');
  EVENT_FRAGMENTS.forEach((ev) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<div class="card-name">${ev.name}</div>
      <div class="card-desc">${ev.fragment_text}</div>
      <div class="card-tags">
        <span class="tag good">证据 +${ev.evidence_value}</span>
        <span class="tag warn">可疑 +${ev.base_suspicion}</span>
      </div>
      <div class="card-desc" style="margin-top:4px;color:#f5a623">${ev.encoding_hint}</div>`;
    card.addEventListener('click', () => {
      const changes = executeAndTrack(game, { event: ev });
      addLog(`选择事件: ${ev.name}`, changes);
      afterAction(game);
    });
    grid.appendChild(card);
  });
}

function renderEncodeRecord(game, area) {
  const ev = game.currentEvent;
  let selectedMethod = null;
  let detailLevel = 1;

  area.innerHTML = `
    <div class="encode-layout">
      <div class="encode-event">
        <div class="card-name" style="color:#e94560">${ev.name}</div>
        <div class="card-desc">${ev.fragment_text}</div>
        <div class="card-desc" style="color:#f5a623;margin-top:6px">${ev.encoding_hint}</div>
      </div>
      <div class="encode-opts">
        <div class="card-grid cols2" id="enc-cards"></div>
        <div class="slider-wrap" id="detail-wrap" style="display:none">
          <div class="slider-lbl" id="detail-label">详略: ${DETAIL_LABELS[1]}</div>
          <input type="range" min="0" max="2" step="1" value="1" id="detail-slider">
          <div class="clarity-prev" id="clarity-preview"></div>
        </div>
        <div id="sel-info"></div>
        <div class="confirm-row" id="confirm-row" style="display:none">
          <button class="abtn" id="confirm-enc">确认编码</button>
        </div>
      </div>
    </div>`;

  const grid = $('#enc-cards');
  ENCODING_METHODS.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<div class="card-name">${m.name}</div>
      <div class="card-desc">${m.description}</div>
      <div class="card-tags">
        <span class="tag">复杂度 ${m.complexity}</span>
        <span class="tag good">安全 ${m.security}</span>
        <span class="tag">保留 ${Math.round(m.clarity_preservation * 100)}%</span>
      </div>`;
    card.addEventListener('click', () => {
      grid.querySelectorAll('.card').forEach((c) => c.classList.remove('sel'));
      card.classList.add('sel');
      selectedMethod = m;
      $('#detail-wrap').style.display = 'block';
      updatePreview();
    });
    grid.appendChild(card);
  });

  const slider = $('#detail-slider');
  slider.addEventListener('input', () => {
    detailLevel = parseInt(slider.value, 10);
    updatePreview();
  });

  function updatePreview() {
    if (!selectedMethod) return;
    $('#detail-label').textContent = `详略: ${DETAIL_LABELS[detailLevel]}`;
    const rawClarity = ev.clarity_potential[detailLevel] ?? ev.clarity_potential[0];
    const preview = Math.round(rawClarity * selectedMethod.clarity_preservation);
    $('#clarity-preview').textContent = `预计清晰度贡献: +${preview}`;
    $('#sel-info').innerHTML = `<div class="selected-enc">已选: ${selectedMethod.name} / ${DETAIL_LABELS[detailLevel]}</div>`;
    $('#confirm-row').style.display = 'block';
  }

  $('#confirm-enc').addEventListener('click', () => {
    if (!selectedMethod) return;
    const changes = executeAndTrack(game, { encoding: selectedMethod, detailLevel });
    addLog(`编码: ${selectedMethod.name} (${DETAIL_LABELS[detailLevel]})`, changes);
    afterAction(game);
  });
}

function renderHideEvidence(game, area) {
  const enc = game.currentEncoding;
  area.innerHTML = `
    <div class="hide-layout">
      <div class="hide-left">
        <div class="booklet" id="the-booklet" draggable="true">暗号<br>小册</div>
        <div class="drag-hint">拖到右侧藏点</div>
      </div>
      <div class="hide-right">
        <div class="stash-grid" id="stash-grid"></div>
      </div>
    </div>`;

  const booklet = $('#the-booklet');
  booklet.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', 'booklet');
    booklet.classList.add('dragging');
  });
  booklet.addEventListener('dragend', () => booklet.classList.remove('dragging'));

  const grid = $('#stash-grid');
  STASH_POINTS.forEach((sp) => {
    const slot = document.createElement('div');
    slot.className = 'stash-slot';
    slot.innerHTML = `<div class="sn">${sp.name}</div><div class="si">${sp.description}</div>
      <div class="card-tags" style="justify-content:center;margin-top:4px">
        <span class="tag warn">风险 ${sp.stash_risk}</span>
        <span class="tag">取用 ${sp.accessibility}</span>
        <span class="tag good">防御 ${sp.search_resistance}</span>
      </div>`;
    slot.addEventListener('dragover', (e) => { e.preventDefault(); slot.classList.add('over'); });
    slot.addEventListener('dragleave', () => slot.classList.remove('over'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('over');
      if (e.dataTransfer.getData('text/plain') !== 'booklet') return;
      const changes = executeAndTrack(game, { stashPoint: sp });
      addLog(`藏匿到: ${sp.name}`, changes);
      afterAction(game);
    });
    grid.appendChild(slot);
  });
}

function renderUnderSearch(game, area) {
  area.innerHTML = `
    <div class="search-scene">
      <div class="searchlight"><div class="sbeam"></div></div>
      <div style="margin:10px 0;color:#e94560;font-weight:bold">搜查灯正在扫描...</div>
      <button class="abtn" id="endure-btn">硬抗搜查</button>
    </div>`;
  $('#endure-btn').addEventListener('click', () => {
    const changes = executeAndTrack(game, { id: 'endure' });
    const r = game.lastSearchResult;
    const fbKey = searchFeedbackKey(r.detected, r.defense, r.attack);
    const fbText = SEARCH_FEEDBACK[fbKey] || '';
    const type = r.detected ? 'bad' : 'ok';
    banner(type, r.detected ? '被发现了!' : '安全过关', fbText, changes);
    addLog(`搜查: ${r.detected ? '暴露' : '安全'} (防御${r.defense} vs 攻击${r.attack})`, changes);
    afterAction(game);
  });
}

function renderDecodeEvidence(game, area) {
  const enc = game.currentEncoding;
  const clarity = game.state.evidence_clarity;
  const stash = game.currentStashPoint;
  const effective = clarity + (stash ? stash.accessibility : 0);

  // Use content-pool decode table logic inline
  const thresholds = { 1: 2, 2: 4, 3: 6, 4: 8 };
  const threshold = thresholds[enc ? enc.complexity : 1];
  const maxClarity = 12;
  const fillPct = Math.min(100, Math.round((effective / maxClarity) * 100));
  const thrPct = Math.min(100, Math.round((threshold / maxClarity) * 100));

  area.innerHTML = `
    <div class="decode-panel">
      <div style="font-size:.9em;color:#ccc;margin-bottom:8px">编码: ${enc ? enc.name : '未知'} | 难度等级 ${enc ? enc.complexity : '?'}</div>
      <div class="decode-bar">
        <div class="decode-fill" style="width:${fillPct}%;background:${effective >= threshold ? '#4a8' : '#e94560'}"></div>
        <div class="decode-thr" style="left:${thrPct}%"></div>
      </div>
      <div class="decode-labels"><span>清晰度 ${effective}</span><span>门槛 ${threshold}</span></div>
      <button class="abtn" id="decode-btn" style="margin-top:12px">开始解码</button>
    </div>`;

  $('#decode-btn').addEventListener('click', () => {
    const changes = executeAndTrack(game, { id: 'decode' });
    const r = game.lastDecodeResult;
    const type = r.success ? 'ok' : 'bad';
    const label = ENCODING_FEEDBACK[enc ? enc.complexity : 1] || '';
    banner(type, r.success ? '解码成功!' : '解码失败',
      `${label} 有效清晰度${r.effective_clarity} / 门槛${r.threshold}`, changes);
    addLog(`解码: ${r.success ? '成功' : '失败'} (消耗${r.decode_cost})`, changes);
    afterAction(game);
  });
}

function renderEnd(game, area) {
  const r = game.getEndResult();
  area.innerHTML = `
    <div class="end-screen">
      <div class="end-title">${r.title}</div>
      <div class="end-desc">${r.description}</div>
      <div class="gauge-row" style="max-width:300px;margin:12px auto">
        <div class="gauge"><span class="gauge-label">清晰度</span><span class="gauge-val">${game.state.evidence_clarity}</span></div>
        <div class="gauge"><span class="gauge-label">风险</span><span class="gauge-val">${game.state.stash_risk}</span></div>
        <div class="gauge"><span class="gauge-label">压力</span><span class="gauge-val">${game.state.search_pressure}</span></div>
      </div>
      <button class="abtn" id="restart-btn">重新开始</button>
    </div>`;
  $('#restart-btn').addEventListener('click', () => {
    if (onStartGame) onStartGame();
  });
}

// ── Main Render ─────────────────────────────────────────────

function afterAction(game) {
  renderStateBar(game.state);
  renderBanner();
  const area = $('#scene-area');
  if (game.isGameOver()) {
    $('#scene-text').innerHTML = '';
    renderEnd(game, area);
  } else {
    renderSceneText(game);
    const phase = game.currentPhase;
    if (phase === 'selectEvent') renderSelectEvent(game, area);
    else if (phase === 'encodeRecord') renderEncodeRecord(game, area);
    else if (phase === 'hideEvidence') renderHideEvidence(game, area);
    else if (phase === 'underSearch') renderUnderSearch(game, area);
    else if (phase === 'decodeEvidence') renderDecodeEvidence(game, area);
  }
}

export function initUI(restartFn) {
  injectStyles();
  onStartGame = restartFn;
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>黑账小册</h1>
    <div id="status-bar"></div>
    <div id="result-area"></div>
    <div id="scene-text"></div>
    <div id="scene-area"></div>
    <div id="log"></div>`;
}

export function render(game) {
  pendingBanner = null;
  renderStateBar(game.state);
  renderSceneText(game);
  const area = $('#scene-area');
  const phase = game.currentPhase;
  if (phase === 'selectEvent') renderSelectEvent(game, area);
  else if (phase === 'encodeRecord') renderEncodeRecord(game, area);
  else if (phase === 'hideEvidence') renderHideEvidence(game, area);
  else if (phase === 'underSearch') renderUnderSearch(game, area);
  else if (phase === 'decodeEvidence') renderDecodeEvidence(game, area);
}
