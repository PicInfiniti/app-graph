import * as d3 from 'd3';
import { EventBus } from './event_bus.js';
import { GraphManager } from '../graph/graph_manager.js';
import { KeyHandler } from './key_handler.js';
import { caveman } from 'graphology-generators/community';
import { Graph } from '../utils/classes.js';
import AppSettings from './state.js';
import { drawGraph } from '../graph/mutation.js';

export class App {
  constructor() {
    this.graphManager = new GraphManager();  // Handles graph logic
    this.canvas = d3.select("#chart").node();
    this.setting = new AppSettings(EventBus);
  }

  init() {

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
          .subject(this.dragsubject)
          .on("start", this.dragstarted)
          .on("drag", this.dragged)
          .on("end", this.dragended)
      );
  }

  initCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.addEventListener("dblclick", (event) => {
      addNodeAtEvent(event, this.graph, this.canvas)
    });
  }

  loadInitialGraph() {
    drawGraph(this.graphManager.graph, this.canvas);  // Visualize the graph
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
        appSettings.forceSimulation = !appSettings.forceSimulation;
        EventBus.emit('simulation:toggled', { running: appSettings.forceSimulation });
      }
    });
  }

  dragsubject(event) {
    const x = event.x;
    const y = event.y;
    let subject = null;
    let minDist = Infinity;

    this.history.graph.forEachNode((node, attr) => {
      const dx = x - attr.x;
      const dy = y - attr.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < appSettings.node_radius && dist < minDist) {
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

    this.history.graph.updateNodeAttributes(event.subject.id, attr => {
      return {
        ...attr,
        x: event.x,
        y: event.y
      };
    });
    if (!appSettings.forceSimulation) {
      drawGraph(this.history.graph, this.canvas)
    }
  }

  dragended(event) {
    event.subject.fx = null;
    event.subject.fy = null;
    event.subject.x = event.x;
    event.subject.y = event.y;
  }
}


