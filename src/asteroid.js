import collisionDetection from './collision-detection.js';
import Position from './position.js';

export default class Asteroid {
  constructor(game, position, size = 3) {
    this.game = game;
    this.position = position;
    this.size = size;
    this.markedForDeletion = false;
    this.shapes = [
      [
        {
          x: 26 * this.size,
          y: 13 * this.size,
        },
        {
          x: 20 * this.size,
          y: 33 * this.size,
        },
        {
          x: -7 * this.size,
          y: 47 * this.size,
        },
        {
          x: -20 * this.size,
          y: 13 * this.size,
        },
      ],
    ];
    this.currentShape = this.shapes[0];
    this.speed = Math.random() * 2 + 1;
    this.speedX = Math.random() * this.speed;
    this.speedY = this.speed - Math.abs(this.speedX);

    if (Math.random() > 0.5) this.speedX = this.speedX * -1;
    if (Math.random() > 0.5) this.speedY = this.speedY * -1;
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

  update(deltaTime) {
    this.game.missiles.forEach((missile, index) => {
      if (
        collisionDetection(
          this.getVerticesPositions(),
          missile.getVerticesPositions()
        )
      ) {
        this.markedForDeletion = true;
        missile.markedForDeletion = true;
      }
    });

    this.position.x += this.speedX;
    this.position.y += this.speedY;

    this.flipPosition();
  }
}
