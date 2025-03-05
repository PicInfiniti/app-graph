import { Graph } from '../utils/classes.js';
import { caveman } from 'graphology-generators/community';
import { organizeNodesInCircle } from './layouts.js';

export class GraphManager {
  constructor(limit) {
    this.limit = limit;
    this.index = -1;
    this.history = [];
    this.graph = caveman(Graph, 5, 5);
    this.init()
  }
  init() {
    this.history.push(this.graph)
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
}

