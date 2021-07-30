import collisionDetection from './collision-detection.js';
import Position from './position.js';
import Shapes from './asteroid-shapes.js';

export default class Asteroid {
  constructor(game, position, size = 3) {
    this.game = game;
    this.position = position;
    this.size = size;
    this.markedForDeletion = false;
    this.currentShape = this.getRandomShape();
    this.speed = Math.random() * 0.08 + 0.04;
    this.speedX = Math.random() * this.speed;
    this.speedY = this.speed - Math.abs(this.speedX);
    // this.speedX = 0;
    // this.speedY = 0;

    if (Math.random() > 0.5) this.speedX = this.speedX * -1;
    if (Math.random() > 0.5) this.speedY = this.speedY * -1;
  }

  getRandomShape() {
    let randomShape = Shapes[Math.floor(Math.random() * Shapes.length)];
    randomShape = randomShape.map((vertice) => {
      return { x: vertice.x * this.size, y: vertice.y * this.size };
    });

    return randomShape;
  }

  getVerticesPositions() {
    let verticesPositions = this.currentShape.map((vertice) => {
      return new Position(
        this.position.x + vertice.x,
        this.position.y + vertice.y
      );
    });
    verticesPositions = [{ ...this.position }, ...verticesPositions];
    return verticesPositions;
  }

  draw(ctx) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    this.getVerticesPositions().forEach((vertice) => {
      ctx.lineTo(vertice.x, vertice.y);
    });
    ctx.closePath();
    ctx.stroke();
  }

  flipPosition() {
    let minXVertice = this.position;
    let maxXVertice = this.position;
    let minYVertice = this.position;
    let maxYVertice = this.position;

    let positionedVertices = this.getVerticesPositions();
    positionedVertices.forEach((vertice) => {
      if (vertice.x < minXVertice.x) minXVertice = { ...vertice };
      if (vertice.x > maxXVertice.x) maxXVertice = { ...vertice };
      if (vertice.y < minYVertice.y) minYVertice = { ...vertice };
      if (vertice.y > maxYVertice.y) maxYVertice = { ...vertice };
    });

    if (maxXVertice.x < 0) {
      const xOffset = Math.abs(this.position.x - minXVertice.x);
      this.position.x = this.game.gameWidth + xOffset;
    }
    if (minXVertice.x > this.game.gameWidth) {
      const xOffset = Math.abs(this.position.x - maxXVertice.x);
      this.position.x = 0 - xOffset;
    }
    if (maxYVertice.y < 0) {
      const yOffset = Math.abs(this.position.y - minYVertice.y);
      this.position.y = this.game.gameHeight + yOffset;
    }
    if (minYVertice.y > this.game.gameHeight) {
      const yOffset = Math.abs(this.position.y - maxYVertice.y);
      this.position.y = 0 - yOffset;
    }
  }

  detectCollisionWithMissile() {
    for (let missile of this.game.missiles) {
      if (
        collisionDetection(
          this.getVerticesPositions(),
          missile.getVerticesPositions()
        ) &&
        !missile.markedForDeletion
      ) {
        new Audio('/assets/sounds/asteroid-explode.wav').play();
        this.markedForDeletion = true;
        missile.markedForDeletion = true;
        break;
      }
    }
  }

  update(deltaTime) {
    this.detectCollisionWithMissile();

    this.position.x += this.speedX * deltaTime;
    this.position.y += this.speedY * deltaTime;

    this.flipPosition();
  }
}
