import $ from "jquery";
import * as d3 from 'd3';
import Graph from 'graphology'; // Import Graphology
import { getMinAvailableNumber, getAvailableLabel, removeString, lineIntersectsRect, pointInRect } from './utils';
import { LimitedArray, getTouchPosition } from './utils';
import { getComponent } from "./utils";
import { appSettings } from "./menu_bars/settings";
import { Logger } from "sass";
import { updateHistory } from "./utils";
import { edge } from "graphology-metrics";

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

  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw edges
  graph.forEachUndirectedEdge(function (edge, attr, s, t, source, target) {
    context.beginPath();
    context.moveTo(source.x, source.y);
    context.lineTo(target.x, target.y);
    context.strokeStyle = selectedEdge.includes(edge) ? "orange" : attr.color || color;
    context.lineWidth = appSettings.edge_size;
    context.stroke();
    context.closePath();
    if (!attr.color) graph.setEdgeAttribute(edge, 'color', color);
  });

  // Draw nodes
  graph.forEachNode(function (node, attr) {
    context.beginPath();
    context.arc(attr.x, attr.y, appSettings.node_radius, 0, 2 * Math.PI);
    context.fillStyle = appSettings.vertexLabel ? "white" : (attr.color || color);
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = selectedNode.includes(edge.id) ? "orange" : (attr.color || color);
    context.stroke();
    context.closePath();

    if (appSettings.vertexLabel) {
      context.fillStyle = "black";
      context.font = `${appSettings.label_size}px sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(attr.label || getAvailableLabel(attr.id), attr.x, attr.y);
      if (!attr.label) graph.setNodeAttribute(attr.id, 'label', getAvailableLabel(attr.id));
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

