import $ from "jquery"
import { svg, History, updateGraph, selectedNode, selectedEdge, updateHistory } from "../init"

// Attach the circular layout function to the button
$("#organize-circle").on("click", organizeNodesInCircle);
$('#make-complete-btn').on('click', makeGraphComplete);
$('#remove-selection-btn').on('click', removeSelection);
$('#color-selection-btn').on('click', colorSelection);
$('#add-edge-btn').on('click', addEdge);

function organizeNodesInCircle() {
  updateHistory(History, "update")
  const centerX = svg.node().getBoundingClientRect().width / 2;
  const centerY = svg.node().getBoundingClientRect().height / 2;
  const radius = Math.min(centerX * .8, centerY * .8)
  const angleStep = -(2 * Math.PI) / History.graph.order;
  History.graph.forEachNode((id, attributes) => {
    const angle = id * angleStep - Math.PI / 2;
    History.graph.updateNodeAttributes(id, attr => {
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

  updateGraph(History.graph); // Re-draw graph
}


function makeGraphComplete() {
  updateHistory(History, "update")
  const color = $("#color").val()
  History.graph.forEachNode((i, attr_i) => {
    History.graph.forEachNode((j, attr_j) => {
      if (i != j) {
        if (!History.graph.hasEdge(i, j) && !History.graph.hasEdge(j, i)) {
          History.graph.addEdge(i, j, { color: color }); // Add edge if it doesn't exist
        }
      }
    })
  })

  selectedNode.length = 0; // Deselect any selected node
  selectedEdge.length = 0;

  updateGraph(History.graph); // Re-draw graph
}

function removeSelection() {
  updateHistory(History, "update")
  for (let edge of selectedEdge) {
    History.graph.dropEdge(edge); // Remove the selected node
  }
  for (let node of selectedNode) {
    History.graph.dropNode(node); // Remove the selected node
  }
  selectedNode.length = 0; // Deselect any selected node
  selectedEdge.length = 0;

  updateGraph(History.graph); // Re-draw graph

}

function colorSelection() {
  const color = $("#color").val()
  updateHistory(History, "update")

  for (let node of selectedNode) {
    History.graph.updateNodeAttributes(node, attr => {
      return {
        ...attr,
        color: color,
      };
    })
  }

  for (let edge of selectedEdge) {
    History.graph.updateEdgeAttributes(edge, attr => {
      return {
        ...attr,
        color: color,
      };
    });
  }
  selectedNode.length = 0; // Deselect any selected node
  selectedEdge.length = 0;

  updateGraph(History.graph); // Re-draw graph
}


function addEdge() {
  const color = $("#color").val()
  updateHistory(History, "update")
  for (let source of selectedNode) {
    for (let target of selectedNode) {
      if (source != target) {
        if (!History.graph.hasEdge(source, target) && !History.graph.hasEdge(target, source)) {
          History.graph.addEdge(source, target, { color: color }); // Add edge if it doesn't exist
        }
      }
    }
  }
  selectedNode.length = 0; // Deselect any selected node
  selectedEdge.length = 0;

  updateGraph(History.graph); // Re-draw graph
}

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "C":
      makeGraphComplete();
      break;
    case "O":
      organizeNodesInCircle();
      break;
    case "d":
      removeSelection();
      break;

    case "c":
      colorSelection();
      break;

    case "e":
      addEdge();
      break;

    case "u":
      updateHistory(History, "undo")
      break;

    case "y":
      updateHistory(History, "redo")
      break;

    default:
      break;
  }
});

$('#undo-btn').on('click', function () {
  updateHistory(History, "undo"); // Update the graph to include the new node
});

$('#redo-btn').on('click', function () {
  updateHistory(History, "redo"); // Update the graph to include the new node
});


