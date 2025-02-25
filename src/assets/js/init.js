import $ from "jquery";
import * as d3 from 'd3';
import { UndirectedGraph } from 'graphology'; // Import Graphology
import { ladder } from 'graphology-generators/classic';

import { appSettings } from "./menu_bars/settings";
import { LimitedArray } from "./dependency/classes";
import { drawGraph } from "./dependency/mutation";
export const common = {
  scaleData: {},
  rect: { x: 100, y: 100, width: 150, height: 100 },
  x: 0,
  y: 0,
  selectedNode: [],
  selectedEdge: [],
}


// Set up canvas
export const canvas = d3.select("#chart").node();
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Set Up graph
const graph = ladder(UndirectedGraph, 10)

export const History = new LimitedArray(50);
History.push(graph)
window.History = History

// Extract nodes and edges from Graphology for D3
export const nodes = History.graph.mapNodes(function (node, attr) {
  return {
    id: Number(node),
    x: attr.x,
    y: attr.y
  }
});

const links = History.graph.mapEdges((edge, attr, s, t, source, target) => {
  return { source: Number(s), target: Number(t) };
});

if (!appSettings.forceSimulation) {
  organizeNodesInCircle(graph, canvas)
}
// Force simulation (initially stopped)

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
  drawGraph(History.graph, canvas)
}
canvas.addEventListener("dblclick", addNodeAtEvent);

// Function to add a new node at event position
function addNodeAtEvent(event) {
  event.preventDefault();
  updateHistory(History, "add");

  let [x, y] = event.type === "touchend" ? getTouchPosition(event, canvas) : d3.pointer(event, canvas);
  const newID = getMinAvailableNumber(History.graph.nodes());
  const newLabel = getAvailableLabel(newID);
  History.graph.addNode(newID, { x, y, color: $("#color").val(), label: newLabel });
  addNode(newID, { x: x, y: y });
}


// Redraw on window resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (appSettings.forceSimulation) {
    updateSimulation();
  } else {
    drawGraph(History.graph, canvas);
  }
});


// Drag behavior - allows dragging at all times
d3.select(canvas)
  .call(
    d3.drag()
      .container(canvas)
      .subject(dragsubject)
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
  );


function dragsubject(event) {
  const x = event.x;
  const y = event.y;
  let subject = null;
  let minDist = Infinity;

  nodes.forEach((node) => {
    const dx = x - node.x;
    const dy = y - node.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < appSettings.node_radius && dist < minDist) {
      minDist = dist;
      subject = node;
    }
  });
  return subject;
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

function dragstarted(event) {
  if (!event.active && appSettings.forceSimulation) simulation.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;

  History.graph.updateNodeAttributes(event.subject.id, attr => {
    return {
      ...attr,
      x: event.x,
      y: event.y
    };
  });
  if (!appSettings.forceSimulation) {
    drawGraph(History.graph, canvas)
  }
}

function dragended(event) {
  if (!event.active) simulation.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
  event.subject.x = event.x;
  event.subject.y = event.y;

}

function updateSimulation() {
  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(.3).restart(); // Reheat simulation after updates
}

function addNode(node, attr) {
  const newNode = { id: Number(node), x: attr.x, y: attr.y };
  nodes.push(newNode);
  updateSimulation();
}

function removeNode() {
  if (nodes.length === 0) return;
  const removedNode = nodes.pop();

  // Remove any links connected to the removed node
  links = links.filter(
    (l) => l.source.id !== removedNode.id && l.target.id !== removedNode.id
  );
  updateSimulation();
}

export function addLink(source, target) {
  if (nodes.length < 2) return;
  links.push({ source: source, target: target });
  updateSimulation();
}

function removeLink() {
  if (links.length === 0) return;
  links.pop();
  updateSimulation();
}
