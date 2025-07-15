import * as d3 from "d3";
import { EventBus } from "./eventBus.js";
import { Canvas } from "./canvas.js";
import { GraphManager } from "../graph/graphManager.js";
import { KeyHandler } from "./keyHandler.js";
import AppSettings from "./state.js";
import { Menu } from "../ui/menu.js";
import { EventHandlers } from "./eventHandlers.js";
import { menuData } from "../ui/MenuData.js";
import { Layout } from "../graph/layouts.js";
import { Widgets } from "../wedgets/main.js";
import { Rect } from "./rect.js";
import { ColorPicker } from "../ui/colorPickr.js";
import { GraphRenderer } from "../graph/graphRenderer.js";
import { applySettingsToUI } from "../ui/uiManager";

export class App {
  constructor() {
    this.eventBus = EventBus;
    this.appSettings = new AppSettings(this);

    this._canvas = null;
    this.layout = null;
    this.graphManager = null;
    this.rect = null;
    this.graphRenderer = null;
    this.menu = null;
    this.widget = null;
    this.keyHandler = null; // Handle global keyboard shortcuts
    this.eventHanders = null;
    this.colorPicker = null;

    this.simulation = null;
    this.nodes = [];
    this.links = [];
    // Rectangle properties
    this.init();
  }

  async init() {
    this.settings = await this.appSettings.init();
    this._canvas = new Canvas(this);
    this.canvas = this._canvas.canvas;
    this.layout = new Layout(this);
    this.graphManager = new GraphManager(this, this.settings.type); // Handles graph logic
    this.rect = new Rect(this);
    this.graphRenderer = new GraphRenderer(this);
    this.menu = new Menu(this, menuData);
    this.widget = new Widgets(this);
    this.keyHandler = new KeyHandler(this); // Handle global keyboard shortcuts
    this.eventHanders = new EventHandlers(this);
    this.colorPicker = new ColorPicker(this);

    this.menu.init();
    applySettingsToUI(this.settings, this.canvas);

    this.widget.init();
    this._canvas.init();
    this.rect.init();
    this.keyHandler.init(); // Handle global keyboard shortcuts
    this.eventHanders.init();
    this.initSimulation();
    this.loadInitialGraph();
    this.colorPicker.init();
    this.startAnimationLoop();
  }

  initSimulation() {
    this.nodes = this.graphManager.graph.getNodesForD3();
    this.links = this.graphManager.graph.getEdgesForD3();

    this.simulation = d3
      .forceSimulation(this.nodes)
      .force(
        "link",
        d3
          .forceLink(this.links)
          .id((d) => d.id)
          .distance(10) // Increased link distance
          .strength(0.5),
      ) // Moderate link strength
      .force("charge", d3.forceManyBody().strength(-300)) // Stronger negative value for repulsion
      .force("collide", d3.forceCollide(20)) // Prevents node overlap
      .force(
        "center",
        d3.forceCenter(this.canvas.width / 2, this.canvas.height / 2),
      )
      .force("x", d3.forceX(this.canvas.width / 2).strength(0.05)) // Gentle attraction to center
      .force("y", d3.forceY(this.canvas.height / 1).strength(0.05)) // Gentle attraction to center
      .velocityDecay(0.3) // Slower decay for smoother stabilization
      .alphaDecay(0.02); // Slower cooling, better final spread

    if (!this.appSettings.settings.forceSimulation) {
      this.simulation.stop();
    }
  }

  async loadInitialGraph() {
    const snapshot = await this.graphManager.getLastSnapshot();
    if (!snapshot) {
      this.graphManager.generator.clusters(20, 20, 10);
    } else {
      this.graphManager.loadSnapshot(snapshot);
      await this.graphManager.updateIndex();
    }
  }

  ticked() {
    // Draw nodes
    this.nodes.forEach((d) => {
      this.graphManager.graph.updateNodeAttributes(d.id, (attr) => {
        return {
          ...attr,
          x: d.x,
          y: d.y,
        };
      });
    });
    this.eventBus.emit("graph:updated", { type: "tick" });
  }

  startSimulation() {
    this.simulation.alpha(0.3).restart(); // Reheat simulation after updates
  }

  stopSimulation() {
    this.simulation.stop();
  }

  updateSimulation() {
    this.nodes.length = 0;
    this.nodes = this.graphManager.graph.getNodesForD3();

    this.links.length = 0;
    this.links = this.graphManager.graph.getEdgesForD3();

    this.simulation.nodes(this.nodes);
    this.simulation.force("link").links(this.links);
    if (this.appSettings.settings.forceSimulation) {
      this.startSimulation();
    } else {
      this.stopSimulation();
    }
  }

  updateForce() {
    const graph = this.graphManager.graph;

    this.nodes.length = 0;
    graph.forEachNode((node, attr) => {
      this.nodes.push({
        id: Number(node),
        x: attr.x,
        y: attr.y,
      });
    });

    this.links.length = 0;
    graph.forEachEdge(function (edge, attr, s, t, source, target) {
      this.links.push({
        source: Number(s),
        target: Number(t),
      });
    });
  }

  startAnimationLoop() {
    const loop = () => {
      if (this.appSettings.settings.forceSimulation) {
        this.simulation.tick(); // Advance the simulation
        this.ticked(); // Update graph model
        this.graphRenderer.drawGraph({ node: true, edge: true, face: true }); // Only draw when needed
      } else {
        this.graphRenderer.drawGraph(this.graphManager.needsRedraw); // Only draw when needed
      }

      requestAnimationFrame(loop); // Continue loop
    };

    requestAnimationFrame(loop); // Start loop
  }
}
