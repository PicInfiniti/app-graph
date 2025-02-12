import $ from "jquery"
import { updateGraph, History, updateHistory, svg } from "../init"
import { saveSvgAsPng } from 'save-svg-as-png';

$('#new-btn').on('click', function () {
  updateHistory(History, "update")
  History.graph.clear();
  updateGraph(History.graph);
});

$('#export-graph').on('click', function () {
  const graphJSON = History.graph.export();
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

      updateHistory(History, "update")
      History.graph.clear();
      History.graph.import(importedData)

      // Re-draw the graph
      updateGraph(History.graph);
    };
    reader.readAsText(file);
  }
});

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "n":
      updateHistory(History, "update")
      History.graph.clear();
      updateGraph(History.graph);
      break;
    case "o":
      $('#file-input').click(); // Open file dialog
      break;
    case "p":
      downloadPNG()
      console.log("download png")
      break;
    case "s":
      const graphJSON = History.graph.export();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graphJSON, null, 2));
      const downloadAnchor = $('<a>')
        .attr('href', dataStr)
        .attr('download', 'graph.json');
      downloadAnchor[0].click(); // Trigger download
      break;

    default:
      break;
  }
});



$('#export-png').on('click', function () {
  downloadPNG()
  console.log("download png")
});


function downloadPNG() {
  const svgElement = document.querySelector("#chart svg");
  saveSvgAsPng(svgElement, "chart.png", { scale: 2 });
}

