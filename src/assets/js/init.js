import * as d3 from 'd3';
import Graph from 'graphology'; // Import Graphology
import { generateNextLabel } from './utils';
// Initialize data structures for nodes and edges
const graph = new Graph();

let selectedNode = null;
let isCtrlPressed = false;

// Track "Ctrl" key state
document.addEventListener("keydown", (event) => {
  if (event.key === "Control") {
    isCtrlPressed = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "Control") {
    isCtrlPressed = false;
  }
});


// Dimensions of the SVG
const width = "100%";
const height = "100%";

// Create SVG container
export const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("preserveAspectRatio", "xMinYMin meet")
// Draw edges and nodes
const edgeGroup = svg.append("g").attr("class", "edges");
const nodeGroup = svg.append("g").attr("class", "nodes");
// Disable the default context menu


svg.on("contextmenu", (event) => {
  event.preventDefault(); // Disable the default right-click menu

  const [x, y] = d3.pointer(event);
  const color = $("#color").val()

  // Generate the next available label
  const existingLabels = graph.nodes();
  const newLabel = generateNextLabel(existingLabels);

  // Add node to Graphology with the new label
  graph.addNode(newLabel, { x: x, y: y, color: color });

  updateGraph(); // Update the graph to include the new node
});

svg.on("click", (event) => {
  if (event.target.tagName === "svg") { // Check if the click is on the empty canvas
    selectedNode = null; // Deselect any selected node
    graph.forEachNode((id, attributes) => {
      graph.updateNodeAttributes(id, attr => {
        return {
          color: attr.color,
          x: attr.x,
          y: attr.y,
        };
      });
    });

    updateGraph(); // Re-draw nodes and edges

  }
});

// Dragging behavior
const drag = d3.drag()
  .on("start", function (event, d) {
    d3.select(this).attr("stroke", "orange");
  })
  .on("drag", function (event, d) {
    // Update node position in Graphology
    graph.updateNodeAttributes(d.id, (attributes) => {
      return { ...attributes, x: event.x, y: event.y };
    });

    updateGraph(); // Re-draw to reflect new positions
    d3.select(this).attr("stroke", "orange");

  })
  .on("end", function (event, d) {
    graph.updateNodeAttributes(d.id, (attributes) => {
      return { ...attributes, x: event.x, y: event.y };
    });

    updateGraph(); // Re-draw to reflect new positions
  });


export function updateGraph() {
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
    .attr("stroke", d => graph.getEdgeAttribute(d, 'color'))
    .attr("stroke-width", 2)
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "orange");
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", "gray");
    });


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
    .attr("stroke", d => d.color)
    .attr("stroke-width", 3)
    .on("click", handleNodeClick)
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
    .text(d => d.id)
    .attr("font-size", "15px")
    .attr("fill", "black");
}

function handleNodeClick(event, d) {
  event.stopPropagation(); // Prevent SVG click event

  if (isCtrlPressed) {
    const color = $("#color").val()
    if (selectedNode === null) {
      // Select the first node
      selectedNode = d.id;
      d3.select(event.target).attr("stroke", "orange");
    } else {
      const targetNode = d.id;

      // Add edge if it doesn't exist
      if (!graph.hasEdge(selectedNode, targetNode)) {
        graph.addEdge(selectedNode, targetNode, { color: color });
      }

      // Reset selection
      selectedNode = null;
      d3.selectAll("circle").attr("fill", "steelblue"); // Reset color
      updateGraph();
    }
  }
  if (event.key === "c") {
    const color = $("#color").val()
    graph.updateNodeAttributes(d, attr => {
      return {
        color: color,
      };
    })
    updateGraph(); // Re-draw graph
  }


}



// Listen for "Delete" key to delete selected node and its edges

document.addEventListener("keydown", (event) => {
  if (event.key === "d" && selectedNode !== null) {
    graph.dropNode(selectedNode); // Remove the selected node
    selectedNode = null;
    updateGraph(); // Re-draw graph
  }
});








export default graph;
