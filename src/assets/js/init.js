import $ from "jquery";
import interact from 'interactjs';
import * as d3 from 'd3';
import Graph from 'graphology';
import { getMinAvailableNumber, getAvailableLabel, removeString, getTouchPosition, LimitedArray } from './utils';
import { keyDown } from '../../main';

// Initialize data structures
export const selectedNode = new Set();
export const selectedEdge = new Set();
export let pressTimer = null;
export const History = new LimitedArray(20);
let lastTapTime = 0;

// Create SVG container
export const svg = d3.select("#chart")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("preserveAspectRatio", "xMinYMin meet");

History.push(new Graph());
const edgeGroup = svg.append("g").attr("class", "edges");
const nodeGroup = svg.append("g").attr("class", "nodes");

// Disable right-click context menu
document.addEventListener("contextmenu", (event) => event.preventDefault());

svg.on("dblclick touchend", handleDoubleClick);

function handleDoubleClick(event) {
  event.stopPropagation();
  const currentTime = Date.now();
  if (event.type === "dblclick" || (event.type === "touchend" && currentTime - lastTapTime < 300)) {
    addNodeAtEvent(event);
  }
  lastTapTime = currentTime;
}

function addNodeAtEvent(event) {
  event.preventDefault();
  const color = $("#color").val();
  const [x, y] = event.type === "touchend" ? getTouchPosition(event, svg) : d3.pointer(event);

  const newID = getMinAvailableNumber(History.graph.nodes());
  const newLabel = getAvailableLabel(newID);

  updateHistory(History, "add");
  History.graph.addNode(newID, { x, y, color, label: newLabel });
  updateGraph(History.graph);
}

svg.on("click", (event) => {
  if (!keyDown[0] && event.target.tagName === "svg") {
    selectedNode.clear();
    selectedEdge.clear();
    updateGraph(History.graph);
  }
});

// Dragging behavior
const drag = d3.drag()
  .on("start", (event, d) => {
    updateHistory(History, "update");
    d3.select(event.sourceEvent.target).attr("stroke", "orange");
  })
  .on("drag", (event, d) => {
    History.graph.updateNodeAttributes(d.id, attrs => ({ ...attrs, x: event.x, y: event.y }));
    updateGraph(History.graph);
  });

export function updateGraph(graph) {
  const nodes = graph.nodes().map(id => ({ id, ...graph.getNodeAttributes(id) }));
  const edges = graph.edges();

  // Update edges
  const edgesSelection = edgeGroup.selectAll("line").data(edges);
  edgesSelection.exit().remove();
  edgesSelection.enter()
    .append("line")
    .merge(edgesSelection)
    .attr("x1", d => graph.getNodeAttribute(graph.source(d), 'x'))
    .attr("y1", d => graph.getNodeAttribute(graph.source(d), 'y'))
    .attr("x2", d => graph.getNodeAttribute(graph.target(d), 'x'))
    .attr("y2", d => graph.getNodeAttribute(graph.target(d), 'y'))
    .attr("stroke", d => selectedEdge.has(d) ? "orange" : graph.getEdgeAttribute(d, 'color'))
    .attr("stroke-width", 2)
    .on("click", (event, d) => event.ctrlKey && selectElement("edge", d));

  // Update nodes
  const nodesSelection = nodeGroup.selectAll("circle").data(nodes, d => d.id);
  nodesSelection.exit().remove();
  nodesSelection.enter()
    .append("circle")
    .merge(nodesSelection)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 10)
    .attr("fill", "white")
    .attr("stroke", d => selectedNode.has(d.id) ? "orange" : d.color)
    .attr("stroke-width", 3)
    .on("click", (event, d) => event.ctrlKey && selectElement("node", d))
    .call(drag);

  // Update labels
  const labelsSelection = nodeGroup.selectAll("text").data(nodes, d => d.id);
  labelsSelection.exit().remove();
  labelsSelection.enter()
    .append("text")
    .merge(labelsSelection)
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(d => d.label)
    .attr("font-size", "15px")
    .attr("fill", "black");
}

function selectElement(type, d) {
  if (type === "node") {
    selectedNode.has(d.id) ? selectedNode.delete(d.id) : selectedNode.add(d.id);
  } else if (type === "edge") {
    selectedEdge.has(d) ? selectedEdge.delete(d) : selectedEdge.add(d);
  }
  updateGraph(History.graph);
}

export function updateHistory(History, status = 'update') {
  switch (status) {
    case "redo":
      if (History.index < History.data.length - 1) {
        History.updateIndex(History.index + 1);
        console.log("redo");
      } else {
        console.log("nothing to redo");
      }
      break;
    case "undo":
      if (History.index > 0) {
        History.updateIndex(History.index - 1);
        console.log("undo");
      } else {
        console.log("nothing to undo");
      }
      break;
    default:
      console.log("update");
      const graphClone = new Graph();
      graphClone.import(History.graph.export());
      History.data.length = History.index + 1;
      History.push(graphClone);
      break;
  }

  updateGraph(History.graph);
}

