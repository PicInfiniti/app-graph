import { isGraphConstructor } from "graphology-library/assertions";

export default function path(GraphClass, order, types = {}) {
  if (!isGraphConstructor(GraphClass))
    throw new Error(
      "graphology-generators/classic/path: invalid Graph constructor.",
    );

  var graph = new GraphClass(types);

  for (var i = 0; i < order - 1; i++) graph.mergeEdge(i, i + 1);

  return graph;
}
