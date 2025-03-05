import $ from "jquery"
import { History } from "../init";
import { infoPanelTemplate } from "../dependency/utils";
import { degreeSequesnce } from "../dependency/metrics";
import { countConnectedComponents, forEachConnectedComponent } from 'graphology-components';

$('#list-degrees-btn').on('click', function () {
  appendAndListNodeDegrees(History.graph);
});

$('#components-btn').on('click', function () {
  countComponents(History.graph)
});


function appendAndListNodeDegrees(graph) {
  if ($('#degree-list').length === 0) {
    $('#floating-panel .body-info').append(
      infoPanelTemplate("Degree Sequesnce", "degree-list")
    );
  }

  $('#degree-list .body').empty();

  const degrees = degreeSequesnce(graph).join(',')
  $('#degree-list .body').append(`<div>(${degrees})</div>`);
}


function countComponents(graph) {
  if ($('#components-list').length === 0) {
    $('#floating-panel .body-info').append(
      infoPanelTemplate("Connected Components", "components-list")
    );
  }

  $('#components-list .body').empty();
  $('#components-list .body').append(`<div>count: ${countConnectedComponents(graph)}</div><br>`);

  forEachConnectedComponent(History.graph, component => {
    let div = document.createElement("div");
    div.textContent = component.map(function (node) {
      return graph.getNodeAttribute(node, "label")
    }).join(', ');
    $('#components-list .body').append(div);
  });
}

