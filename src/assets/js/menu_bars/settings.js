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
  let check = $('#vertex-label .check');
  if (appSettings.vertexLabel) {
    check.addClass("hidden");
    appSettings.vertexLabel = false
  } else {
    appSettings.vertexLabel = true
    check.removeClass("hidden");
  }
  updateGraph(History.graph)
});


// Default settings
const defaultSettings = {
  dragComponent: false,
  scale: false,
  vertexLabel: true,
  node_radius: 10,
  edge_size: 2,
  label_size: 15,
  info_panel: true,
};

// Load settings from localStorage or use defaults
let savedSettings = JSON.parse(localStorage.getItem('appSettings')) || defaultSettings;

// Function to save settings with debounce to prevent excessive writes
let saveTimeout;
function saveSettingsDebounced(settings) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    console.log("Settings saved:", settings);
  }, 300); // Adjust debounce time as needed
}

// Proxy to track changes and auto-save to localStorage
const appSettings = new Proxy(savedSettings, {
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
  console.log("Settings reset to default:", appSettings);
});

// Exporting for usage in other modules
export { appSettings };

