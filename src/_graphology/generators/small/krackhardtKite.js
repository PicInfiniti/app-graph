import { isGraphConstructor } from "graphology-library/assertions";
import { mergeStar } from "graphology-library/utils";

var ADJACENCY_NUMERIC = [
  [0, 1, 2, 3, 4],
  [1, 0, 5, 6],
  [2, 0, 3, 4],
  [3, 0, 1, 2, 5, 4, 6],
  [5, 1, 3, 6],
  [4, 0, 2, 3, 6, 7],
  [6, 1, 3, 5, 4, 7],
  [7, 4, 6, 8],
  [8, 7, 9],
  [9, 8],
];

export default function krackhardtKite(GraphClass, types = {}) {
  if (!isGraphConstructor(GraphClass))
    throw new Error("invalid Graph constructor.");

  var graph = new GraphClass(types),
    i,
    l;

  for (i = 0, l = ADJACENCY_NUMERIC.length; i < l; i++)
    mergeStar(graph, ADJACENCY_NUMERIC[i]);

  return graph;
}
