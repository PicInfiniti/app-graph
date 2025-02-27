import * as d3 from 'd3';
import { canvas } from "../core/init"
import { drawGraph } from '../graph/mutation';
import { appSettings } from '../core/state';
import { organizeNodesInCircle } from '../graph/layouts';
import { History } from '../graph/graph_manager';
// Extract nodes and edges from Graphology for D3

export const nodes = History.graph.mapNodes(function (node, attr) {
  return {
    id: Number(node),
    x: attr.x,
    y: attr.y
  }
});

export const links = History.graph.mapEdges((edge, attr, s, t, source, target) => {
  return { source: Number(s), target: Number(t) };
});

export const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links)
    .id(d => d.id)
    .distance(10)       // Increased link distance
    .strength(0.5))      // Moderate link strength
  .force("charge", d3.forceManyBody()
    .strength(-300))     // Stronger negative value for repulsion
  .force("collide", d3.forceCollide(20)) // Prevents node overlap
  .force("center", d3.forceCenter(canvas.width / 2, canvas.height / 2))
  .force("x", d3.forceX(canvas.width / 2).strength(0.05))  // Gentle attraction to center
  .force("y", d3.forceY(canvas.height / 1).strength(0.05)) // Gentle attraction to center
  .velocityDecay(0.3)     // Slower decay for smoother stabilization
  .alphaDecay(0.02)       // Slower cooling, better final spread
  .on("tick", ticked);


if (!appSettings.forceSimulation) {
  simulation.stop()
  organizeNodesInCircle(History.graph, canvas)
  drawGraph(History.graph, canvas)
}



function ticked() {
  // Draw nodes
  const sNode = nodes[0]
  const gNode = History.graph.getNodeAttributes(sNode.id)
  if (gNode.x != sNode.x) {
    nodes.forEach((d) => {
      History.graph.updateNodeAttributes(d.id, attr => {
        return {
          ...attr,
          x: d.x,
          y: d.y
        };
      });
    });
    drawGraph(History.graph, canvas)
  }
}
