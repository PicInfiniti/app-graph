import "fake-indexeddb/auto";
import Mixed from "../../src/_graphology/graph/mixed.js";
import { loadAppModules } from "./app-modules.js";

export async function createGraphManager(t) {
  globalThis.document = {};
  t.after(() => delete globalThis.document);
  const {
    manager: module,
    database,
    graphTypes,
  } = await loadAppModules(t, {
    manager: "src/graph/graphManager.js",
    database: "src/core/db.js",
    graphTypes: "src/_graphology/graph/index.js",
  });
  const { db } = database;
  await db.delete();
  await db.open();
  t.after(() => db.delete());
  const calls = [];
  const listeners = new Map();
  const graph = new graphTypes.Mixed();
  graph.addNode(0, { x: 100, y: 100 });
  const manager = Object.create(module.GraphManager.prototype);
  Object.assign(manager, {
    _saveQueue: Promise.resolve(),
    index: -1,
    settings: { saveHistory: true, historyLimit: 100 },
    graphClass: {
      mixed: graphTypes.Mixed,
      directed: graphTypes.DirectedGraph,
      undirected: graphTypes.UndirectedGraph,
    },
    graphs: { index: 0, all: [graph] },
    eventBus: {
      on: (event, callback) => listeners.set(event, callback),
      emit(event, detail) {
        calls.push(["event", event, detail]);
        listeners.get(event)?.({ detail });
      },
    },
    graphsPanel: { updateGraphsPanel: () => calls.push(["graphs"]) },
    facePanel: { updateFacePanel: () => calls.push(["faces"]) },
    app: { updateSimulation: () => calls.push(["simulation"]) },
    redraw: () => calls.push(["redraw"]),
  });
  manager.setupEventListeners();
  return { manager, db, calls };
}

export function snapshot(id, label = `Graph ${id}`) {
  const graph = new Mixed();
  graph.addNode(0, { label, x: 100, y: 100 });
  return {
    id,
    version: 1,
    index: 0,
    all: [graph.export()],
    timestamp: id,
    action: label,
  };
}
