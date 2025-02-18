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

$('#vertex-size').on('input', function () {
  appSetting.node_radius = $(this).val();
  updateGraph(History.graph)
});

$('#edge-size').on('input', function () {
  appSetting.edge_size = $(this).val();
  updateGraph(History.graph)
});

$('#label-size').on('input', function () {
  appSetting.label_size = $(this).val();
  updateGraph(History.graph)
});

$('#vertex-label').on('click', function () {
  let check = $('#vertex-label .check');
  if (appSetting.vertexLabel) {
    check.addClass("hidden");
    appSetting.vertexLabel = false
  } else {
    appSetting.vertexLabel = true
    check.removeClass("hidden");
  }
  updateGraph(History.graph)
});

export const appSetting = {
  dragComponent: false,
  scale: false,
  vertexLabel: true,
  node_radius: 10,
  edge_size: 2,
  label_size: 15,
  info_panel: true,
}
