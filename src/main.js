// libraries +++++++++++++++++++++++++++++++++++++
import $ from "jquery";

import * as d3 from 'd3';
import Graph from 'graphology'; // Import Graphology
import { allSimplePaths } from 'graphology-simple-path'; // Optional: Example of additional plugin
// libraries -------------------------------------

// sass ++++++++++++++++++++++++++++++++++++++++++
import './assets/sass/style.sass';
// sass ------------------------------------------

const $gridSizeInput = $('#grid-size'); // Select the input element
const $root = $(':root'); // Select the root element

$gridSizeInput.on('input', function () {
  const gridSize = $(this).val(); // Get the current value of the input
  $root.css('--grid-size', `${gridSize}px`); // Set the CSS variable
});




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
const svg = d3.select("#chart")
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

  // Generate the next available label
  const existingLabels = graph.nodes();
  const newLabel = generateNextLabel(existingLabels);

  // Add node to Graphology with the new label
  graph.addNode(newLabel, { x, y });

  updateGraph(); // Update the graph to include the new node
});

svg.on("click", (event) => {
  if (event.target.tagName === "svg") { // Check if the click is on the empty canvas
    selectedNode = null; // Deselect any selected node
    d3.selectAll("circle").attr("stroke", "steelblue"); // Remove the selection highlight
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
  .on("end", function () {
    d3.select(this).attr("stroke", "steelblue");
  });


function updateGraph() {
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
    .attr("stroke", "gray")
    .attr("stroke-width", 1)
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
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
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
  if (!isCtrlPressed) return; // Only allow selection when Ctrl is held
  event.stopPropagation(); // Prevent SVG click event

  if (selectedNode === null) {
    // Select the first node
    selectedNode = d.id;
    d3.select(event.target).attr("stroke", "orange");
  } else {
    const targetNode = d.id;

    // Add edge if it doesn't exist
    if (!graph.hasEdge(selectedNode, targetNode)) {
      graph.addEdge(selectedNode, targetNode);
    }

    // Reset selection
    selectedNode = null;
    d3.selectAll("circle").attr("fill", "steelblue"); // Reset color
    updateGraph();
  }
}



function organizeNodesInCircle() {
  const radius = 200; // Radius of the circle
  const centerX = svg.node().getBoundingClientRect().width / 2;
  const centerY = svg.node().getBoundingClientRect().height / 2;
  const angleStep = -(2 * Math.PI) / graph.order;
  graph.forEachNode((id, attributes) => {
    const angle = getMultiCharIndex(id) * angleStep - Math.PI / 2;
    graph.updateNodeAttributes(id, attr => {
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  });

  updateGraph(); // Re-draw nodes and edges
}


// Attach the circular layout function to the button
$("#organize-circle").on("click", organizeNodesInCircle);
// Listen for "Delete" key to delete selected node and its edges

document.addEventListener("keydown", (event) => {
  if (event.key === "d" && selectedNode !== null) {
    graph.dropNode(selectedNode); // Remove the selected node
    selectedNode = null;
    updateGraph(); // Re-draw graph
  }
});



$('#export-graph').on('click', function () {
  const graphJSON = graph.export();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graphJSON, null, 2));
  const downloadAnchor = $('<a>')
    .attr('href', dataStr)
    .attr('download', 'graph.json');
  downloadAnchor[0].click(); // Trigger download
});

$('#import-graph').on('click', function () {
  $('#file-input').click(); // Open file dialog
});

$('#file-input').on('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const importedData = JSON.parse(e.target.result);

      // Clear the existing graph
      graph.clear();

      // Import the new graph data
      graph.import(importedData);

      // Re-draw the graph
      updateGraph();
    };
    reader.readAsText(file);
  }
});

function generateNextLabel(existingLabels) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let label = '';

  if (existingLabels.length === 0) {
    return 'a'; // First label
  }

  const lastLabel = existingLabels.sort().pop(); // Get the last used label
  let carry = true;
  label = lastLabel;

  for (let i = label.length - 1; i >= 0; i--) {
    const currentIndex = alphabet.indexOf(label[i]);
    if (carry) {
      if (currentIndex === alphabet.length - 1) {
        label = label.substring(0, i) + 'a' + label.substring(i + 1); // Wrap to 'a'
      } else {
        label = label.substring(0, i) + alphabet[currentIndex + 1] + label.substring(i + 1); // Increment
        carry = false;
      }
    }
  }

  if (carry) {
    label = 'a' + label; // Add a new letter if needed
  }

  return label;
}

function getMultiCharIndex(label) {
  const alphabetSize = 26;
  let index = 0;

  for (let i = 0; i < label.length; i++) {
    const charIndex = label.charCodeAt(i) - 'a'.charCodeAt(0);
    index = index * alphabetSize + charIndex;
  }

  return index;
}


function appendAndListNodeDegrees() {
  // Check if the degree list already exists to prevent duplicates
  if ($('#degree-list').length === 0) {

    // Append the structure dynamically to the #info-body
    $('#floating-panel .body-info').append(`
      <div id="degree-list" class="info-body">
        <h4 class="title">Nodes degree</h4>
        <div class="body"></div> 
      </div>
    `);
  }

  // Clear the existing content in the body div
  $('#degree-list .body').empty();

  // Get node degrees and populate the list
  const degrees = graph.nodes().map(nodeId => {
    return {
      node: nodeId,
      degree: graph.degree(nodeId)
    };
  });

  // Append degree information to the body
  degrees.forEach(({ node, degree }) => {
    $('#degree-list .body').append(`<div>${node}: ${degree}</div>`);
  });
}

// Attach the function to a button click event
$('#list-degrees-btn').on('click', function () {
  appendAndListNodeDegrees();
});

