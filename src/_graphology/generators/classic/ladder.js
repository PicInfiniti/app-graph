import { isGraphConstructor } from "graphology-library/assertions";

export default function ladder(GraphClass, length, types = {}) {
  if (!isGraphConstructor(GraphClass))
    throw new Error(
      "graphology-generators/classic/ladder: invalid Graph constructor.",
    );

  var graph = new GraphClass(types);

  var i;

  for (i = 0; i < length - 1; i++) graph.mergeEdge(i, i + 1);
  for (i = length; i < length * 2 - 1; i++) graph.mergeEdge(i, i + 1);
  for (i = 0; i < length; i++) graph.addEdge(i, i + length);

  return graph;
}
