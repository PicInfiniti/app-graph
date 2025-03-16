import { Graph } from '../utils/classes.js';
import { caveman } from 'graphology-generators/community';
import { ladder } from 'graphology-generators/classic';

export class GraphManager {
  constructor(app, limit) {
    this.app = app;
    this.eventBus = app.eventBus

    this.layout = app.layout
    this.limit = limit;
    this.index = 0;
    this.history = [];
    this.graph = ladder(Graph, 10);
    this.init()
  }

  init() {
    this.history.push(this.graph)
    this.setupEventListeners();
  }

  addNode(id, attr) {
    this.saveGraphState();
    this.graph.addNode(id, attr);
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
    this.saveGraphState()
    this.graph.clear();
    this.eventBus.emit("graph:updated", { type: "clear" })

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
    this.saveGraphState();
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

  saveGraphState() {
    this.history.length = this.index + 1
    this.push(this.graph.copy())
  }

  makeGraphComplete() {
    this.saveGraphState();
    for (let i = 0; i < this.graph.order; i++) {
      for (let j = i + 1; j < this.graph.order; j++) {
        this.graph.mergeEdge(i, j); // Add edge if it doesn't exist
      }
    }
    this.eventBus.emit("graph:updated", { type: "addEdge" })
  }

  dropNodesEdges(nodes, edges) {
    this.saveGraphState();
    for (let node of nodes) {
      this.graph.dropNode(node); // Remove the selected node
    }
    for (let edge of edges) {
      this.graph.dropEdge(edge); // Remove the selected node
    }
    this.eventBus.emit("graph:updated", { type: "dropNodesEdges" })
  }
}




