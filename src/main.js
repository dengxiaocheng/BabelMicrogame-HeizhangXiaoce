import { Game } from './game.js';
import { initUI, render } from './ui/game-ui.js';

function startGame() {
  const game = new Game();
  window.__game = game;
  // Clear stale UI from previous session on restart
  const log = document.querySelector('#log');
  if (log) log.innerHTML = '';
  const resultArea = document.querySelector('#result-area');
  if (resultArea) resultArea.innerHTML = '';
  render(game);
}

initUI(startGame);
startGame();
