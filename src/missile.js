import Position from './position.js';

export default class Missile {
  constructor(game, position, radiansAngle) {
    this.image = document.querySelector('.missile');
    this.game = game;
    this.position = position;
    this.radiansAngle = radiansAngle;
    this.speed = 8;
    this.radius = 4;
    this.distanceTravelled = 0;
    this.markedForDeletion = false;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      2 * Math.PI,
      false
    );
    ctx.fillStyle = '#ccfef1';
    ctx.fill();
  }

  flipPosition() {
    const isPosXLessThanZero = this.position.x + this.radius < 0;
    const isPosXGreaterThanBoundary = this.position.x > this.game.gameWidth;

    if (isPosXLessThanZero || isPosXGreaterThanBoundary) {
      this.position.x = isPosXLessThanZero ? this.game.gameWidth : 0;
    }

    const isPosYLessThanZero = this.position.y + this.radius < 0;
    const isPosYGreaterThanBoundary = this.position.y > this.game.gameHeight;

    if (isPosYLessThanZero || isPosYGreaterThanBoundary) {
      this.position.y = isPosYLessThanZero ? this.game.gameHeight : 0;
    }
  }

  getVerticesPositions() {
    return [
      new Position(
        this.position.x - this.radius,
        this.position.y - this.radius
      ),
      new Position(
        this.position.x + this.radius,
        this.position.y - this.radius
      ),
      new Position(
        this.position.x + this.radius,
        this.position.y + this.radius
      ),
      new Position(
        this.position.x - this.radius,
        this.position.y + this.radius
      ),
    ];
  }

  update(deltaTime) {
    const distanceX = this.speed * Math.cos(this.radiansAngle);
    const distanceY = this.speed * Math.sin(this.radiansAngle);

    this.position.x = this.position.x + distanceX;
    this.position.y = this.position.y + distanceY;

    this.distanceTravelled += Math.sqrt(
      Math.pow(distanceX, 2) + Math.pow(distanceY, 2)
    );

    this.markedForDeletion = this.distanceTravelled > 300;

    this.flipPosition();
  }
}
