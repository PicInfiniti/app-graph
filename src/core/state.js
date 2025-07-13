import { db } from "./db";
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
      colorPicker: false,
      component: false,
      console_panel: true,
      directed: true,
      directed_edge: true,
      edgeLabel: true,
      edge_color: "#4682b4",
      edge_size: 2,
      forceSimulation: true,
      grid: 20,
      type: "mixed", // directed, undirected, mixed
      grid_color: "#00000020",
      info_panel: true,
      label_color: "#000000",
      label_pos: { x: 0, y: 0 },
      label_size: 15,
      node_color: "#ffffff",
      face_color: "#4682b455",
      node_radius: 40,
      panning: false,
      scale: false,
      select: false,
      stroke_color: "#4682b4",
      stroke_size: 2,
      tools_panel: true,
      tree: true,
      vertexLabel: true,
      faceLabel: true,
      weightLabel: true,
      saveHistory: true,
      historyLimit: 100,
      graphs_panel: true,
      face_panel: true,
      performance: false,
    };

    this.nightSkyTheme = {
      background_color: "#0d1b2a", // deep midnight blue
      edge_color: "#60a5fa", // light blue lines (Tailwind's blue-400)
      edge_size: 1,
      forceSimulation: false,
      grid_color: "#ffffff10",
      label_color: "#d1d5db", // soft gray labels (like Tailwind's text-gray-300)
      label_pos: { x: -20, y: -20 },
      node_color: "#ffffff", // crisp white stars
      node_radius: 10,
      stroke_color: "#ffffff",
      stroke_size: 0,
    };

    // Load validated settings from localStorage or use defaults

    // Listen for external setting updates
    this.registerEventListeners();
  }

  async init() {
    this.settings = await this.loadFromIndexDb();
    return this.settings;
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
          key == "edgeLabel" ||
          key == "weightLabel"
        ) {
          this.eventBus.emit("graph:updated", { type: "vertexLabel" });
        }
      }
    });
  }

  async loadFromIndexDb() {
    try {
      const savedSettings = await db.settings.get("appSettings");
      const validated = this.validateSettings(savedSettings);
      const hasMissingKeys = Object.keys(this.defaultSettings).some(
        (key) => !savedSettings || !(key in savedSettings),
      );

      if (hasMissingKeys) {
        await db.settings.put(validated, "appSettings");
        console.log(
          "Missing or invalid keys found — defaults merged and saved.",
        );
      } else {
        console.log("Settings loaded successfully from IndexedDB.");
      }

      return validated;
    } catch (err) {
      console.warn(
        "Failed to load settings from IndexedDB. Using defaults.",
        err,
      );
      return { ...this.defaultSettings };
    }
  }

  saveToIndexedDB(settings = this.settings) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      try {
        await db.settings.update("appSettings", settings);
        console.log("Settings saved to IndexedDB");

        // Emit a global settings change event
        this.eventBus.emit("settingsChanged", this.getAllSettings());
      } catch (err) {
        console.error("Failed to save settings to IndexedDB", err);
      }
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

        if (this.#autoSave) {
          this.saveToIndexedDB({ [key]: this.settings[key] });
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
      this.saveToIndexedDB();
    }
    applySettingsToUI(this.settings, this.app.canvas);
  }

  toggleSetting(key, value = null) {
    const one = ["scale", "panning", "select", "component"];

    if (key in this.settings && typeof this.settings[key] === "boolean") {
      if (!value) this.settings[key] = !this.settings[key];
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

      if (this.settings.performance) {
        this.settings.forceSimulation = false;
      }

      this.eventBus.emit("settingToggled", { key, value: this.settings[key] });

      if (this.#autoSave && value === null)
        this.saveToIndexedDB({ [key]: this.settings[key] });

      applySettingsToUI(this.settings, this.app.canvas);
      this.app.widget.init();
    } else {
      console.warn(`Setting "${key}" does not exist or is not a boolean.`);
    }
  }

  setAutoSave(enabled) {
    this.#autoSave = enabled;
  }

  validateSettings(saved) {
    const defaults = this.defaultSettings;

    const validated = {};
    for (const key in defaults) {
      validated[key] = saved?.hasOwnProperty(key) ? saved[key] : defaults[key];
    }
    return validated;
  }

  loadNightSkyTheme() {
    this.setAllSettings(this.nightSkyTheme);
  }
}

export default AppSettings;
