// src/core/App.js

import { EventBus } from './EventBus.js';
import { GraphManager } from '../graph/GraphManager.js';
import { renderGraph } from '../visualization/D3Renderer.js';
import { simulation, startSimulation, stopSimulation } from '../visualization/ForceSimulation.js';
import { KeyHandler } from './KeyHandler.js';
import { appSettings } from './State.js';

export class App {
  constructor() {
    this.graphManager = new GraphManager();  // Handles graph logic
  }

  init() {
    console.log('App initialized 🚀');

    // Initialize global handlers
    KeyHandler.init();  // Handle global keyboard shortcuts

    // Load initial graph
    this.loadInitialGraph();

    // Set up all event listeners
    this.setupEventListeners();
  }

  loadInitialGraph() {
    this.graphManager.createEmptyGraph();  // Or load from data
    renderGraph(this.graphManager.getGraph());  // Visualize the graph
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
}
