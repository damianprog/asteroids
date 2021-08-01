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
    this.asteroids = this.createAsteroids(2);
    this.levelInfoOpacity = 0;

    this.showLevelInfo();
  }

  createAsteroids(quantity, asteroidMinSpeed, asteroidMaxSpeed) {
    const asteroids = [];
    for (let i = 0; i < quantity; i++) {
      asteroids.push(
        new Asteroid(
          this,
          new Position(250, 200),
          3,
          asteroidMinSpeed,
          asteroidMaxSpeed
        )
      );
    }

    return asteroids;
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
    new Audio('/assets/sounds/spaceship-explode.wav').play();

    this.spaceShip.lives--;
    this.spaceShip.position.x = this.gameWidth / 2;
    this.spaceShip.position.y = this.gameHeight / 2;
    this.spaceShip.speedX = 0;
    this.spaceShip.speedY = 0;

    this.spaceShip.startImmortality();
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

    ctx.font = '40px ZenDots';
    ctx.fillStyle = `rgba(255,255,255,${this.levelInfoOpacity})`;
    ctx.textAlign = 'center';

    ctx.fillText(
      `Level ${this.level}`,
      this.gameWidth / 2,
      this.gameHeight / 2 + 15
    );
  }

  showLevelInfo() {
    this.levelInfoOpacity = 1;

    const levelInfoOpacityInterval = setInterval(() => {
      this.levelInfoOpacity = this.levelInfoOpacity - 0.01;
      if (this.levelInfoOpacity <= 0) clearInterval(levelInfoOpacityInterval);
    }, 30);
  }

  getAsteroidsMinMaxSpeed() {
    let additionalSpeed = Math.floor(this.level / 2) / 100;
    if (this.level % 2 === 0) additionalSpeed = additionalSpeed - 0.01;

    let asteroidMinSpeed = Asteroid.defaultMinSpeed;
    let asteroidMaxSpeed = Asteroid.defaultMaxSpeed;

    return {
      minSpeed: asteroidMinSpeed + additionalSpeed,
      maxSpeed: asteroidMaxSpeed + additionalSpeed,
    };
  }

  getAsteroidsLevelQuantity() {
    return this.level < 8 ? 2 + Math.floor(this.level / 2) : 6;
  }

  loadNextLevel() {
    this.level++;
    this.spaceShip.startImmortality();

    const asteroidsQuantity = getAsteroidsLevelQuantity();

    const { minSpeed: asteroidMinSpeed, maxSpeed: asteroidMaxSpeed } =
      this.getAsteroidsMinMaxSpeed();

    this.asteroids = this.createAsteroids(
      asteroidsQuantity,
      asteroidMinSpeed,
      asteroidMaxSpeed
    );

    this.showLevelInfo();
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
        const { minSpeed: asteroidMinSpeed, maxSpeed: asteroidMaxSpeed } =
          this.getAsteroidsMinMaxSpeed();
        const newAsteroids = [
          new Asteroid(
            this,
            { ...asteroid.position },
            asteroid.size - 1,
            asteroidMinSpeed,
            asteroidMaxSpeed
          ),
          new Asteroid(
            this,
            { ...asteroid.position },
            asteroid.size - 1,
            asteroidMinSpeed,
            asteroidMaxSpeed
          ),
        ];
        this.asteroids = [...newAsteroids, ...this.asteroids];
      }
    });

    this.asteroids = this.asteroids.filter(
      (asteroid) => !asteroid.markedForDeletion
    );

    if (this.asteroids.length === 0) {
      this.loadNextLevel();
    }
  }

  clear(ctx) {
    ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
  }
}
