import $ from "jquery";
import Graph from 'graphology'; // Import Graphology

import { Application, Graphics, Container } from "pixi.js";
import { LimitedArray, updateGraph, updateHistory, getMinAvailableNumber, getAvailableLabel } from "./utils";

// Initialize data structures
export const selectedNode = [];
export const selectedEdge = [];
export let pressTimer = null;
export const History = new LimitedArray(50);
History.push(new Graph())

window.History = History

export const common = {
  selectedEdge: [],
  selectedNode: [],
  pressTimer: null,
  lastTapTime: 0,
  hover: false,
  scaleData: {},
  rect: { x: 100, y: 100, width: 150, height: 100 },
  x: 0,
  y: 0
}
const container = $("#webgl-container")

// Create the application
export const app = new Application({
  resizeTo: container[0],
  backgroundAlpha: 0,
});

container.append(app.view);
export const nodeContainer = new Container();
export const edgeContainer = new Container();

app.stage.addChild(nodeContainer);
app.stage.addChild(edgeContainer);

// Handle double-click event using native DOM listener
app.view.addEventListener('dblclick', addNodeAtEvent);


function addNodeAtEvent(event) {
  event.preventDefault();
  const rect = app.view.getBoundingClientRect();
  const color = $("#color").val();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const newID = getMinAvailableNumber(History.graph.nodes());
  const newLabel = getAvailableLabel(newID);

  updateHistory(History, "add");
  History.graph.addNode(newID, { x, y, color, label: newLabel });
  updateGraph(History.graph)
}

