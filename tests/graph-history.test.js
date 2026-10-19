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
