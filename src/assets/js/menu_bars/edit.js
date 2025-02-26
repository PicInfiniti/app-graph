import $ from "jquery"
import { canvas, History } from "../init"
import { organizeNodesInCircle } from "../dependency/organizer";
import { drawGraph, updateSimulation } from "../dependency/mutation";
import { makeGraphComplete, updateForce } from "../dependency/mutation";
import { updateHistory } from "../dependency/mutation";

// Attach the circular layout function to the button
$("[name='organize-circle']").on("click", function () {
  organizeNodesInCircle(History.graph, canvas)
  drawGraph(History.graph, canvas);
});

$('[name="make-complete-btn"]').on('click', () => {
  makeGraphComplete(History.graph);
  updateForce(History.graph, nodes, links)
  updateSimulation()
  drawGraph(History.graph, canvas)
});

// $('[name="remove-selection-btn"]').on('click', removeSelection);
// $('[name="color-selection-btn"]').on('click', colorSelection);
// $('[name="add-edge-btn"]').on('click', addEdge);

$('[name="undo-btn"]').on('click', function () {
  updateHistory(History, "undo"); // Update the graph to include the new node
});

$('[name="redo-btn"]').on('click', function () {
  updateHistory(History, "redo"); // Update the graph to include the new node
});


document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "C":
      makeGraphComplete(History.graph);
      updateForce(History.graph, nodes, links)
      updateSimulation()
      drawGraph(History.graph, canvas)
      break;
    case "O":
      organizeNodesInCircle(History.graph, canvas)
      drawGraph(History.graph, canvas);
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



