export default class InfoPanels {
  constructor(game) {
    this.game = game;
  }

  drawWelcomeMenu(ctx) {
    this.game.asteroids.forEach((asteroid) => asteroid.draw(ctx));
    ctx.save();
    ctx.font = '60px ZenDots';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';

    ctx.fillText(
      'Asteroids',
      this.game.gameWidth / 2,
      this.game.gameHeight / 2
    );

    ctx.font = '23px ZenDots';
    ctx.fillText(
      'Click Enter to start',
      this.game.gameWidth / 2,
      this.game.gameHeight / 2 + 50
    );
    ctx.restore();
  }

  drawGameover(ctx) {
    ctx.save();
    ctx.font = '40px ZenDots';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';

    ctx.fillText(
      'Game Over',
      this.game.gameWidth / 2,
      this.game.gameHeight / 2 - 70
    );
    ctx.font = '23px ZenDots';
    ctx.fillText(
      `Your score: ${this.game.score}`,
      this.game.gameWidth / 2,
      this.game.gameHeight / 2 - 20
    );
    ctx.fillText(
      `Best score: ${this.game.bestScore}`,
      this.game.gameWidth / 2,
      this.game.gameHeight / 2 + 30
    );
    ctx.fillText(
      'Click Enter to restart',
      this.game.gameWidth / 2,
      this.game.gameHeight / 2 + 80
    );
    ctx.restore();
  }
}
