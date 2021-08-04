import Position from './position.js';

export default class Hud {
  constructor(game) {
    this.game = game;
  }

  drawLivesLabels(ctx) {
    const livesLabelsPosition = new Position(this.game.gameWidth - 168, 15);
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.shadowColor = '#4d706b';
    ctx.shadowBlur = 7;

    for (let i = 0; i < this.game.spaceShip.lives; i++) {
      const currentLabelXPosition =
        livesLabelsPosition.x + i * (this.game.spaceShip.width / 2 + 10);

      ctx.beginPath();
      ctx.moveTo(currentLabelXPosition, livesLabelsPosition.y);
      ctx.lineTo(
        currentLabelXPosition - this.game.spaceShip.width / 4,
        livesLabelsPosition.y + this.game.spaceShip.height / 2
      );
      ctx.lineTo(
        currentLabelXPosition + this.game.spaceShip.width / 4,
        livesLabelsPosition.y + this.game.spaceShip.height / 2
      );

      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }

  drawLevelInfo(ctx) {
    ctx.font = '40px ZenDots';
    ctx.fillStyle = `rgba(255,255,255,${this.game.levelInfoOpacity})`;
    ctx.textAlign = 'center';

    ctx.fillText(
      `Level ${this.game.level}`,
      this.game.gameWidth / 2,
      this.game.gameHeight / 2 + 15
    );
  }

  drawScore(ctx) {
    ctx.save();
    ctx.font = '20px ZenDots';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';

    ctx.fillText(this.game.bestScore, 110, 35);
    ctx.fillText(this.game.score, this.game.gameWidth / 2, 35);
    ctx.restore();
  }

  draw(ctx) {
    this.drawLivesLabels(ctx);
    this.drawLevelInfo(ctx);
    this.drawScore(ctx);
  }
}
