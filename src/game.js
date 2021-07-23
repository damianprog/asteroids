import SpaceShip from './space-ship.js';
import Input from './input.js';
import Missile from './missile.js';
import Position from './position.js';

export default class Game {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.spaceShip = new SpaceShip(this);
    this.inputHandler = new Input(this.spaceShip, this);
    this.missiles = [];
  }

  getVectorPosition(angle, length) {
    const vectorX = Math.cos(angle) * length;
    const vectorY = Math.sin(angle) * length;

    return new Position(vectorX, vectorY);
  }

  getMissileStartingPosition() {
    const spaceShipOriginX =
      this.spaceShip.position.x - this.spaceShip.height / 2;
    const spaceShipOriginY = this.spaceShip.position.y;

    const vectorPosition = this.getVectorPosition(
      this.spaceShip.radiansAngle,
      this.spaceShip.height / 2
    );

    const spaceShipRotatedPositionX = spaceShipOriginX + vectorPosition.x;
    const spaceShipRotatedPositionY = spaceShipOriginY + vectorPosition.y;

    return new Position(spaceShipRotatedPositionX, spaceShipRotatedPositionY);
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

    // ctx.fillStyle = 'red';
    // ctx.fillRect(
    //   this.spaceShip.position.x - 3,
    //   this.spaceShip.position.y - 3,
    //   6,
    //   6
    // );

    // ctx.strokeStyle = '#fff';
    // ctx.strokeRect(200, 200, 50, 50);

    this.missiles.forEach((missile) => missile.draw(ctx));
  }

  update(deltaTime) {
    this.spaceShip.update(deltaTime);
    this.missiles = this.missiles.filter(
      (missile) => !missile.markedForDeletion
    );
    this.missiles.forEach((missile) => missile.update(deltaTime));
  }

  clear(ctx) {
    ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
  }
}
