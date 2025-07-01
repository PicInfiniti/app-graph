import { Mixed, DirectedGraph, UndirectedGraph } from "../_graphology/graph";
import { empty } from "graphology-generators/classic";

import forceAtlas2 from "graphology-layout-forceatlas2";

const graphClass = {
  directed: DirectedGraph,
  undirected: UndirectedGraph,
  mixed: Mixed,
};

self.onmessage = function (e) {
  const { type, graph: json, payload } = e.data;
  const graph = empty(graphClass[json.options.type], 0);
  graph.import(json);

  let result;

  try {
    switch (type) {
      case "force":
        result = forceAtlas2(graph, payload);
        break;

      default:
        throw new Error(`Unknown algorithm type: ${type}`);
    }

    self.postMessage({ type, result });
  } catch (err) {
    self.postMessage({ type, error: err.message });
  }
};
