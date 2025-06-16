import { isGraphConstructor } from "graphology-library/assertions";
import { empty } from "../classic";

module.exports = function connectedCaveman(GraphClass, l, k, types = {}) {
  if (!isGraphConstructor(GraphClass))
    throw new Error(
      "graphology-generators/community/connected-caveman: invalid Graph constructor.",
    );

  var m = l * k;

  var graph = empty(GraphClass, m, types);

  if (k < 2) return graph;

  var i, j, s;

  for (i = 0; i < m; i += k) {
    for (j = i; j < i + k; j++) {
      for (s = j + 1; s < i + k; s++) {
        if (j !== i || j !== s - 1) graph.addEdge(j, s);
      }
    }

    if (i > 0) graph.addEdge(i, (i - 1) % m);
  }

  graph.addEdge(0, m - 1);

  return graph;
};
