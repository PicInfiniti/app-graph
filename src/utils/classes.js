import { UndirectedGraph } from "graphology";

export class LimitedArray {
  constructor(limit) {
    this.limit = limit;
    this.index = -1;
    this.data = [];
    this.graph = null;
  }

  push(value) {
    if (this.data.length >= this.limit) {
      this.data.shift();
    }
    this.data.push(value);
    this.index = this.data.length - 1;
    this.graph = this.data[this.index];
  }

  getArray() {
    return this.data;
  }

  getIndex(index) {
    return this.data[index] ?? null;
  }

  updateIndex(value) {
    if (value >= 0 && value < this.data.length) {
      this.index = value;
      this.graph = this.data[value];
    }
  }
}


export class Graph extends UndirectedGraph {
  constructor(options) {
    super(options);

    // Automatically add 'id' to node attributes for D3 compatibility
    this.on('nodeAdded', (data) => {
      const { key } = data;
      const attrs = this.getNodeAttributes(key);
      if (!attrs.id) this.setNodeAttribute(key, 'id', Number(key));
    });

    // Automatically add 'source' and 'target' to edge attributes for D3
    this.on('edgeAdded', (data) => {
      const { key, source, target } = data;
      const attrs = this.getEdgeAttributes(key);
      if (!attrs.source) this.setEdgeAttribute(key, 'source', Number(source));
      if (!attrs.target) this.setEdgeAttribute(key, 'target', Number(target));
    });
  }

  // 🚀 Function 1: Get array of all node attributes (with id)
  getNodesForD3() {
    return this.nodes().map((id) => ({
      ...this.getNodeAttributes(id),
      id: Number(id) // Ensure 'id' is numeric for D3
    }));
  }

  // 🚀 Function 2: Get array of all edge attributes (with source and target)
  getEdgesForD3() {
    return this.edges().map((edgeKey) => {
      const { source, target, ...attributes } = this.getEdgeAttributes(edgeKey);
      return {
        source: Number(source), // Ensure 'source' is numeric for D3
        target: Number(target), // Ensure 'target' is numeric for D3
        ...attributes
      };
    });
  }
}

