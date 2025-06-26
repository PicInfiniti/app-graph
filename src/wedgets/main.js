import interact from "interactjs";
import { Metric } from "../graph/metrics";

const d = document;

export class Widgets {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.settings = app.settings;
    this.metric = new Metric(app);

    this.panels = {
      info: d.getElementById("floating-panel"),
      tools: d.getElementById("tools-panel"),
      graphs: d.getElementById("graphs-panel"),
      faces: d.getElementById("face-panel"),
    };

    this.handles = {
      info: "#info",
      tools: "#tools",
      graphs: "#graphs",
      faces: "#faces",
    };

    this.addEventListeners();
    this.makePanelsDraggable();
    this.registerToolListeners();
    this.setupContextMenu();
  }

  init() {
    this.togglePanel("info", "#panel-btn .check", this.settings.info_panel);
    this.togglePanel("tools", "#tools-btn .check", this.settings.tools_panel);
    this.togglePanel(
      "graphs",
      "#graphs-btn .check",
      this.settings.graphs_panel,
    );
    this.togglePanel("faces", "#faces-btn .check", this.settings.face_panel);
  }

  setupContextMenu() {
    const menu = d.getElementById("custom-context-menu");

    d.addEventListener("contextmenu", (event) => {
      event.preventDefault();

      const { offsetWidth: w, offsetHeight: h } = menu;
      const { innerWidth, innerHeight } = window;
      let { pageX: x, pageY: y } = event;

      if (x + w > innerWidth) x -= w;
      if (y + h > innerHeight) y -= h;

      Object.assign(menu.style, {
        left: `${x}px`,
        top: `${y}px`,
        display: "block",
      });
    });

    d.addEventListener("click", () => {
      menu.style.display = "none";
    });
  }

  togglePanel(key, buttonSelector, isVisible) {
    const panel = this.panels[key];
    const button = d.querySelector(buttonSelector);

    button?.classList.toggle("hidden", !isVisible);
    if (panel) {
      panel.style.display = isVisible ? "flex" : "none";
      if (!isVisible) this.resetPanel(panel);
    }
  }

  resetPanel(panel) {
    panel.style.transform = "translate(0px, 0px)";
    panel.setAttribute("data-x", 0);
    panel.setAttribute("data-y", 0);
  }

  addEventListeners() {
    const setupClose = (selector, key) => {
      d.querySelector(selector)?.addEventListener("click", () => {
        this.eventBus.emit("toggleSetting", { key });
      });
    };

    setupClose("#floating-panel .close", "info_panel");
    setupClose("#tools-panel .close", "tools_panel");
    setupClose("#graphs-panel .close", "graphs_panel");
    setupClose("#face-panel .close", "face_panel");

    const infoMax = d.querySelector("#floating-panel .max");
    infoMax?.addEventListener("click", () => {
      this.resetPanel(this.panels.info);
      d.getElementById("floating-panel")?.classList.toggle("MAX");
    });
  }

  makePanelsDraggable() {
    Object.entries(this.panels).forEach(([key, panel]) => {
      const handle = this.handles[key];
      if (panel && handle) {
        this.makeDraggable(panel, handle);
      }
    });
  }

  makeDraggable(panel, handleSelector) {
    interact(panel).draggable({
      allowFrom: handleSelector,
      listeners: {
        move(event) {
          const target = event.target;
          const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

          target.style.transform = `translate(${x}px, ${y}px)`;
          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);
        },
      },
    });
  }

  registerToolListeners() {
    const toolActions = {
      scale: "scale",
      tree: "tree",
      force: "forceSimulation",
      panning: "panning",
      select: "select",
      component: "component",
      "color-picker": "colorPicker",
    };

    Object.entries(toolActions).forEach(([cls, key]) => {
      d.querySelector(`widgets #tools-panel .${cls}`)?.addEventListener(
        "click",
        () => {
          this.eventBus.emit("toggleSetting", { key });
        },
      );
    });
  }
}
