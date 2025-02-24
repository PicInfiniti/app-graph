import $ from "jquery"
import { updateGraph, History, simulation } from "../init";

// Default settings
const defaultSettings = {
  forceSimulation: true,
  dragComponent: false,
  scale: false,
  vertexLabel: true,
  node_radius: 10,
  edge_size: 2,
  label_size: 15,
  info_panel: true,
  grid: 20,
};


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
  updateGraph(History.graph)
});

$('#edge-size').on('input', function () {
  appSettings.edge_size = $(this).val();
  updateGraph(History.graph)
});

$('#label-size').on('input', function () {
  appSettings.label_size = $(this).val();
  updateGraph(History.graph)
});

$('#vertex-label').on('click', function () {
  appSettings.vertexLabel = !appSettings.vertexLabel
  $('#vertex-label .check').toggleClass("hidden", !appSettings.vertexLabel)
  updateGraph(History.graph)
});


// Load settings from localStorage or use defaults
let savedSettings = JSON.parse(localStorage.getItem('appSettings')) || defaultSettings;

// Function to save settings with debounce to prevent excessive writes
let saveTimeout;
function saveSettingsDebounced(settings) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    // console.log("Settings saved:", settings);
    console.log("Update Settings")
  }, 300); // Adjust debounce time as needed
}

// Proxy to track changes and auto-save to localStorage
export const appSettings = new Proxy(savedSettings, {
  set(target, key, value) {
    target[key] = value; // Update the value
    saveSettingsDebounced(target); // Auto-save with debounce
    return true; // Confirm change
  }
});

// Button click event to reset settings to default
$("#default-settings-btn").on('click', function () {
  Object.assign(appSettings, defaultSettings); // Reset settings
  localStorage.setItem('appSettings', JSON.stringify(defaultSettings)); // Save immediately
  console.log("Reset Settings")
});

function loadSettings() {
  $(".container").toggleClass('grid-hidden', appSettings.grid <= 2)
  $root.css('--grid-size', `${appSettings.grid}px`);

  $('#vertex-size').val(appSettings.node_radius);
  $('#edge-size').val(appSettings.edge_size);
  $('#label-size').val(appSettings.label_size);
  $('#vertex-label .check').toggleClass("hidden", !appSettings.vertexLabel);

  $('#panel-btn .check').toggleClass('hidden', appSettings.info_panel)
  $('#drag-btn .check').toggleClass("hidden", !appSettings.dragComponent)
  $('#scale-btn .check').toggleClass("hidden", !appSettings.scale)
  $('#force-btn .check').toggleClass("hidden", !appSettings.forceSimulation)

  if (appSettings.info_panel) {
    $('#floating-panel').hide();
  } else {
    $('#floating-panel').show()
      .css({ transform: 'translate(0px, 0px)' }) // Reset position
      .attr({ 'data-x': 0, 'data-y': 0 });
  }

}

loadSettings();
window.appSettings = appSettings;
