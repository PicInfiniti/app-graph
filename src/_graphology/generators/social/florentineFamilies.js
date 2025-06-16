import { isGraphConstructor } from "graphology-library/assertions";

var EDGES_NUMERIC = [
  [0, 1],
  [2, 3],
  [2, 4],
  [2, 5],
  [1, 5],
  [1, 6],
  [1, 7],
  [1, 8],
  [1, 9],
  [9, 10],
  [3, 4],
  [3, 11],
  [4, 6],
  [4, 11],
  [6, 7],
  [7, 12],
  [8, 13],
  [8, 12],
  [11, 12],
  [12, 14],
];

export default function florentineFamilies(GraphClass, types = {}) {
  if (!isGraphConstructor(GraphClass))
    throw new Error(
      "graphology-generators/social/florentine-families: invalid Graph constructor.",
    );

  var graph = new GraphClass(types),
    i,
    l;

  for (i = 0, l = EDGES_NUMERIC.length; i < l; i++) {
    graph.mergeEdge(EDGES_NUMERIC[i][0], EDGES_NUMERIC[i][1]);
  }

  return graph;
}
