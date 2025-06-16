import { isGraphConstructor } from "graphology-library/assertions";
import { empty } from "../classic";

export default function caveman(GraphClass, l, k, types = {}) {
  if (!isGraphConstructor(GraphClass))
    throw new Error(
      "graphology-generators/community/caveman: invalid Graph constructor.",
    );

  var m = l * k;

  var graph = empty(GraphClass, m, types);

  if (k < 2) return graph;

  var i, j, s;

  for (i = 0; i < m; i += k) {
    for (j = i; j < i + k; j++) {
      for (s = j + 1; s < i + k; s++) graph.addEdge(j, s);
    }
  }

  return graph;
}
