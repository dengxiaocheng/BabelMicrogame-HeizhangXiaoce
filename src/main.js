import { Game } from './game.js';
import { initUI, render } from './ui/game-ui.js';

function startGame() {
  const game = new Game();
  window.__game = game;
  render(game);
}

initUI(startGame);
startGame();
