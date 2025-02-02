import { updateGraph, History } from "../init"


$('#new-btn').on('click', function () {
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

      const graphClone = new Graph();
      graphClone.import(importedData);
      History.push(graphClone);

      // Re-draw the graph
      updateGraph(History.graph);
    };
    reader.readAsText(file);
  }
});
