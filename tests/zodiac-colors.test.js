import assert from "node:assert/strict";
import test from "node:test";
import Mixed from "../src/_graphology/graph/mixed.js";
import { Zodiac } from "../src/generator/zodiac.js";
import constellations from "../src/generator/constellations.json" with { type: "json" };

function generator() {
  const settings = {
    ...new Mixed().defaultColors,
    type: "mixed",
    label_color: "#ffffff",
    edge_color: "#60a5fa",
  };
  const layouts = [];
  const manager = {
    settings,
    graphClass: { mixed: Mixed },
    layout: { applyLayout: (name) => layouts.push(name) },
  };
  return { zodiac: new Zodiac(manager), manager, layouts };
}

for (const [name, data] of Object.entries(constellations)) {
  test(`${name} uses the Night Sky label color for stars and edges`, () => {
    const { zodiac, manager, layouts } = generator();
    zodiac.load(name);
    const graph = manager.graph;
    assert.equal(graph.order, data.stars.length);
    assert.ok(graph.size > 0);
    graph.forEachNode((_, attrs) => {
      assert.equal(attrs.labelColor, "#ffffff");
    });
    graph.forEachEdge((_, attrs) => {
      assert.equal(attrs.labelColor, "#ffffff");
      assert.equal(attrs.color, "#60a5fa");
    });
    for (const star of data.stars) {
      const attrs = graph.getNodeAttributes(star.id);
      assert.equal(attrs.label, star.label);
      assert.equal(attrs.magnitude, star.magnitude);
      assert.equal(attrs.size, Math.pow(0.8, star.magnitude));
    }
    assert.deepEqual(layouts, ["rotate180"]);
  });
}

test("zodiac generation uses the latest chosen label color", () => {
  const { zodiac, manager } = generator();
  zodiac.aries();
  manager.settings.label_color = "#ff0000";
  zodiac.taurus();
  manager.graph.forEachNode((_, attrs) => {
    assert.equal(attrs.labelColor, "#ff0000");
  });
  manager.graph.forEachEdge((_, attrs) => {
    assert.equal(attrs.labelColor, "#ff0000");
  });
});
