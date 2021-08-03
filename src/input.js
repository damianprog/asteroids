export default class Input {
  constructor(spaceShip, game) {
    this.spaceShip = spaceShip;
    this.game = game;

    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          this.spaceShip.rotateLeft();
          break;

        case 'ArrowRight':
          this.spaceShip.rotateRight();
          break;

        case 'ArrowUp':
          this.spaceShip.propel();
          break;

        case ' ':
          if (event.repeat) break;
          this.game.createMissile();
          break;

        case 'Enter':
          this.game.start();
          break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          if (this.spaceShip.rotationSpeed < 0) this.spaceShip.stopRotating();
          break;

        case 'ArrowRight':
          if (this.spaceShip.rotationSpeed > 0) this.spaceShip.stopRotating();
          break;
        case 'ArrowUp':
          this.spaceShip.stopPropel();
          break;
      }
    });
  }

  setSpaceShip(spaceShip) {
    this.spaceShip = spaceShip;
  }
}
