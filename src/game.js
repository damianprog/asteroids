import SpaceShip from './space-ship.js';
import Input from './input.js';
import Missile from './missile.js';
import Position from './position.js';
import Asteroid from './asteroid.js';

export default class Game {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.spaceShip = new SpaceShip(this);
    this.inputHandler = new Input(this.spaceShip, this);
    this.missiles = [];
    this.level = 1;
    this.asteroids = this.createAsteroids();
  }

  createAsteroids() {
    return [
      new Asteroid(this, new Position(250, 200)),
      // new Asteroid(this, new Position(250, 200)),
    ];
  }

  getVectorPosition(angle, length) {
    const vectorX = Math.cos(angle) * length;
    const vectorY = Math.sin(angle) * length;

    return new Position(vectorX, vectorY);
  }

  getMissileStartingPosition() {
    const vectorPosition = this.getVectorPosition(
      this.spaceShip.radiansAngle,
      this.spaceShip.height / 2
    );

    const spaceShipRotatedPositionX =
      this.spaceShip.position.x + vectorPosition.x;
    const spaceShipRotatedPositionY =
      this.spaceShip.position.y + vectorPosition.y;

    return new Position(spaceShipRotatedPositionX, spaceShipRotatedPositionY);
  }

  onSpaceShipCollision() {
    this.spaceShip.lives--;
    this.spaceShip.position.x = 400;
    this.spaceShip.position.y = 400;
  }

  createMissile() {
    const missileStartingPosition = this.getMissileStartingPosition();

    const missile = new Missile(
      this,
      missileStartingPosition,
      this.spaceShip.radiansAngle
    );

    this.missiles.push(missile);
  }

  draw(ctx) {
    this.spaceShip.draw(ctx);
    this.missiles.forEach((missile) => missile.draw(ctx));
    this.asteroids.forEach((asteroid) => asteroid.draw(ctx));

    const livesLabelsPosition = new Position(this.gameWidth - 150, 15);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';

    for (let i = 0; i < this.spaceShip.lives; i++) {
      const currentLabelXPosition =
        livesLabelsPosition.x + i * (this.spaceShip.width / 2 + 10);

      ctx.beginPath();
      ctx.moveTo(currentLabelXPosition, livesLabelsPosition.y);
      ctx.lineTo(
        currentLabelXPosition - this.spaceShip.width / 4,
        livesLabelsPosition.y + this.spaceShip.height / 2
      );
      ctx.lineTo(
        currentLabelXPosition + this.spaceShip.width / 4,
        livesLabelsPosition.y + this.spaceShip.height / 2
      );
      ctx.shadowColor = '#4d706b';
      ctx.shadowBlur = 7;
      ctx.closePath();
      ctx.stroke();
    }
  }

  update(deltaTime) {
    this.spaceShip.update(deltaTime);
    this.missiles = this.missiles.filter(
      (missile) => !missile.markedForDeletion
    );
    this.missiles.forEach((missile) => missile.update(deltaTime));
    this.asteroids.forEach((asteroid) => {
      asteroid.update(deltaTime);
      if (asteroid.markedForDeletion && asteroid.size > 1) {
        const newAsteroids = [
          new Asteroid(this, { ...asteroid.position }, asteroid.size - 1),
          new Asteroid(this, { ...asteroid.position }, asteroid.size - 1),
        ];
        this.asteroids = [...newAsteroids, ...this.asteroids];
      }
    });

    this.asteroids = this.asteroids.filter(
      (asteroid) => !asteroid.markedForDeletion
    );
  }

  clear(ctx) {
    ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
  }
}
