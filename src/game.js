import GAME_STATE from './gameStates.js';
import SpaceShip from './space-ship.js';
import Input from './input.js';
import Missile from './missile.js';
import Position from './position.js';
import Asteroid from './asteroid.js';

export default class Game {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.gameState = GAME_STATE.WELCOME_MENU;
    this.initializeDefaults();

    this.showLevelInfo();
  }

  initializeDefaults() {
    this.spaceShip = new SpaceShip(this);
    this.setInputHandler(this.spaceShip);
    this.missiles = [];
    this.level = 1;
    this.asteroids = this.createAsteroids(2);
    this.levelInfoOpacity = 0;
    this.score = 0;

    const localStorageBestScore = window.localStorage.getItem(
      'neonAsteroidsBestScore'
    );
    this.bestScore = localStorageBestScore ? localStorageBestScore : 0;
  }

  setInputHandler(spaceShip) {
    if (this.inputHandler) {
      this.inputHandler.setSpaceShip(spaceShip);
    } else {
      this.inputHandler = new Input(spaceShip, this);
    }
  }

  createAsteroids(
    quantity,
    position = new Position(this.gameWidth / 2, this.gameHeight / 2),
    size = 3
  ) {
    const { minSpeed: asteroidMinSpeed, maxSpeed: asteroidMaxSpeed } =
      this.getAsteroidsMinMaxSpeed();

    const asteroids = [];
    for (let i = 0; i < quantity; i++) {
      asteroids.push(
        new Asteroid(
          this,
          new Position(position.x, position.y),
          size,
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

  getScoreForAsteroid(asteroid) {
    switch (asteroid.size) {
      case 3:
        return 20;
      case 2:
        return 50;
      case 1:
        return 100;
    }
  }

  onAsteroidCollision(asteroid) {
    new Audio('/assets/sounds/asteroid-explode.wav').play();

    let scoreForAsteroid = this.getScoreForAsteroid(asteroid);

    this.score += scoreForAsteroid;
  }

  resolveGameOver() {
    if (this.spaceShip.lives === 0) {
      if (this.score > this.bestScore) {
        window.localStorage.setItem('neonAsteroidsBestScore', this.score);
        this.bestScore = this.score;
      }

      this.gameState = GAME_STATE.GAMEOVER;
    }
  }

  onSpaceShipCollision() {
    new Audio('/assets/sounds/spaceship-explode.wav').play();

    this.spaceShip.lives--;

    this.resolveGameOver();

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

  drawLivesLabels(ctx) {
    const livesLabelsPosition = new Position(this.gameWidth - 168, 15);
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.shadowColor = '#4d706b';
    ctx.shadowBlur = 7;

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

      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }

  drawLevelInfo(ctx) {
    ctx.font = '40px ZenDots';
    ctx.fillStyle = `rgba(255,255,255,${this.levelInfoOpacity})`;
    ctx.textAlign = 'center';

    ctx.fillText(
      `Level ${this.level}`,
      this.gameWidth / 2,
      this.gameHeight / 2 + 15
    );
  }

  drawScore(ctx) {
    ctx.save();
    ctx.font = '20px ZenDots';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';

    ctx.fillText(this.bestScore, 110, 35);
    ctx.fillText(this.score, this.gameWidth / 2, 35);
    ctx.restore();
  }

  draw(ctx) {
    if (
      this.gameState === GAME_STATE.RUNNING ||
      this.gameState === GAME_STATE.PAUSED
    ) {
      this.spaceShip.draw(ctx);
      this.missiles.forEach((missile) => missile.draw(ctx));
      this.asteroids.forEach((asteroid) => asteroid.draw(ctx));

      this.drawLivesLabels(ctx);
      this.drawLevelInfo(ctx);
      this.drawScore(ctx);
    }
    if (this.gameState === GAME_STATE.WELCOME_MENU) {
      ctx.save();
      ctx.font = '60px ZenDots';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';

      ctx.fillText('Asteroids', this.gameWidth / 2, this.gameHeight / 2);

      ctx.font = '23px ZenDots';
      ctx.fillText(
        'Click Enter to start',
        this.gameWidth / 2,
        this.gameHeight / 2 + 50
      );
      ctx.restore();
    }
    if (this.gameState === GAME_STATE.GAMEOVER) {
      ctx.save();
      ctx.font = '40px ZenDots';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';

      ctx.fillText('Game Over', this.gameWidth / 2, this.gameHeight / 2 - 70);
      ctx.font = '23px ZenDots';
      ctx.fillText(
        `Your score: ${this.score}`,
        this.gameWidth / 2,
        this.gameHeight / 2 - 20
      );
      ctx.fillText(
        `Best score: ${this.bestScore}`,
        this.gameWidth / 2,
        this.gameHeight / 2 + 30
      );
      ctx.fillText(
        'Click Enter to restart',
        this.gameWidth / 2,
        this.gameHeight / 2 + 80
      );
      ctx.restore();
    }
  }

  showLevelInfo() {
    this.levelInfoOpacity = 1;

    const levelInfoOpacityInterval = setInterval(() => {
      this.levelInfoOpacity = this.levelInfoOpacity - 0.01;
      if (this.levelInfoOpacity <= 0) clearInterval(levelInfoOpacityInterval);
    }, 50);
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

    const asteroidsQuantity = this.getAsteroidsLevelQuantity();

    this.asteroids = this.createAsteroids(asteroidsQuantity);

    this.showLevelInfo();
  }

  createSmallerAsteroids(asteroid) {
    const smallerAsteroids = this.createAsteroids(
      2,
      asteroid.position,
      asteroid.size - 1
    );

    return smallerAsteroids;
  }

  start() {
    if (
      this.gameState === GAME_STATE.WELCOME_MENU ||
      this.gameState === GAME_STATE.GAMEOVER
    ) {
      this.initializeDefaults();
      this.gameState = GAME_STATE.RUNNING;
    }
  }

  deleteMarkedAsteroids() {
    this.asteroids = this.asteroids.filter(
      (asteroid) => !asteroid.markedForDeletion
    );
  }

  shouldAsteroidSpawnNewAsteroids(asteroid) {
    return asteroid.markedForDeletion && asteroid.size > 1;
  }

  update(deltaTime) {
    if (
      this.gameState === GAME_STATE.WELCOME_MENU ||
      this.gameState === GAME_STATE.GAMEOVER
    )
      return;
    this.spaceShip.update(deltaTime);
    this.missiles = this.missiles.filter(
      (missile) => !missile.markedForDeletion
    );
    this.missiles.forEach((missile) => missile.update(deltaTime));
    this.asteroids.forEach((asteroid) => {
      asteroid.update(deltaTime);
      if (this.shouldAsteroidSpawnNewAsteroids(asteroid)) {
        const smallerAsteroids = this.createSmallerAsteroids(asteroid);
        this.asteroids = [...smallerAsteroids, ...this.asteroids];
      }
    });

    this.deleteMarkedAsteroids();

    if (this.asteroids.length === 0) {
      this.loadNextLevel();
    }
  }

  clear(ctx) {
    ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
  }
}
