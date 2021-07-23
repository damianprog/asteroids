import Game from '/src/game.js';

const canvas = document.querySelector('canvas');

const ctx = canvas.getContext('2d');

const GAME_WIDTH = 700;
const GAME_HEIGHT = 500;

const game = new Game(GAME_WIDTH, GAME_HEIGHT);

let lastTime = 0;
const gameLoop = (timestamp) => {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  game.clear(ctx);
  game.update(deltaTime);
  game.draw(ctx);

  requestAnimationFrame(gameLoop);
};

requestAnimationFrame(gameLoop);
