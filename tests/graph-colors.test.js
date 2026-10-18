import assert from "node:assert/strict";
import test from "node:test";
import Mixed from "../src/_graphology/graph/mixed.js";

function triangle() {
  const graph = new Mixed();
  for (let node = 0; node < 3; node++) graph.addNode(node);
  graph.addEdge(0, 1);
  graph.addEdge(1, 2);
  graph.addEdge(2, 0);
  graph.addFace(["0", "1", "2"]);
  return graph;
}

test("new graph elements use the current label color without recoloring existing elements", () => {
  const graph = new Mixed();
  const settings = { ...graph.defaultColors, label_color: "#ff0000" };
  graph.colors = settings;
  graph.addNode(0);
  graph.addNode(1, { labelColor: "#abcdef" });
  const redEdge = graph.addEdge(0, 1);
  assert.equal(graph.getNodeAttribute("0", "labelColor"), "#ff0000");
  assert.equal(graph.getNodeAttribute("1", "labelColor"), "#abcdef");
  assert.equal(graph.getEdgeAttribute(redEdge, "labelColor"), "#ff0000");

  settings.label_color = "#00ff00";
  graph.addNode(2);
  const greenEdge = graph.addEdge(1, 2);
  graph.addFace(["0", "1", "2"]);
  assert.equal(graph.getNodeAttribute("2", "labelColor"), "#00ff00");
  assert.equal(graph.getEdgeAttribute(greenEdge, "labelColor"), "#00ff00");
  assert.equal(graph.getFaceAttribute("0_1_2", "labelColor"), "#00ff00");
  assert.equal(graph.getNodeAttribute("0", "labelColor"), "#ff0000");
  assert.equal(graph.getEdgeAttribute(redEdge, "labelColor"), "#ff0000");
});

test("face colors and metadata survive a serialized graph round trip", () => {
  const graph = triangle();
  const face = "0_1_2";
  graph.setFaceAttribute(face, "id", 12);
  graph.setFaceAttribute(face, "color", "#12345680");
  graph.setFaceAttribute(face, "labelColor", "#00ff00");
  graph.setFaceAttribute(face, "label", "Custom face");

  const restored = new Mixed();
  restored.import(JSON.parse(JSON.stringify(graph.export())));
  assert.deepEqual(
    restored.getFaceAttributes(face),
    graph.getFaceAttributes(face),
  );
});

test("copying a subgraph preserves custom face label colors", () => {
  const graph = triangle();
  graph.setFaceAttribute("0_1_2", "labelColor", "rgba(255, 0, 0, 0.5)");
  const copy = graph.subgraph(graph.nodes());
  assert.equal(
    copy.getFaceAttribute("0_1_2", "labelColor"),
    "rgba(255, 0, 0, 0.5)",
  );
});

test("applying only a label color preserves node, stroke, edge, and face colors", () => {
  const graph = triangle();
  graph.selectNode("0");
  graph.selectEdge(graph.edge("0", "1"));
  graph.selectFace("0_1_2");
  const nodeColor = graph.getNodeAttribute("0", "color");
  const strokeColor = graph.getNodeAttribute("0", "stroke");
  const edgeColor = graph.getEdgeAttribute(graph.edge("0", "1"), "color");
  const faceColor = graph.getFaceAttribute("0_1_2", "color");

  graph.updateSelectedNodesColor(false, false, "#ff0000");
  graph.updateSelectedEdgesColor(false, "#ff0000");
  graph.updateSelectedFacesColor(false, "#ff0000");
  assert.equal(graph.getNodeAttribute("0", "labelColor"), "#ff0000");
  assert.equal(
    graph.getEdgeAttribute(graph.edge("0", "1"), "labelColor"),
    "#ff0000",
  );
  assert.equal(graph.getFaceAttribute("0_1_2", "labelColor"), "#ff0000");
  assert.equal(graph.getNodeAttribute("0", "color"), nodeColor);
  assert.equal(graph.getNodeAttribute("0", "stroke"), strokeColor);
  assert.equal(
    graph.getEdgeAttribute(graph.edge("0", "1"), "color"),
    edgeColor,
  );
  assert.equal(graph.getFaceAttribute("0_1_2", "color"), faceColor);
});
