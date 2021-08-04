import GAME_STATE from './gameStates.js';
import SpaceShip from './space-ship.js';
import Input from './input.js';
import Missile from './missile.js';
import Position from './position.js';
import Asteroid from './asteroid.js';
import Hud from './hud.js';
import InfoPanels from './infoPanels.js';

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

    this.infoPanels = new InfoPanels(this);
    this.hud = new Hud(this);
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
    position = new Position(150, this.gameHeight / 2),
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

  draw(ctx) {
    if (this.gameState === GAME_STATE.RUNNING) {
      this.spaceShip.draw(ctx);
      this.missiles.forEach((missile) => missile.draw(ctx));
      this.asteroids.forEach((asteroid) => asteroid.draw(ctx));

      this.hud.draw(ctx);
    }
    if (this.gameState === GAME_STATE.WELCOME_MENU) {
      this.infoPanels.drawWelcomeMenu(ctx);
    }
    if (this.gameState === GAME_STATE.GAMEOVER) {
      this.infoPanels.drawGameover(ctx);
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

  deleteMarkedMissiles() {
    this.missiles = this.missiles.filter(
      (missile) => !missile.markedForDeletion
    );
  }

  shouldAsteroidSpawnNewAsteroids(asteroid) {
    return asteroid.markedForDeletion && asteroid.size > 1;
  }

  spawnAsteroidsForMarkedAstroids() {
    this.asteroids.forEach((asteroid) => {
      if (this.shouldAsteroidSpawnNewAsteroids(asteroid)) {
        const smallerAsteroids = this.createSmallerAsteroids(asteroid);
        this.asteroids = [...smallerAsteroids, ...this.asteroids];
      }
    });
  }

  update(deltaTime) {
    if (
      this.gameState === GAME_STATE.WELCOME_MENU ||
      this.gameState === GAME_STATE.RUNNING
    ) {
      this.asteroids.forEach((asteroid) => asteroid.update(deltaTime));
    }

    if (this.gameState === GAME_STATE.RUNNING) {
      this.spaceShip.update(deltaTime);
      this.missiles.forEach((missile) => missile.update(deltaTime));
      this.deleteMarkedMissiles();

      this.spawnAsteroidsForMarkedAstroids();

      this.deleteMarkedAsteroids();

      if (this.asteroids.length === 0) {
        this.loadNextLevel();
      }
    }
  }

  clear(ctx) {
    ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
  }
}
