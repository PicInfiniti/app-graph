import assert from "node:assert/strict";
import test from "node:test";
import { createGraphManager, snapshot } from "./helpers/graph-manager.js";

test("history import validates before replacement and rolls back write failures", async (t) => {
  const { manager, db } = await createGraphManager(t);
  const original = snapshot(1, "Original work");
  await db.history.add(original);
  const originalGraphs = manager.graphs;

  const badFace = snapshot(2);
  badFace.all[0].faces = [{ nodes: ["0", "1", "2"], attributes: {} }];
  const badIndex = { ...snapshot(2), index: 10 };
  const badEdge = snapshot(2);
  badEdge.all[0].edges = [{ source: "0", target: "missing" }];
  for (const invalid of [
    [],
    [{ id: 1 }],
    [snapshot(2), { id: 3 }],
    [badFace],
    [badIndex],
    [badEdge],
  ]) {
    await assert.rejects(manager.importHistory(invalid));
    assert.deepEqual(await db.history.toArray(), [original]);
    assert.equal(manager.graphs, originalGraphs);
  }

  // Duplicate primary keys fail after clear() has run inside the transaction.
  await assert.rejects(manager.importHistory([snapshot(2), snapshot(2)]));
  assert.deepEqual(await db.history.toArray(), [original]);
  assert.equal(manager.graphs, originalGraphs);

  // A failed import must not poison the save queue or the next import.
  manager.index = 7;
  await manager.importHistory([snapshot(30, "Latest"), snapshot(10, "First")]);
  assert.deepEqual(
    (await db.history.toArray()).map((entry) => entry.id),
    [10, 30],
  );
  assert.equal(manager.graph.getNodeAttribute(0, "label"), "Latest");
  assert.equal(manager.index, 1);
  await manager.updateIndex(0);
  assert.equal(manager.graph.getNodeAttribute(0, "label"), "First");
});

test("invalid snapshot loading keeps the current workspace intact", async (t) => {
  const { manager } = await createGraphManager(t);
  const original = manager.graphs;
  assert.throws(() => manager.loadSnapshot({ ...snapshot(1), all: [{}] }));
  assert.equal(manager.graphs, original);
});
