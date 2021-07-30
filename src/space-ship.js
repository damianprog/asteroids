import collisionDetection from './collision-detection.js';
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
    this.lives = 5;
    this.isImmortal = false;
    this.immortalityDuration = 4000;
    this.showSpaceShip = true;

    this.speedX = 0;
    this.speedY = 0;

    this.startImmortality();
  }

  draw(ctx) {
    if (this.showSpaceShip) {
      ctx.save();
      ctx.translate(this.position.x, this.position.y);
      ctx.rotate(this.radiansAngle);
      ctx.translate(this.position.x * -1, this.position.y * -1);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(this.position.x + this.height / 2, this.position.y);
      ctx.lineTo(
        this.position.x - this.height / 2,
        this.position.y - this.width / 2
      );
      ctx.lineTo(
        this.position.x - this.height / 2,
        this.position.y + this.width / 2
      );
      ctx.closePath();
      ctx.shadowColor = '#4d706b';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    }
  }

  flipPosition() {
    const longestDistanceFromOriginToEdge = Math.sqrt(
      Math.pow(this.height / 2, 2) + Math.pow(this.width / 2, 2)
    );

    const isPosXLessThanZero =
      this.position.x < longestDistanceFromOriginToEdge * -1;
    const isPosXGreaterThanBoundary =
      this.position.x > this.game.gameWidth + longestDistanceFromOriginToEdge;

    if (isPosXLessThanZero || isPosXGreaterThanBoundary) {
      this.position.x = isPosXLessThanZero
        ? this.game.gameWidth + longestDistanceFromOriginToEdge
        : longestDistanceFromOriginToEdge * -1;
    }

    const isPosYLessThanZero =
      this.position.y < longestDistanceFromOriginToEdge * -1;
    const isPosYGreaterThanBoundary =
      this.position.y > this.game.gameHeight + longestDistanceFromOriginToEdge;

    if (isPosYLessThanZero || isPosYGreaterThanBoundary) {
      this.position.y = isPosYLessThanZero
        ? this.game.gameHeight + longestDistanceFromOriginToEdge
        : longestDistanceFromOriginToEdge * -1;
    }
  }

  getVerticesPositions() {
    let vertices = [
      new Position(this.height / 2, 0),
      new Position(-1 * (this.height / 2), this.width / 2),
      new Position(-1 * (this.height / 2), -1 * (this.width / 2)),
    ];

    vertices = vertices.map((vertice) => {
      const defaultAngle = Math.atan2(vertice.y, vertice.x);

      const currentAngle = defaultAngle + this.radiansAngle;

      const length = Math.sqrt(Math.pow(vertice.x, 2) + Math.pow(vertice.y, 2));

      const verticeX = this.position.x + Math.cos(currentAngle) * length;
      const verticeY = this.position.y + Math.sin(currentAngle) * length;

      return new Position(verticeX, verticeY);
    });

    return vertices;
  }

  detectCollisionWithAsteroids() {
    const spaceShipVertices = this.getVerticesPositions();

    for (let asteroid of this.game.asteroids) {
      const asteroidVertices = asteroid.getVerticesPositions();

      if (collisionDetection(spaceShipVertices, asteroidVertices)) {
        this.game.onSpaceShipCollision();
        break;
      }
    }
  }

  startImmortality() {
    this.isImmortal = true;

    const toggleShowSpaceShipInterval = setInterval(() => {
      this.showSpaceShip = !this.showSpaceShip;
    }, 200);

    setTimeout(() => {
      this.isImmortal = false;
      clearInterval(toggleShowSpaceShipInterval);
      this.showSpaceShip = true;
    }, this.immortalityDuration);
  }

  update(deltaTime) {
    this.radiansAngle =
      this.radiansAngle >= 2 * Math.PI
        ? 0
        : this.radiansAngle + this.rotationSpeed * deltaTime;

    const newSpeedX =
      this.speedX + this.propelSpeed * deltaTime * Math.cos(this.radiansAngle);
    const newSpeedY =
      this.speedY + this.propelSpeed * deltaTime * Math.sin(this.radiansAngle);

    const speedVectorLength = Math.sqrt(
      Math.pow(newSpeedX, 2) + Math.pow(newSpeedY, 2)
    );

    if (Math.abs(speedVectorLength) < 8) {
      this.speedX = newSpeedX;
      this.speedY = newSpeedY;
    }

    if (this.propelSpeed === 0) {
      this.speedX = this.getSlowerSpeed(this.speedX, deltaTime);
      this.speedY = this.getSlowerSpeed(this.speedY, deltaTime);
    }

    this.position.x = this.position.x + this.speedX;
    this.position.y = this.position.y + this.speedY;

    if (!this.isImmortal) {
      this.detectCollisionWithAsteroids();
    }

    this.flipPosition();
  }

  getSlowerSpeed(speed, deltaTime) {
    if (speed === 0) return 0;

    const oppositeSpeed = -0.0007 * deltaTime * speed;
    const newSpeed = speed + oppositeSpeed;
    const hasNewSpeedOppositeDirection =
      (speed > 0 && newSpeed < 0) || (speed < 0 && newSpeed > 0);

    return hasNewSpeedOppositeDirection ? 0 : newSpeed;
  }

  rotateLeft() {
    this.rotationSpeed = -0.005;
  }

  rotateRight() {
    this.rotationSpeed = 0.005;
  }

  stopRotating() {
    this.rotationSpeed = 0;
  }

  propel() {
    this.propelSpeed = 0.006;
  }

  stopPropel() {
    this.propelSpeed = 0;
  }
}
