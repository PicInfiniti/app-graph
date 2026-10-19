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
