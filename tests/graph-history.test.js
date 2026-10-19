import assert from "node:assert/strict";
import test from "node:test";
import { createGraphManager, snapshot } from "./helpers/graph-manager.js";

test("editing without history still refreshes the canvas, panels, and simulation", async (t) => {
  const { manager, db, calls } = await createGraphManager(t);
  const original = [snapshot(1), snapshot(2)];
  await db.history.bulkAdd(original);
  manager.index = 0;
  manager.settings.saveHistory = false;

  manager.addNode(1, { x: 200, y: 200 });
  assert.deepEqual(calls, [["graphs"], ["faces"], ["simulation"], ["redraw"]]);
  await manager._saveQueue;
  assert.deepEqual(await db.history.toArray(), original);
  assert.equal(manager.graph.order, 2);

  calls.length = 0;
  await manager.saveGraphState("color", false);
  assert.deepEqual(calls, [["graphs"], ["faces"], ["redraw"]]);
});

test("rapid edits preserve intermediate states and queued undo removes one edit at a time", async (t) => {
  const { manager, db } = await createGraphManager(t);
  t.mock.method(Date, "now", () => 100);
  manager.graph.setNodeAttribute(0, "desc", { note: "Original" });
  manager.saveGraphState("initial");
  manager.graph.getNodeAttribute(0, "desc").note = "Edited";
  manager.addNode(1, { x: 200, y: 200 });
  manager.addNode(2, { x: 300, y: 300 });
  manager.eventBus.emit("undo");
  await manager._saveQueue;

  const saved = await db.history.toArray();
  assert.deepEqual(
    saved.map((entry) => entry.all[0].nodes.length),
    [1, 2, 3],
  );
  assert.equal(saved[0].all[0].nodes[0].attributes.desc.note, "Original");
  assert.equal(saved[1].all[0].nodes[0].attributes.desc.note, "Edited");
  assert.equal(manager.graph.order, 2);
  assert.equal(manager.index, 1);

  manager.eventBus.emit("redo");
  await manager._saveQueue;
  assert.equal(manager.graph.order, 3);

  manager.eventBus.emit("undo");
  manager.eventBus.emit("undo");
  await manager._saveQueue;
  assert.equal(manager.graph.order, 1);
  manager.addNode(3, { x: 400, y: 400 });
  await manager._saveQueue;
  assert.equal(await db.history.count(), 2);
  assert.equal(manager.index, 1);
  assert.deepEqual(manager.graph.nodes(), ["0", "3"]);
});

test("pruning history keeps the undo index on the last available snapshot", async (t) => {
  const { manager, db } = await createGraphManager(t);
  manager.settings.historyLimit = 2;
  manager.saveGraphState("initial");
  manager.addNode(1);
  manager.addNode(2);
  manager.addNode(3);
  await manager._saveQueue;
  assert.equal(await db.history.count(), 2);
  assert.equal(manager.index, 1);
  manager.eventBus.emit("undo");
  await manager._saveQueue;
  assert.equal(manager.graph.order, 3);
});

test("failed snapshot writes preserve the redo branch and current history index", async (t) => {
  const { manager, db } = await createGraphManager(t);
  const original = [snapshot(1), snapshot(2)];
  await db.history.bulkAdd(original);
  manager.index = 0;
  t.mock.method(db.history, "add", async () => {
    throw new Error("Write failed");
  });
  t.mock.method(console, "error", () => {});

  await manager.saveGraphState("failed edit");
  assert.deepEqual(await db.history.toArray(), original);
  assert.equal(manager.index, 0);
});

test("graph type conversion saves one complete edit that can be undone", async (t) => {
  const { manager, db } = await createGraphManager(t);
  manager.graph.addNode(1);
  manager.graph.addEdge(0, 1);
  await manager.saveGraphState("initial");
  manager.toDirectedGraph();
  await manager._saveQueue;
  assert.equal(await db.history.count(), 2);
  assert.equal(manager.graph.type, "directed");
  assert.equal(manager.graph.order, 2);
  manager.eventBus.emit("undo");
  await manager._saveQueue;
  assert.equal(manager.graph.type, "mixed");
  assert.equal(manager.graph.order, 2);
  assert.equal(manager.graph.size, 1);
});

test("clearing history waits for pending edits", async (t) => {
  const { manager, db } = await createGraphManager(t);
  manager.saveGraphState("initial");
  manager.addNode(1);
  await manager.clearHistory();
  assert.equal(await db.history.count(), 0);
  assert.equal(manager.index, -1);
});
