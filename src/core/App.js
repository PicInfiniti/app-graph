import * as d3 from 'd3';
import { EventBus } from './eventBus.js';
import { GraphManager } from '../graph/graphManager.js';
import { KeyHandler } from './keyHandler.js';
import { caveman } from 'graphology-generators/community';
import { Graph } from '../utils/classes.js';
import AppSettings from './state.js';
import { drawGraph } from '../graph/mutation.js';
import { createMenu } from '../ui/menu.js';
import { addNodeAtEvent } from '../graph/mutation.js';

export class App {
  constructor() {
    this.graphManager = new GraphManager();  // Handles graph logic
    this.canvas = d3.select("#chart").node();
    this.appSettings = new AppSettings(EventBus);
    this.init()
  }

  init() {
    createMenu()
    this.appSettings.init()
    this.initCanvas();
    // Initialize global handlers
    KeyHandler.init();  // Handle global keyboard shortcuts

    // Load initial graph
    this.loadInitialGraph();

    // Set up all event listeners
    this.setupEventListeners();

    d3.select(this.canvas)
      .call(
        d3.drag()
          .container(this.canvas)
          .subject(this.dragsubject.bind(this))  // 👈 Bind this
          .on("start", this.dragstarted.bind(this))
          .on("drag", this.dragged.bind(this))
          .on("end", this.dragended.bind(this))
      );

  }

  initCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.addEventListener("dblclick", (event) => {
      addNodeAtEvent(event, this.graphManager.graph, this.canvas)
    });
  }

  loadInitialGraph() {
    this.graphManager.applyLayout('circle', this.canvas)
    drawGraph(this.graphManager.graph, this.canvas, this.appSettings.settings);  // Visualize the graph
  }

  setupEventListeners() {
    // When layout changes (e.g., user selects new layout from UI)
    EventBus.on('layout:changed', (event) => {
      const { layoutType } = event.detail;
      this.graphManager.applyLayout(layoutType);
      EventBus.emit('graph:updated', { graph: this.graphManager.getGraph() });
    });

    // When graph data updates, re-render visualization
    EventBus.on('graph:updated', (event) => {
      renderGraph(event.detail.graph);
    });

    // Toggle simulation based on UI interactions
    EventBus.on('simulation:toggled', (event) => {
      event.detail.running ? startSimulation() : stopSimulation();
    });

    // Example: Key event to toggle simulation
    EventBus.on('key:pressed', (event) => {
      if (event.detail.key === 's') {
        this.appSettings.settings.forceSimulation = !this.appSettings.settings.forceSimulation;
        EventBus.emit('simulation:toggled', { running: this.appSettings.settings.forceSimulation });
      }
    });
  }

  dragsubject(event) {
    const x = event.x;
    const y = event.y;
    let subject = null;
    let minDist = Infinity;
    this.graphManager.graph.forEachNode((node, attr) => {
      const dx = x - attr.x;
      const dy = y - attr.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.appSettings.settings.node_radius && dist < minDist) {
        minDist = dist;
        subject = attr;
      }
    });
    return subject;
  }



  dragstarted(event) {
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;

    this.graphManager.graph.updateNodeAttributes(event.subject.id, attr => {
      return {
        ...attr,
        x: event.x,
        y: event.y
      };
    });

    if (!this.appSettings.settings.forceSimulation) {
      drawGraph(this.graphManager.graph, this.canvas, this.appSettings.settings)
    }
  }

  dragended(event) {
    event.subject.fx = null;
    event.subject.fy = null;
    event.subject.x = event.x;
    event.subject.y = event.y;
  }
}


