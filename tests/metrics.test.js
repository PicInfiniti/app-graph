import assert from "node:assert/strict";
import test from "node:test";
import { loadAppModules } from "./helpers/app-modules.js";

test("graph metadata and metric labels are displayed as literal text", async (t) => {
  const children = [];
  const panel = { appendChild: (element) => children.push(element) };
  globalThis.document = {
    querySelector: () => panel,
    createElement: (tagName) => ({
      tagName,
      textContent: "",
      insertAdjacentHTML() {
        assert.fail("Graph content must not be parsed as HTML");
      },
    }),
  };
  t.after(() => delete globalThis.document);
  const { metrics } = await loadAppModules(t, {
    metrics: "src/graph/metrics.js",
  });
  const metric = new metrics.Metric({});
  const payload = '<img src=x onerror="alert(1)">';
  metric.addNEFGInfo({
    label: payload,
    desc: { [payload]: payload },
  });
  metric.addInfo(0);
  metric.addInfo(false);

  assert.equal(children[0].textContent, `${payload}:`);
  assert.equal(children[1].textContent, `${payload}: ${payload}`);
  assert.equal(children[3].textContent, 0);
  assert.equal(children[4].textContent, false);
});
