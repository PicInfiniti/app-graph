import assert from "node:assert/strict";
import test from "node:test";
import Mixed from "../src/_graphology/graph/mixed.js";
import { loadAppModules } from "./helpers/app-modules.js";

test("partial redraws keep visible nodes and edges available to click detection", async (t) => {
  const { renderer: rendererModule, canvas: canvasModule } =
    await loadAppModules(t, {
      renderer: "src/graph/graphRenderer.js",
      canvas: "src/core/canvas.js",
    });
  const graph = new Mixed();
  graph.addNode(0, { x: 100, y: 100 });
  graph.addNode(1, { x: 300, y: 100 });
  graph.addNode(2, { x: 200, y: 300 });
  graph.addEdge(0, 1);
  graph.addEdge(1, 2);
  graph.addEdge(2, 0);
  graph.addFace(["0", "1", "2"]);
  const context = new Proxy({}, { get: () => () => {} });
  const layer = { canvas: { width: 800, height: 600 }, ctx: context };
  const app = {
    graphManager: { graph },
    _canvas: {
      _canvas: { main: layer, node: layer, edge: layer, face: layer },
    },
    settings: {
      label_pos: { x: 0, y: 0 },
      node_radius: 40,
      stroke_size: 2,
      edge_size: 2,
      label_size: 15,
    },
    rect: { draw() {} },
  };
  app.graphRenderer = new rendererModule.GraphRenderer(app);
  const canvas = Object.create(canvasModule.Canvas.prototype);
  Object.assign(canvas, { app, settings: app.settings });

  app.graphRenderer.drawGraph();
  for (const options of [{ edge: true }, { node: true }, { rect: true }]) {
    app.graphRenderer.drawGraph(options);
    assert.equal(canvas.findClickedNode(100, 100).id, 0);
    const edge = canvas.findClickedEdge(200, 100);
    assert.equal(edge.source.id, 0);
    assert.equal(edge.target.id, 1);
    assert.equal(app.graphRenderer.visible.node.length, 3);
    assert.equal(app.graphRenderer.visible.edge.length, 3);
    assert.equal(app.graphRenderer.visible.face.length, 1);
  }

  // Redrawing a changed layer must still remove its stale hit-test entries.
  graph.dropNode("0");
  app.graphRenderer.drawGraph({ node: true });
  assert.equal(canvas.findClickedNode(100, 100), undefined);
  assert.equal(app.graphRenderer.visible.node.length, 2);
});
