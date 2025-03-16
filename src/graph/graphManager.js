import { Graph } from '../utils/classes.js';
import { caveman } from 'graphology-generators/community';
import { ladder } from 'graphology-generators/classic';
import { organizeNodesInCircle } from './layouts.js';

export class GraphManager {
  constructor(app, limit) {
    this.app = app;
    this.eventBus = app.eventBus

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

  addNode(id, attr) {
    const newGraph = this.graph.copy();
    this.push(newGraph)
    this.graph.addNode(id, attr)
    this.eventBus.emit('graph:updated', { type: 'addNode', node: id })
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
    if (value < 0) {
      console.log('Nothing to Undo...');
      return false
    }
    if (value >= this.history.length) {
      console.log('Nothing to Redo...');
      return false
    }
    this.index = value
    this.graph = this.history[value];
    return true;
  }

  clear() {
    const newGraph = this.graph.copy();
    this.push(newGraph)
    this.graph.clear();
    this.eventBus.emit("graph:updated", { type: "clear" })

  }

  applyLayout(type, canvas) {
    if (type === 'circle') {
      organizeNodesInCircle(this.graph, canvas);
    }
    // More layouts can be added here
  }
  setupEventListeners() {
    this.eventBus.on("redo", (event) => {
      if (this.updateIndex(this.index + 1))
        this.eventBus.emit("graph:updated", { type: "redo" })
    })

    this.eventBus.on("undo", (event) => {
      if (this.updateIndex(this.index - 1))
        this.eventBus.emit("graph:updated", { type: "undo" })
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




