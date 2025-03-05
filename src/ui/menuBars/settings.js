import $ from "jquery"
import { canvas, History } from "../init";
import { drawGraph } from "../dependency/mutation";
import { appSettings } from "../../core/state";

// Selecting elements
const $gridSizeInput = $('#grid-size');
const $root = $(':root');

// Event listener to update grid size dynamically
$gridSizeInput.on('input', function () {
  appSettings.grid = $(this).val();
  $(".container").toggleClass('grid-hidden', appSettings.grid <= 2)
  $root.css('--grid-size', `${appSettings.grid}px`);
});

$('#vertex-size').on('input', function () {
  appSettings.node_radius = $(this).val();
  drawGraph(History.graph, canvas)
});

$('#edge-size').on('input', function () {
  appSettings.edge_size = $(this).val();
  drawGraph(History.graph, canvas)
});

$('#label-size').on('input', function () {
  appSettings.label_size = $(this).val();
  drawGraph(History.graph, canvas)
});

$('#vertex-label').on('click', function () {
  appSettings.vertexLabel = !appSettings.vertexLabel
  $('#vertex-label .check').toggleClass("hidden", !appSettings.vertexLabel)
  drawGraph(History.graph, canvas)
});


// Button click event to reset settings to default
$("#default-settings-btn").on('click', function () {
  Object.assign(appSettings, defaultSettings); // Reset settings
  localStorage.setItem('appSettings', JSON.stringify(defaultSettings)); // Save immediately
  drawGraph(History.graph, canvas)
  console.log("Reset Settings")
});

