import $ from "jquery";
import interact from 'interactjs';
import * as d3 from 'd3';
import Graph from 'graphology'; // Import Graphology
import { getMinAvailableNumber, getAvailableLabel, includesById, removeString } from './utils';
import { keyDown } from '../../main';
import { LimitedArray } from './utils';


// Initialize data structures for nodes and edges

export const selectedNode = [];
export const selectedEdge = [];
export let pressTimer = null;
export const History = new LimitedArray(20)

// Dimensions of the SVG
const width = "100%";
const height = "100%";

// Create SVG container
export const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("preserveAspectRatio", "xMinYMin meet")

History.push(new Graph())
// Draw edges and nodes
const edgeGroup = svg.append("g").attr("class", "edges");
const nodeGroup = svg.append("g").attr("class", "nodes");


// Disable default right-click (context menu) globally
document.addEventListener("contextmenu", (event) => event.preventDefault());

// Double Click (Desktop) & Double Tap (Touch) to Add Node
let lastTapTime = 0;
svg.on("dblclick touchend", (event) => {
  let currentTime = new Date().getTime();
  let tapInterval = currentTime - lastTapTime;

  // Check for double tap (touch) OR double click (desktop)
  if (event.type === "dblclick" || (event.type === "touchend" && tapInterval < 300)) {
    addNodeAtEvent(event);
  }

  lastTapTime = currentTime;
});

// Function to Add Node (Corrects Touch Positioning)
function addNodeAtEvent(event) {
  event.preventDefault(); // Prevent default behavior (like zooming on double tap)

  const color = $("#color").val();
  let x, y;

  if (event.type === "touchend") {
    // Get correct touch position
    const touch = event.changedTouches[0];
    const rect = svg.node().getBoundingClientRect();
    x = touch.clientX - rect.left;
    y = touch.clientY - rect.top;
  } else {
    // Desktop (mouse event)
    [x, y] = d3.pointer(event);
  }

  // Generate the next available label
  const existingIds = History.graph.nodes();
  const newID = getMinAvailableNumber(existingIds);
  const newLabel = getAvailableLabel(newID);

  // Add node to Graphology
  updateHistory(History, "add"); // Add to history before changing graph
  History.graph.addNode(newID, { x: x, y: y, color: color, label: newLabel });
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
  .on("start", function (event, d) {
    updateHistory(History, "update"); // Update the graph to include the new node
    d3.select(this).attr("stroke", "orange");
  })
  .on("drag", function (event, d) {
    // Update node position in Graphology
    History.graph.updateNodeAttributes(d.id, (attributes) => {
      return { ...attributes, x: event.x, y: event.y };
    });

    updateGraph(History.graph); // Re-draw to reflect new positions
    d3.select(this).attr("stroke", "orange");
  })
  .on("end", function (event, d) {
    History.graph.updateNodeAttributes(d.id, (attributes) => {
      return { ...attributes, x: event.x, y: event.y };
    });

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
    .on("click", function (event, d) {
      if (event.ctrlKey) {
        selectElement("edge", d);
      }
    })
    .on("mousedown", function (event, d) {
      pressTimer = setTimeout(() => {
        selectElement("edge", d);
        console.log("select edge")
      }, 500); // Long press to select
    })
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "orange");
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", d => {
        if (selectedEdge.includes(d)) return "orange"
        else return graph.getEdgeAttribute(d, 'color')
      });
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
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
    .on("click", function (event, d) {
      if (event.ctrlKey) {
        selectElement("node", d);
      }
    })
    .on("mousedown", function (event, d) {
      pressTimer = setTimeout(() => {
        selectElement("node", d);
        console.log("select node")
      }, 500); // Long press to select
    })
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "orange");
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger

    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", d => {
        if (selectedNode.includes(d.id)) return "orange"
        else return d.color
      });
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
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




interact('#floating-panel')
  .draggable({
    allowFrom: "#info", // Only allow dragging from the header
    listeners: {
      move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // Apply smooth movement
        target.style.transform = `translate(${x}px, ${y}px)`;

        // Store new position
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      }
    }
  });

