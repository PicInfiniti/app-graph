import assert from "node:assert/strict";
import test from "node:test";
import { forceLink, forceSimulation } from "d3";
import Mixed from "../src/_graphology/graph/mixed.js";

for (const type of ["mixed", "directed"]) {
  test(`cutting and pasting directed edges preserves valid simulation endpoints in a ${type} graph`, () => {
    const graph = new Mixed({ type });
    graph.addNode(1);
    graph.addNode(2);
    graph.addDirectedEdge(1, 2, { label: "Connection", weight: 5 });
    const copy = graph.subgraph(graph.nodes());
    graph.mergeWith(copy);
    graph.dropNode("1");
    graph.dropNode("2");

    const [edge] = graph.edges();
    const attrs = graph.getEdgeAttributes(edge);
    assert.deepEqual(graph.extremities(edge), ["3", "4"]);
    assert.equal(attrs.source, 3);
    assert.equal(attrs.target, 4);
    assert.equal(attrs.label, "Connection");
    assert.equal(attrs.weight, 5);

    const restored = new Mixed({ type });
    restored.import(JSON.parse(JSON.stringify(graph.export())));
    const simulation = forceSimulation(restored.getNodesForD3()).stop();
    assert.doesNotThrow(() =>
      simulation.force(
        "link",
        forceLink(restored.getEdgesForD3()).id((node) => node.id),
      ),
    );
  });
}

test("repeated pastes into an empty graph allocate finite, unique element IDs", () => {
  const source = new Mixed();
  for (let node = 0; node < 3; node++) source.addNode(node);
  source.addEdge(0, 1);
  source.addEdge(1, 2);
  source.addEdge(2, 0);
  source.addFace(["0", "1", "2"], { label: "Triangle" });

  const target = new Mixed();
  target.mergeWith(source);
  target.mergeWith(source);
  assert.equal(target.order, 6);
  assert.equal(target.size, 6);
  assert.equal(target.faces().length, 2);
  const nodeIds = target.mapNodes((_, attrs) => attrs.id);
  const edgeIds = target.mapEdges((_, attrs) => attrs.id);
  const faceIds = target.faces().map((face) => {
    const attrs = target.getFaceAttributes(face);
    assert.equal(attrs.label, "Triangle");
    assert.ok(attrs.nodes.every((node) => target.hasNode(node)));
    return attrs.id;
  });
  for (const ids of [nodeIds, edgeIds, faceIds]) {
    assert.ok(ids.every(Number.isSafeInteger));
    assert.equal(new Set(ids).size, ids.length);
  }
});
