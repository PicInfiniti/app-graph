import $ from "jquery"
import { common, updateGraph, History } from "../init";

// Selecting elements
const $gridSizeInput = $('#grid-size');
const $root = $(':root');

// Event listener to update grid size dynamically
$gridSizeInput.on('input', function () {
  const gridSize = $(this).val();
  if (gridSize <= 2) {
    $(".container").addClass("grid-hidden");
  } else {
    $(".container").removeClass("grid-hidden");
    $root.css('--grid-size', `${gridSize}px`);
  }
});

$('#grid-btn label, .check').on('click', function () {
  let check = $('#grid-btn .check');

  if ($(".container").hasClass("grid-hidden")) {
    check.css(
      { "opacity": "0" }
    );
  } else {
    check.css(
      { "opacity": "1" }
    );
  }
});

$('#vertex-size').on('input', function () {
  common.node_radius = $(this).val();
  updateGraph(History.graph)
});

$('#edge-size').on('input', function () {
  common.edge_size = $(this).val();
  updateGraph(History.graph)
});

$('#label-size').on('input', function () {
  common.label_size = $(this).val();
  updateGraph(History.graph)
});

$('#vertex-label').on('click', function () {
  let check = $('#vertex-label .check');
  if (check.is(':visible')) {
    check.hide();
    common.vertexLabel = false
  } else {
    common.vertexLabel = true
    check.show();
  }
  updateGraph(History.graph)
});

