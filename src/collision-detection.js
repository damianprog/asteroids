import Position from './position.js';

export default (poly1Vertices, poly2Vertices) => {
  let shapeVertices1 = poly1Vertices;
  let shapeVertices2 = poly2Vertices;

  for (let shape = 0; shape < 2; shape++) {
    if (shape === 1) {
      shapeVertices1 = poly2Vertices;
      shapeVertices2 = poly1Vertices;
    }

    for (let a = 0; a < shapeVertices1.length; a++) {
      const aVertice = shapeVertices1[a];
      const bVertice = shapeVertices1[a + 1]
        ? shapeVertices1[a + 1]
        : shapeVertices1[0];

      const axis = new Position(
        -1 * (bVertice.y - aVertice.y),
        bVertice.x - aVertice.x
      );

      let shape1MinAxisPoint = Infinity,
        shape1MaxAxisPoint = -Infinity;

      shapeVertices1.forEach((vertice) => {
        const projectedPoint = vertice.x * axis.x + vertice.y * axis.y;
        shape1MinAxisPoint = Math.min(shape1MinAxisPoint, projectedPoint);
        shape1MaxAxisPoint = Math.max(shape1MaxAxisPoint, projectedPoint);
      });

      let shape2MinAxisPoint = Infinity,
        shape2MaxAxisPoint = -Infinity;

      shapeVertices2.forEach((vertice) => {
        const projectedPoint = vertice.x * axis.x + vertice.y * axis.y;
        shape2MinAxisPoint = Math.min(shape2MinAxisPoint, projectedPoint);
        shape2MaxAxisPoint = Math.max(shape2MaxAxisPoint, projectedPoint);
      });

      if (
        !(
          shape2MaxAxisPoint >= shape1MinAxisPoint &&
          shape1MaxAxisPoint >= shape2MinAxisPoint
        )
      ) {
        return false;
      }
    }
  }

  return true;
};
