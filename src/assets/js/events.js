import { UndirectedGraph } from "graphology";
import { LimitedArray } from "./dependency/classes";
import { ladder } from 'graphology-generators/classic';
import { appSettings } from "./menu_bars/settings";

// Set Up graph
const graph = ladder(UndirectedGraph, 10)

export const History = new LimitedArray(50);
History.push(graph)
window.History = History


graph.on('nodeAdded', function ({ key }) {
  console.log(key);
})

graph.on('edgeAdded', function ({ key, source, target }) {
  console.log(key, source, target);
})

graph.on('nodeDropped', function ({ key }) {
  console.log(key);
})

graph.on('edgeDropped', function ({ key, source, target }) {
  console.log(key, source, target);
})

graph.on('cleared', function () {
  console.log(graph.order, graph.size);
});


graph.on('edgesCleared', function () {
  console.log(graph.order, graph.size);
});


graph.on('attributesUpdated', function ({ type }) {
  console.log(type);
});


graph.on('nodeAttributesUpdated', function ({ key, type, attributes }) {
  console.log(key, type, attributes.x);
});

graph.on('edgeAttributesUpdated', function ({ key, type }) {
  console.log(key, type);
});

graph.on('eachNodeAttributesUpdated', function ({ key, type }) {
  console.log(key, type);
});

graph.on('eachEdgeAttributesUpdated', function ({ key, type }) {
  console.log(key, type);
});


export const eventProxy = new Proxy(appSettings, {
  set(target, key, value) {
    const oldValue = target[key];
    target[key] = value; // ✅ Update the setting first

    // 🔄 Only toggle listener if value actually changed
    if (key === 'forceSimulation' && oldValue !== value) {
      value
        ? graph.on('nodeAttributesUpdated', nodeAttributesUpdatedHandler)
        : graph.off('nodeAttributesUpdated', nodeAttributesUpdatedHandler);
      console.log(`forceSimulation is now ${value ? 'enabled' : 'disabled'}`);
    }

    return true; // ✅ Confirm the set operation was successful
  },
});

