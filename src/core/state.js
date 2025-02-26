// src/core/State.js
import { debounce } from '../utils/debounce.js';
import { EventBus } from './EventBus.js';
import { applySettingsToUI } from '../ui/UIManager.js';

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

// Validate and load settings
function validateSettings(saved, defaults) {
  return Object.keys(defaults).reduce((acc, key) => {
    acc[key] = saved[key] !== undefined ? saved[key] : defaults[key];
    return acc;
  }, {});
}

let savedSettings = validateSettings(
  JSON.parse(localStorage.getItem('appSettings')) || {},
  defaultSettings
);

// Debounced save function
const saveSettingsDebounced = debounce((settings) => {
  localStorage.setItem('appSettings', JSON.stringify(settings));
  console.log("Update Settings");
}, 300);

// Reactive settings with Proxy
export const appSettings = new Proxy(savedSettings, {
  set(target, key, value) {
    target[key] = value;
    saveSettingsDebounced(target);
    EventBus.emit('settings:changed', { key, value });
    return true;
  },
});

// Initial load application of settings
function loadSettings() {
  applySettingsToUI(appSettings);
}

loadSettings();
window.appSettings = appSettings;
