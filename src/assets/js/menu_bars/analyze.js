import $ from "jquery"
import { History } from "../init";
import { countConnectedComponents, forEachConnectedComponent } from 'graphology-components';

function appendAndListNodeDegrees(graph) {
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
      node: graph.getNodeAttribute(nodeId, "label"),
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
  appendAndListNodeDegrees(History.graph);
});
// Function to make the graph complete
function countComponents(graph) {
  // Check if the degree list already exists to prevent duplicates
  if ($('#components-list').length === 0) {

    // Append the structure dynamically to the #info-body
    $('#floating-panel .body-info').append(`
      <div id="components-list" class="info-body">
        <h4 class="title">Connected Components</h4>
        <div class="body"></div> 
      </div>
    `);
  }

  // Clear the existing content in the body div
  $('#components-list .body').empty();

  // Append degree information to the body
  $('#components-list .body').append(`<div>count: ${countConnectedComponents(graph)}</div><br>`);

  forEachConnectedComponent(History.graph, component => {
    let div = document.createElement("div");
    div.textContent = component.map(function (node) {
      return graph.getNodeAttribute(node, "label")
    }).join(', ');
    $('#components-list .body').append(div);
  });
}

// Attach the function to a button click event
$('#components-btn').on('click', function () {
  countComponents(History.graph)
});
// Function to make the graph complete

