// renderer-worker.js
import { Mixed, DirectedGraph, UndirectedGraph } from "../../_graphology/graph";
import { GraphRenderer } from "./GraphRenderer.js";

const graphClass = {
  directed: DirectedGraph,
  undirected: UndirectedGraph,
  mixed: Mixed,
};

let renderer;

onmessage = function (e) {
  const { type } = e.data;

  if (type === "init") {
    const { canvas, graph: json, settings } = e.data;

    const ctx = canvas.getContext("2d");
    graph.import(json);

    renderer = new GraphRenderer(
      { graph }, // fake graphManager
      canvas,
      { settings },
      rect,
      ctx,
    );
  }

  if (type === "render" && renderer) {
    renderer.drawGraph();
  }

  if (type === "update" && renderer) {
    const { graphData, settings, rect } = e.data;
    renderer.graphManager.graph = Graph.from(graphData);
    renderer.appSettings.settings = settings;
    renderer.rect = rect;
  }
};
