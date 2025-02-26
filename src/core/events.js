import { canvas, History } from "./init";
import { updateForce, updateHistory } from "./dependency/mutation";
import { simulation, nodes, links } from "./force_simulation";

History.graph.on('nodeAdded', function ({ key }) {
  updateHistory(History, 'update')
  updateForce(History.graph, nodes, links)
  console.log(key);
})

History.graph.on('edgeAdded', function ({ key, source, target }) {
  console.log(key, source, target);
})
//
// History.graph.on('nodeDropped', function ({ key }) {
//   console.log(key);
// })
//
// History.graph.on('edgeDropped', function ({ key, source, target }) {
//   console.log(key, source, target);
// })
//
// History.graph.on('cleared', function () {
//   console.log(graph.order, graph.size);
// });
//
//
// History.graph.on('edgesCleared', function () {
//   console.log(graph.order, graph.size);
// });
//
//
// History.graph.on('attributesUpdated', function ({ type }) {
//   console.log(type);
// });
//
//
// History.graph.on('nodeAttributesUpdated', function ({ key, type }) {
//   console.log(key, type);
// });
//
// History.graph.on('edgeAttributesUpdated', function ({ key, type }) {
//   console.log(key, type);
// });
//
// History.graph.on('eachNodeAttributesUpdated', function ({ key, type }) {
//   console.log(key, type);
// });
//
// History.graph.on('eachEdgeAttributesUpdated', function ({ key, type }) {
//   console.log(key, type);
// });

