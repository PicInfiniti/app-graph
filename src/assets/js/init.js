import $ from "jquery";
import interact from 'interactjs';
import * as d3 from 'd3';
import Graph from 'graphology'; // Import Graphology
import { getMinAvailableNumber, getAvailableLabel, removeString } from './utils';
import { keyDown } from '../../main';
import { LimitedArray, getTouchPosition } from './utils';


// Initialize data structures
export const selectedNode = [];
export const selectedEdge = [];
export let pressTimer = null;
export const History = new LimitedArray(50);
export const common = {
  lastTapTime: 0,
  hover: false
}

// Create SVG container
export const svg = d3.select("#chart")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("preserveAspectRatio", "xMinYMin meet");

History.push(new Graph())
const edgeGroup = svg.append("g").attr("class", "edges");
const nodeGroup = svg.append("g").attr("class", "nodes");



svg.on("dblclick touchend", handleDoubleClick);

// Handle double click or double tap to add a node
function handleDoubleClick(event) {
  const currentTime = Date.now();
  if (event.type === "dblclick" || (event.type === "touchend" && currentTime - common.lastTapTime < 300)) {
    if (!common.hover) {
      addNodeAtEvent(event);
    }
  }
  common.lastTapTime = currentTime;
}

// Function to add a new node at event position
function addNodeAtEvent(event) {
  event.preventDefault();
  const color = $("#color").val();
  let [x, y] = event.type === "touchend" ? getTouchPosition(event, svg) : d3.pointer(event);

  const newID = getMinAvailableNumber(History.graph.nodes());
  const newLabel = getAvailableLabel(newID);

  updateHistory(History, "add");
  History.graph.addNode(newID, { x, y, color, label: newLabel });
  updateGraph(History.graph);
}

svg.on("click", (event) => {
  if (!keyDown[0] && event.target.tagName === "svg") { // Check if the click is on the empty canvas
    selectedNode.length = 0; // Deselect any selected node
    selectedEdge.length = 0;
    updateGraph(History.graph); // Re-draw nodes and edges
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
  })
  .on("end", (event, d) => {
    History.graph.updateNodeAttributes(d.id, attrs => ({ ...attrs, x: event.x, y: event.y }));
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
    .attr("stroke", d => {
      if (selectedEdge.includes(d)) return "orange"
      return graph.getEdgeAttribute(d, 'color')
    })
    .attr("stroke-width", 2)
    .on("click touchend", function (event, d) {
      if (event.ctrlKey || event.type === "touchend") {
        selectElement("edge", d);
      }
    })
    .on("dblclick", function (event, d) {
      selectElement("edge", d);
      console.log("select edge")
    })
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "orange");
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
      common.hover = true;
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", d => {
        if (selectedEdge.includes(d)) return "orange"
        else return graph.getEdgeAttribute(d, 'color')
      });
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
      common.hover = false;
    })

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
    .attr("stroke", d => {
      if (selectedNode.includes(d.id)) return "orange"
      return d.color
    })
    .attr("stroke-width", 3)
    .on("click touchend", function (event, d) {
      if (event.ctrlKey || event.type === "touchend") {
        selectElement("node", d);
      }
    })
    .on("dblclick", function (event, d) {
      selectElement("node", d);
      console.log("select node")
    })
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "orange");
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
      common.hover = true

    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", d => {
        if (selectedNode.includes(d.id)) return "orange"
        else return d.color
      });
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
      common.hover = false;
    })
    .call(drag); // Apply drag behavior

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

function selectElement(element = "node", d) {
  if (element == "node") {
    if (selectedNode.includes(d.id)) {
      removeString(selectedNode, d.id)
    } else {
      selectedNode.push(d.id)
    }
  }
  if (element == "edge") {
    if (selectedEdge.includes(d)) {
      removeString(selectedEdge, d)
    } else {
      selectedEdge.push(d)
    }
  }
  updateGraph(History.graph); // Re-draw graph
}

export function updateHistory(History, status = 'update') {
  switch (status) {
    case "redo":
      if (History.index < History.data.length - 1) {
        History.updateIndex(History.index + 1);
        console.log("redo")
      } else {
        console.log("nothing to redo")
      };
      break;
    case "undo":
      if (History.index > 0) {
        History.updateIndex(History.index - 1);
        console.log("undo")
      } else {
        console.log("nothing to undo")
      };
      break;

    default:
      console.log("update")
      const graphData = History.graph.export();
      const graphClone = new Graph();
      graphClone.import(graphData);
      History.data.length = History.index + 1
      History.push(graphClone);
      break;
  }

  updateGraph(History.graph);

}

