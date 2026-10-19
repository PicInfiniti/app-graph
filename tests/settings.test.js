import "fake-indexeddb/auto";
import assert from "node:assert/strict";
import test from "node:test";
import { loadAppModules } from "./helpers/app-modules.js";

test("debounced autosave persists every changed setting and complete themes", async (t) => {
  const element = {
    classList: { toggle() {} },
    style: { setProperty() {} },
  };
  globalThis.document = {
    querySelector: () => element,
    getElementById: () => element,
    documentElement: element,
  };
  t.after(() => delete globalThis.document);
  const { state, database } = await loadAppModules(t, {
    state: "src/core/state.js",
    database: "src/core/db.js",
  });
  const { db } = database;
  await db.delete();
  await db.open();
  t.after(() => db.delete());
  const app = {
    eventBus: { on() {} },
    canvas: element,
    graphManager: {},
    widget: { init() {} },
  };
  const settings = new state.default(app);
  await settings.init();
  t.mock.timers.enable({ apis: ["setTimeout"] });

  settings.setSetting("node_radius", 55);
  settings.setSetting("edge_size", 4);
  settings.toggleSetting("vertexLabel");
  t.mock.timers.tick(500);
  t.mock.timers.reset();

  let saved = await db.settings.get("appSettings");
  assert.equal(saved.node_radius, 55);
  assert.equal(saved.edge_size, 4);
  assert.equal(saved.vertexLabel, false);
  assert.equal(saved.historyLimit, settings.defaultSettings.historyLimit);
  assert.deepEqual(app.graphManager.needsRedraw, { edge: true });

  t.mock.timers.enable({ apis: ["setTimeout"] });
  settings.setAllSettings(settings.nightSkyTheme);
  settings.setSetting("label_color", "#ff0000");
  t.mock.timers.tick(500);
  t.mock.timers.reset();

  saved = await settings.loadFromIndexDb();
  assert.equal(saved.background_color, "#0d1b2a");
  assert.equal(saved.node_radius, 10);
  assert.equal(saved.label_color, "#ff0000");
  assert.equal(saved.forceSimulation, false);
  assert.equal(saved.vertexLabel, false);
});
