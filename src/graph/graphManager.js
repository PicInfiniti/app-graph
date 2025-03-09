import { Graph } from '../utils/classes.js';
import { EventBus } from '../core/eventBus.js';
import { caveman } from 'graphology-generators/community';
import { ladder } from 'graphology-generators/classic';
import { organizeNodesInCircle } from './layouts.js';

export class GraphManager {
  constructor(limit) {
    this.limit = limit;
    this.index = -1;
    this.history = [];
    this.graph = ladder(Graph, 10);
    this.init()
  }
  init() {
    this.history.push(this.graph)
    this.setupEventListeners();
  }
  push(value) {
    if (this.history.length >= this.limit) {
      this.history.shift();
    }
    this.history.push(value);
    this.index = this.history.length - 1;
    this.graph = this.history[this.index];
  }

  getHistory() {
    return this.history;
  }

  getIndex(index) {
    return this.history[index] ?? null;
  }

  updateIndex(value) {
    if (value >= 0 && value < this.history.length) {
      this.history = value;
      this.graph = this.history[value];
    }
  }

  createEmptyGraph() {
    this.graph.clear();
  }

  applyLayout(type, canvas) {
    if (type === 'circle') {
      organizeNodesInCircle(this.graph, canvas);
    }
    // More layouts can be added here
  }
  setupEventListeners() {
    EventBus.on("graph:updated", (event) => {
      if (event.detail.type === "addNode") {
        const newGraph = this.graph.copy();
        this.graph.dropNode(event.detail.node)
        this.push(newGraph)
      }
    })
  }

  updateNodesPostion(positions, center) {
    // update position of all nodes
    this.graph.forEachNode((node, attr) => {
      this.graph.updateNodeAttributes(node, attr => {
        return {
          ...attr,
          x: positions[node].x + center.x,
          y: positions[node].y + center.y,
        };
      });
    })
  }

}

