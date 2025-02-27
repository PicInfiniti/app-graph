import { applySettingsToUI } from '../ui/ui_manager'

class AppSettings {
  static instance = null;
  #autoSave = true; // Private property

  constructor(eventBus) {
    if (AppSettings.instance) return AppSettings.instance; // Singleton pattern
    AppSettings.instance = this;

    this.eventBus = eventBus; // Store reference to passed EventBus
    this.debounceTimer = null;

    this.defaultSettings = {
      forceSimulation: true,
      dragComponent: false,
      scale: false,
      vertexLabel: true,
      node_radius: 10,
      edge_size: 2,
      label_size: 15,
      info_panel: true,
      grid: 20,
      color: "#4682B4"
    };

    // Load validated settings from localStorage or use defaults
    this.settings = this.loadFromLocalStorage();

    // Automatically apply settings on creation
    this.init();
  }

  init() {
    applySettingsToUI(this.settings);
  }

  loadFromLocalStorage() {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        return this.validateSettings(parsedSettings);
      } catch (error) {
        console.warn("Invalid settings in localStorage. Using defaults.");
      }
    }
    return { ...this.defaultSettings };
  }

  saveToLocalStorage() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      localStorage.setItem("appSettings", JSON.stringify(this.settings));
      console.log("Settings saved to localStorage");
    }, 500);
  }

  resetToDefault() {
    this.settings = { ...this.defaultSettings };
    this.eventBus.emit("settingsReset", this.settings);
    if (this.#autoSave) {
      this.saveToLocalStorage();
    }
    this.init();
  }

  getSetting(key) {
    return this.settings[key];
  }

  getAllSettings() {
    return { ...this.settings };
  }

  setSetting(key, value) {
    if (key in this.settings) {
      if (this.settings[key] !== value) {
        this.settings[key] = value;
        this.eventBus.emit("settingChanged", { key, value });

        if (this.#autoSave) {
          this.saveToLocalStorage();
        }
        this.init();
      }
    } else {
      console.warn(`Setting "${key}" does not exist.`);
    }
  }

  setAutoSave(enabled) {
    this.#autoSave = enabled;
  }

  validateSettings(saved) {
    return Object.keys(this.defaultSettings).reduce((acc, key) => {
      acc[key] = saved && saved.hasOwnProperty(key) ? saved[key] : this.defaultSettings[key];
      return acc;
    }, {});
  }
}

export default AppSettings;
