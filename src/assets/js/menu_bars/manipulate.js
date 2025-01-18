import graph from "../init"
import { updateGraph } from "../init"
// Attach the function to the button
$('#make-complete-btn').on('click', function () {
  makeGraphComplete();
});


function makeGraphComplete() {
  graph.forEachNode((i, attr_i) => {
    graph.forEachNode((j, attr_j) => {
      if (i != j) {
        if (!graph.hasEdge(i, j) && !graph.hasEdge(j, i)) {
          graph.addEdge(i, j, { color: "gray" }); // Add edge if it doesn't exist
        }
      }
    })
  })

  // Re-draw the graph after adding edges
  updateGraph();
}
