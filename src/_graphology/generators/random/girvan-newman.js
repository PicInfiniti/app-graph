import { isGraphConstructor } from "graphology-library/assertions";

module.exports = function girvanNewman(GraphClass, options, types) {
  if (!isGraphConstructor(GraphClass))
    throw new Error(
      "graphology-generators/random/girvan-newman: invalid Graph constructor.",
    );

  var zOut = options.zOut,
    rng = options.rng || Math.random;

  if (typeof zOut !== "number")
    throw new Error(
      "graphology-generators/random/girvan-newman: invalid `zOut`. Should be a number.",
    );

  if (typeof rng !== "function")
    throw new Error(
      "graphology-generators/random/girvan-newman: invalid `rng`. Should be a function.",
    );

  var pOut = zOut / 96,
    pIn = (16 - pOut * 96) / 31,
    graph = new GraphClass(types),
    random,
    i,
    j;

  for (i = 0; i < 128; i++) graph.addNode(i);

  for (i = 0; i < 128; i++) {
    for (j = i + 1; j < 128; j++) {
      random = rng();

      if (i % 4 === j % 4) {
        if (random < pIn) graph.addEdge(i, j);
      } else {
        if (random < pOut) graph.addEdge(i, j);
      }
    }
  }

  return graph;
};
