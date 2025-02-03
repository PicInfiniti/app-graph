import { History } from "../init";

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
  const degrees = History.graph.nodes().map(nodeId => {
    return {
      node: History.graph.getNodeAttribute(nodeId, "label"),
      degree: History.graph.degree(nodeId)
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
// Function to make the graph complete

