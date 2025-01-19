import graph from "../init";
import { svg, updateGraph, selectedNode, selectedEdge } from "../init"

// Attach the circular layout function to the button
$("#organize-circle").on("click", organizeNodesInCircle);
$('#make-complete-btn').on('click', makeGraphComplete);
$('#remove-selection-btn').on('click', removeSelection);
$('#color-selection-btn').on('click', colorSelection);
$('#add-edge-btn').on('click', addEdge);

function organizeNodesInCircle() {
  const radius = 200; // Radius of the circle
  const centerX = svg.node().getBoundingClientRect().width / 2;
  const centerY = svg.node().getBoundingClientRect().height / 2;
  const angleStep = -(2 * Math.PI) / graph.order;
  graph.forEachNode((id, attributes) => {
    const angle = id * angleStep - Math.PI / 2;
    graph.updateNodeAttributes(id, attr => {
      return {
        label: attr.label,
        color: attr.color,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  });

  selectedNode.length = 0; // Deselect any selected node
  selectedEdge.length = 0;

  updateGraph(); // Re-draw graph
}


function makeGraphComplete() {
  const color = $("#color").val()
  graph.forEachNode((i, attr_i) => {
    graph.forEachNode((j, attr_j) => {
      if (i != j) {
        if (!graph.hasEdge(i, j) && !graph.hasEdge(j, i)) {
          graph.addEdge(i, j, { color: color }); // Add edge if it doesn't exist
        }
      }
    })
  })

  selectedNode.length = 0; // Deselect any selected node
  selectedEdge.length = 0;

  updateGraph(); // Re-draw graph
}

function removeSelection() {
  for (let edge of selectedEdge) {
    graph.dropEdge(edge); // Remove the selected node
  }
  for (let node of selectedNode) {
    graph.dropNode(node); // Remove the selected node
  }
  selectedNode.length = 0; // Deselect any selected node
  selectedEdge.length = 0;

  updateGraph(); // Re-draw graph

}

function colorSelection() {
  const color = $("#color").val()
  for (let node of selectedNode) {
    graph.updateNodeAttributes(node, attr => {
      return {
        ...attr,
        color: color,
      };
    })
  }

  for (let edge of selectedEdge) {
    graph.updateEdgeAttributes(edge, attr => {
      return {
        ...attr,
        color: color,
      };
    });
  }
  selectedNode.length = 0; // Deselect any selected node
  selectedEdge.length = 0;

  updateGraph(); // Re-draw graph
}


function addEdge() {
  const color = $("#color").val()

  for (let source of selectedNode) {
    for (let target of selectedNode) {
      if (source != target) {
        if (!graph.hasEdge(source, target) && !graph.hasEdge(target, source)) {
          graph.addEdge(source, target, { color: color }); // Add edge if it doesn't exist
        }
      }
    }
  }
  selectedNode.length = 0; // Deselect any selected node
  selectedEdge.length = 0;

  updateGraph(); // Re-draw graph
}

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "d":
      removeSelection();
      break;
    case "c":
      colorSelection();
      break;

    case "e":
      addEdge();
      break;
    default:
      break;
  }
});


