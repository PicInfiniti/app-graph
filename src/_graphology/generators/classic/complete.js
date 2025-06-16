import { isGraphConstructor } from "graphology-library/assertions";

export default function complete(GraphClass, order, types = {}) {
  if (!isGraphConstructor(GraphClass))
    throw new Error(
      "graphology-generators/classic/complete: invalid Graph constructor.",
    );

  var graph = new GraphClass(types);

  var i, j;

  for (i = 0; i < order; i++) graph.addNode(i);

  for (i = 0; i < order; i++) {
    for (j = i + 1; j < order; j++) {
      if (graph.type !== "directed") graph.addUndirectedEdge(i, j);

      if (graph.type !== "undirected") {
        graph.addDirectedEdge(i, j);
        graph.addDirectedEdge(j, i);
      }
    }
  }

  return graph;
}
