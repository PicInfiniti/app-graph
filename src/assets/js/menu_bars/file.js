import graph from "../init"
import { updateGraph } from "../init"

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
