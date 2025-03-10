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
    if (value < 0 || value >= this.history.length) {
      console.log('Nothing to Undo...');
      return false
    }
    this.index = value
    this.graph = this.history[value];
    return true;
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

    EventBus.on("clear", (event) => {
      const newGraph = this.graph.copy();
      this.push(newGraph)
      newGraph.clear()
      EventBus.emit("graph:updated", { type: "clear" })
    })

    EventBus.on("redo", (event) => {
      if (this.updateIndex(this.index + 1))
        EventBus.emit("graph:updated", { type: "redo" })
    })

    EventBus.on("undo", (event) => {
      if (this.updateIndex(this.index - 1))
        EventBus.emit("graph:updated", { type: "undo" })
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




