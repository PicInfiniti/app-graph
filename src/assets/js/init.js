import $ from "jquery";
import * as d3 from 'd3';
import { UndirectedGraph } from 'graphology'; // Import Graphology
import { getMinAvailableNumber, getAvailableLabel, removeString, lineIntersectsRect, pointInRect } from './utils';
import { LimitedArray, getTouchPosition } from './utils';
import { appSettings } from "./menu_bars/settings";
import { updateHistory } from "./utils";
import { edge, graph } from "graphology-metrics";

// Initialize data structures
export const selectedNode = [];
export const selectedEdge = [];
export let pressTimer = null;
export const History = new LimitedArray(50);

window.History = History

History.push(new UndirectedGraph())
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
  updateHistory(History, "add");

  let [x, y] = event.type === "touchend" ? getTouchPosition(event, canvas) : d3.pointer(event, canvas);
  const newID = getMinAvailableNumber(History.graph.nodes());
  const newLabel = getAvailableLabel(newID);
  History.graph.addNode(newID, { x, y, color: $("#color").val(), label: newLabel });

  updateGraph(History.graph);
}


// Function to update the graph
export function updateGraph(graph) {
  const color = $("#color").val();

  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw edges
  graph.forEachEdge(function (edge, attr, s, t, source, target) {
    if (!attr.color) {
      graph.setEdgeAttribute(edge, "color", $("#color").val())
    }
    context.beginPath();
    context.moveTo(source.x, source.y);
    context.lineTo(target.x, target.y);
    context.strokeStyle = selectedEdge.includes(edge) ? "orange" : attr.color;
    context.lineWidth = appSettings.edge_size;
    context.stroke();
    context.closePath();
  });

  // Draw nodes
  graph.forEachNode(function (node, attr) {
    console.log(node)
    if (!attr.label) {
      const newLabel = getAvailableLabel(node);
      graph.setNodeAttribute(node, "label", newLabel)
    }
    if (!attr.color) {
      graph.setNodeAttribute(node, "color", $("#color").val())
    }
    context.beginPath();
    context.arc(attr.x, attr.y, appSettings.node_radius, 0, 2 * Math.PI);
    context.fillStyle = appSettings.vertexLabel ? "white" : attr.color;
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = selectedNode.includes(edge.id) ? "orange" : attr.color;
    context.stroke();
    context.closePath();

    if (appSettings.vertexLabel) {
      context.fillStyle = "black";
      context.font = `${appSettings.label_size}px sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(attr.label, attr.x, attr.y);
    }
  });
}


// Redraw on window resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  updateGraph(History.graph);
});

