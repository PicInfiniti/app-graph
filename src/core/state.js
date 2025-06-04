import { applySettingsToUI } from "../ui/uiManager";

class AppSettings {
  static instance = null;
  #autoSave = true; // Private property

  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus; // Store reference to passed EventBus

    if (AppSettings.instance) return AppSettings.instance; // Singleton pattern
    AppSettings.instance = this;

    this.debounceTimer = null;

    this.defaultSettings = {
      background_color: "#ffffff",
      forceSimulation: true,
      colorPicker: false,
      component: false,
      scale: false,
      tree: true,
      vertexLabel: true,
      edgeLabel: true,
      directed_edge: true,
      directed: true,
      node_radius: 40,
      edge_size: 2,
      label_size: 15,
      stroke_size: 2,
      info_panel: true,
      tools_panel: true,
      console_panel: true,
      panning: false,
      select: false,
      grid: 20,
      stroke_color: "#4682b4",
      node_color: "#ffffff",
      edge_color: "#4682b4",
      label_color: "#000000",
      label_pos: { x: 0, y: 0 },
      grid_color: "#00000020",
    };

    this.nightSkyTheme = {
      background_color: "#0d1b2a", // deep midnight blue
      stroke_color: "#ffffff",
      node_color: "#ffffff", // crisp white stars
      label_color: "#d1d5db", // soft gray labels (like Tailwind's text-gray-300)
      edge_color: "#60a5fa", // light blue lines (Tailwind's blue-400)
      grid_color: "#ffffff10",
      label_pos: { x: -20, y: -20 },
      node_radius: 10,
      edge_size: 1,
      stroke_size: 0,
      forceSimulation: false,
    };

    // Load validated settings from localStorage or use defaults
    this.settings = this.loadFromLocalStorage();

    // Listen for external setting updates
    this.registerEventListeners();
  }

  init() {
    applySettingsToUI(this.settings, this.app.canvas);
  }

  registerEventListeners() {
    this.eventBus.on("updateSetting", (event) => {
      const { key, value } = event.detail;
      this.setSetting(key, value);
      if (key == "grid") {
        const root = document.documentElement;
        document
          .querySelector(".container")
          .classList.toggle("grid-hidden", this.settings.grid <= 2);
        root.style.setProperty("--grid-size", `${this.settings.grid}px`);
      } else if (key && value !== undefined) {
        this.eventBus.emit("graph:updated", { type: key });
      }
    });

    this.eventBus.on("updateAllSettings", (event) => {
      const newSettings = event.detail;
      if (newSettings && typeof newSettings === "object") {
        this.setAllSettings(newSettings);
      }
    });

    this.eventBus.on("resetSettings", () => {
      this.resetToDefault();
    });

    this.eventBus.on("toggleSetting", (event) => {
      const { key, value } = event.detail;
      if (key) {
        this.toggleSetting(key, value);
        if (
          key == "vertexLabel" ||
          key == "directed_edge" ||
          key == "edgeLabel"
        ) {
          this.eventBus.emit("graph:updated", { type: "vertexLabel" });
        }
      }
    });
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

      // Emit a global settings change event
      this.eventBus.emit("settingsChanged", this.getAllSettings());
    }, 500);
  }

  resetToDefault() {
    this.setAllSettings(this.defaultSettings);
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
      }
    } else {
      console.warn(`Setting "${key}" does not exist.`);
    }
  }

  setAllSettings(newSettings) {
    Object.keys(newSettings).forEach((key) => {
      if (key in this.settings) {
        this.settings[key] = newSettings[key];
      }
    });

    this.eventBus.emit("settingsChanged", this.getAllSettings());

    if (this.#autoSave) {
      this.saveToLocalStorage();
    }
    this.init();
    this.app.drawGraph();
  }

  toggleSetting(key, value = null) {
    const one = ["scale", "panning", "select", "component"];

    if (key in this.settings && typeof this.settings[key] === "boolean") {
      if (value === null) this.settings[key] = !this.settings[key];
      else this.settings[key] = value;

      if (one.includes(key)) {
        one.forEach((val) => {
          if (val != key && this.settings[key]) this.settings[val] = false;
        });
      }

      if (
        (key === "component" && this.settings.component) ||
        (key === "scale" && this.settings.scale) ||
        (key === "panning" && this.settings.panning)
      ) {
        this.settings.forceSimulation = false;
        this.eventBus.emit("settingToggled", {
          key: "forceSimulation",
          value: this.settings.forceSimulation,
        });
      }

      if (key === "forceSimulation" && this.settings.forceSimulation) {
        this.settings.component = false;
        this.settings.scale = false;
        this.settings.panning = false;
      }

      this.eventBus.emit("settingToggled", { key, value: this.settings[key] });

      if (this.#autoSave && value === null) this.saveToLocalStorage();

      this.init();
      this.app.widget.init();
    } else {
      console.warn(`Setting "${key}" does not exist or is not a boolean.`);
    }
  }

  setAutoSave(enabled) {
    this.#autoSave = enabled;
  }

  validateSettings(saved) {
    return Object.keys(this.defaultSettings).reduce((acc, key) => {
      acc[key] =
        saved && saved.hasOwnProperty(key)
          ? saved[key]
          : this.defaultSettings[key];
      return acc;
    }, {});
  }

  loadNightSkyTheme() {
    this.setAllSettings(this.nightSkyTheme);
  }
}

export default AppSettings;
