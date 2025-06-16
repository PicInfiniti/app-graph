import { isGraphConstructor } from "graphology-library/assertions";

export default function empty(GraphClass, order, types = {}) {
  if (!isGraphConstructor(GraphClass))
    throw new Error(
      "graphology-generators/classic/empty: invalid Graph constructor.",
    );

  var graph = new GraphClass(types);

  var i;

  for (i = 0; i < order; i++) graph.addNode(i);

  return graph;
}
