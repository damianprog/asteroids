export default (shape1Vertices, shape2Vertices) => {
  const normalVectors = getAllEdgesNormalVectors(
    shape1Vertices,
    shape2Vertices
  );

  for (const vector of normalVectors) {
    const { min: shape1Min, max: shape1Max } = getMinMaxDotProduct(
      vector,
      shape1Vertices
    );
    const { min: shape2Min, max: shape2Max } = getMinMaxDotProduct(
      vector,
      shape2Vertices
    );

    if (!(shape1Max >= shape2Min && shape1Min <= shape2Max)) return false;
  }

  return true;
};

const getAllEdgesNormalVectors = (shape1Vertices, shape2Vertices) => {
  const normalVectors = [];

  [shape1Vertices, shape2Vertices].forEach((shapeVertices) => {
    shapeVertices.forEach((currentVertice, index) => {
      const nextVertice = shapeVertices[index + 1]
        ? shapeVertices[index + 1]
        : shapeVertices[0];

      const normalX = -1 * (nextVertice.y - currentVertice.y);
      const normalY = nextVertice.x - currentVertice.x;

      normalVectors.push({ x: normalX, y: normalY });
    });
  });

  return normalVectors;
};

const getMinMaxDotProduct = (vector, vertices) => {
  let minDotProduct = Infinity;
  let maxDotProduct = -Infinity;

  vertices.forEach((vertice) => {
    const dotProduct = vertice.x * vector.x + vertice.y * vector.y;
    minDotProduct = Math.min(dotProduct, minDotProduct);
    maxDotProduct = Math.max(dotProduct, maxDotProduct);
  });

  return { min: minDotProduct, max: maxDotProduct };
};
