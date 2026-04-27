import { Game } from './game.js';

const PHASES = ['selectEvent', 'encodeRecord', 'hideEvidence', 'underSearch', 'decodeEvidence'];

const $ = (sel) => document.querySelector(sel);

function renderState(game) {
  const s = game.state;
  $('#status-bar').innerHTML =
    `<span class="stat">资源: ${s.resource}</span>` +
    `<span class="stat">压力: ${s.pressure}</span>` +
    `<span class="stat">风险: ${s.risk}</span>` +
    `<span class="stat">关系: ${s.relation}</span>` +
    `<span class="stat">回合: ${s.round}</span>`;
}

function renderPhase(game) {
  const phase = game.currentPhase;
  const phaseNames = {
    selectEvent: '选择事件',
    encodeRecord: '编码记录',
    hideEvidence: '藏匿证据',
    underSearch: '经历搜查',
    decodeEvidence: '解码证据',
  };
  $('#phase-title').textContent = phaseNames[phase] || phase;
  $('#phase-content').textContent = game.phaseDescription();
  renderActions(game);
  renderState(game);
}

function renderActions(game) {
  const area = $('#action-area');
  area.innerHTML = '';
  const actions = game.availableActions();
  actions.forEach((action) => {
    const btn = document.createElement('button');
    btn.textContent = action.label;
    btn.addEventListener('click', () => {
      game.executeAction(action);
      appendLog(action.label);
      if (game.isGameOver()) {
        renderEnd(game);
      } else {
        renderPhase(game);
      }
    });
    area.appendChild(btn);
  });
}

function renderEnd(game) {
  const result = game.getEndResult();
  $('#phase-title').textContent = result.title;
  $('#phase-content').textContent = result.description;
  $('#action-area').innerHTML = '';
  const btn = document.createElement('button');
  btn.textContent = '重新开始';
  btn.addEventListener('click', () => startGame());
  $('#action-area').appendChild(btn);
}

function appendLog(text) {
  const log = $('#log');
  log.textContent += `[${new Date().toLocaleTimeString()}] ${text}\n`;
  log.scrollTop = log.scrollHeight;
}

function startGame() {
  const game = new Game();
  renderPhase(game);
  $('#log').textContent = '游戏开始\n';
  window.__game = game;
}

startGame();
