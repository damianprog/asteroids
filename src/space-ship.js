import Position from './position.js';

export default class SpaceShip {
  constructor(game) {
    this.game = game;
    this.position = new Position(200, 400);
    this.height = 50;
    this.width = 40;
    this.rotationSpeed = 0;
    this.radiansAngle = 0;
    this.propelSpeed = 0;
    this.isPropelling = false;

    this.speedX = 0;
    this.speedY = 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.position.x - this.height / 2, this.position.y);
    ctx.rotate(this.radiansAngle);
    ctx.translate(
      (this.position.x - this.height / 2) * -1,
      this.position.y * -1
    );
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.position.x - this.height, this.position.y - this.width / 2);
    ctx.lineTo(this.position.x - this.height, this.position.y + this.width / 2);
    ctx.closePath();
    ctx.shadowColor = '#4d706b';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
  }

  flipPosition() {
    const originX = this.position.x - this.height / 2;
    const originY = this.position.y;
    const longestDistanceFromOriginToEdge = Math.sqrt(
      Math.pow(this.height / 2, 2) + Math.pow(this.width / 2, 2)
    );

    const isPosXLessThanZero = originX < -longestDistanceFromOriginToEdge;
    const isPosXGreaterThanBoundary =
      originX > this.game.gameWidth + longestDistanceFromOriginToEdge;

    if (isPosXLessThanZero || isPosXGreaterThanBoundary) {
      this.position.x = isPosXLessThanZero
        ? this.game.gameWidth +
          this.height / 2 +
          longestDistanceFromOriginToEdge
        : -(longestDistanceFromOriginToEdge - this.height / 2);
    }

    const isPosYLessThanZero = originY < -longestDistanceFromOriginToEdge;
    const isPosYGreaterThanBoundary =
      originY > this.game.gameHeight + longestDistanceFromOriginToEdge;

    if (isPosYLessThanZero || isPosYGreaterThanBoundary) {
      this.position.y = isPosYLessThanZero
        ? this.game.gameHeight + longestDistanceFromOriginToEdge
        : -longestDistanceFromOriginToEdge;
    }
  }

  update(deltaTime) {
    this.radiansAngle =
      this.radiansAngle >= 2 * Math.PI
        ? 0
        : this.radiansAngle + this.rotationSpeed;

    const newSpeedX =
      this.speedX + this.propelSpeed * Math.cos(this.radiansAngle);
    const newSpeedY =
      this.speedY + this.propelSpeed * Math.sin(this.radiansAngle);

    const speedVectorLength = Math.sqrt(
      Math.pow(newSpeedX, 2) + Math.pow(newSpeedY, 2)
    );

    if (Math.abs(speedVectorLength) < 8) {
      this.speedX = newSpeedX;
      this.speedY = newSpeedY;
    }

    if (!this.isPropelling) {
      const angle = Math.atan2(this.speedY, this.speedX);

      if (this.speedX !== 0) {
        const oppositeSpeedX = -0.01 * Math.cos(angle);
        const newOppositeSpeedX = this.speedX + oppositeSpeedX;
        this.speedX =
          this.speedX > 0 && newOppositeSpeedX <= 0 ? 0 : newOppositeSpeedX;
      }

      if (this.speedY !== 0) {
        const oppositeSpeedY = -0.01 * Math.sin(angle);
        const newOppositeSpeedY = this.speedY + oppositeSpeedY;
        this.speedY =
          this.speedY > 0 && newOppositeSpeedY <= 0 ? 0 : newOppositeSpeedY;
      }
    }

    this.position.x = this.position.x + this.speedX;
    this.position.y = this.position.y + this.speedY;

    this.flipPosition();
  }

  rotateLeft() {
    this.rotationSpeed = -0.08;
  }

  rotateRight() {
    this.rotationSpeed = 0.08;
  }

  stopRotating() {
    this.rotationSpeed = 0;
  }

  propel() {
    this.isPropelling = true;
    this.propelSpeed = 0.1;
  }

  stopPropel() {
    this.isPropelling = false;
    this.propelSpeed = 0;
  }
}
