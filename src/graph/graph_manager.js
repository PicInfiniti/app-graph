// src/graph/GraphManager.js
import Graph from 'graphology';
import { organizeNodesInCircle } from './layouts.js';

export class GraphManager {
  constructor() {
    this.graph = new Graph();
  }

  createEmptyGraph() {
    this.graph.clear();
  }

  getGraph() {
    return this.graph;
  }

  applyLayout(type) {
    if (type === 'circle') {
      organizeNodesInCircle(this.graph);
    }
    // More layouts can be added here
  }
}
