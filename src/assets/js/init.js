import $ from "jquery";
import * as d3 from 'd3';
import Graph from 'graphology'; // Import Graphology
import { getMinAvailableNumber, getAvailableLabel, removeString, lineIntersectsRect, pointInRect } from './utils';
import { LimitedArray, getTouchPosition } from './utils';
import { getComponent } from "./utils";
import { appSettings } from "./menu_bars/settings";
import { Logger } from "sass";
import { updateHistory } from "./utils";

// Initialize data structures
export const selectedNode = [];
export const selectedEdge = [];
export let pressTimer = null;
export const History = new LimitedArray(50);
window.History = History

History.push(new Graph())
export const common = {
  lastTapTime: 0,
  hover: false,
  scaleData: {},
  rect: { x: 100, y: 100, width: 150, height: 100 },
  x: 0,
  y: 0
}

// Set up canvas
export const canvas = d3.select("#chart").node();
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.addEventListener("dblclick", addNodeAtEvent);
// Function to add a new node at event position
function addNodeAtEvent(event) {
  event.preventDefault();
  const color = $("#color").val();
  let [x, y] = event.type === "touchend" ? getTouchPosition(event, canvas) : d3.pointer(event, canvas);

  const newID = getMinAvailableNumber(History.graph.nodes());
  const newLabel = getAvailableLabel(newID);

  updateHistory(History, "add");
  History.graph.addNode(newID, { x, y, color, label: newLabel });
  updateGraph(History.graph);
}

// Function to update the graph
const drawGraph = (graph) => {
  const color = $("#color").val();
  const nodes = graph.nodes().map(id => ({ id, ...graph.getNodeAttributes(id) }));
  const edges = graph.edges();

  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw edges
  edges.forEach(d => {
    const source = graph.getNodeAttributes(graph.source(d));
    const target = graph.getNodeAttributes(graph.target(d));
    context.beginPath();
    context.moveTo(source.x, source.y);
    context.lineTo(target.x, target.y);
    context.strokeStyle = selectedEdge.includes(d) ? "orange" : (graph.getEdgeAttribute(d, 'color') || color);
    context.lineWidth = appSettings.edge_size;
    context.stroke();
    context.closePath();
    if (!graph.getEdgeAttribute(d, 'color')) graph.setEdgeAttribute(d, 'color', color);
  });

  // Draw nodes
  nodes.forEach(d => {
    context.beginPath();
    context.arc(d.x, d.y, appSettings.node_radius, 0, 2 * Math.PI);
    context.fillStyle = appSettings.vertexLabel ? "white" : (d.color || color);
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = selectedNode.includes(d.id) ? "orange" : (d.color || color);
    context.stroke();
    context.closePath();

    if (appSettings.vertexLabel) {
      context.fillStyle = "black";
      context.font = `${appSettings.label_size}px sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(d.label || getAvailableLabel(d.id), d.x, d.y);
      if (!d.label) graph.setNodeAttribute(d.id, 'label', getAvailableLabel(d.id));
    }
  });
}

export function updateGraph(graph) {
  drawGraph(graph);
}

// Redraw on window resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  updateGraph(History.graph);
});

