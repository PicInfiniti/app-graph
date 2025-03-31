import { UndirectedGraph } from "graphology";

export class Graph extends UndirectedGraph {
  constructor(options) {
    super(options);

    // Automatically add 'id' and 'selected' to nodes
    this.on('nodeAdded', ({ key }) => {
      const attrs = this.getNodeAttributes(key);

      if (!attrs.id) this.setNodeAttribute(key, 'id', Number(key));
      if (attrs.selected === undefined) this.setNodeAttribute(key, 'selected', false);
      if (attrs.size === undefined) this.setNodeAttribute(key, 'size', 10);
    });

    // Automatically add 'source', 'target', and 'selected' to edges
    this.on('edgeAdded', ({ key, source, target }) => {
      const attrs = this.getEdgeAttributes(key);

      if (!attrs.source) this.setEdgeAttribute(key, 'source', Number(source));
      if (!attrs.target) this.setEdgeAttribute(key, 'target', Number(target));
      if (attrs.selected === undefined) this.setEdgeAttribute(key, 'selected', false);
    });
  }

  // 🧬 Deep copy with structure and attributes
  copy() {
    const newGraph = new Graph(this.options);
    newGraph.import(this.export());
    return newGraph;
  }

  // 🚀 Prepare nodes for D3
  getNodesForD3() {
    return this.nodes().map((id) => ({
      ...this.getNodeAttributes(id),
      id: Number(id)
    }));
  }

  // 🚀 Prepare edges for D3
  getEdgesForD3() {
    return this.edges().map((edgeKey) => {
      const { source, target, ...attributes } = this.getEdgeAttributes(edgeKey);
      return {
        source: Number(source),
        target: Number(target),
        ...attributes
      };
    });
  }

  // ❌ Clear selection on all nodes and edges
  deselectAll() {
    this.updateEachNodeAttributes((_, attrs) => ({
      ...attrs,
      selected: false
    }));

    this.updateEachEdgeAttributes((_, attrs) => ({
      ...attrs,
      selected: false
    }));
  }

  // ✅ Select node/edge
  selectNode(node) {
    this.setNodeAttribute(node, 'selected', true);
  }

  selectEdge(edge) {
    this.setEdgeAttribute(edge, 'selected', true);
  }

  // ❌ Deselect node/edge
  deselectNode(node) {
    this.setNodeAttribute(node, 'selected', false);
  }

  deselectEdge(edge) {
    this.setEdgeAttribute(edge, 'selected', false);
  }

  // 🔁 Toggle selection
  toggleNodeSelection(node) {
    this.updateNodeAttribute(node, 'selected', v => !v);
  }

  toggleEdgeSelection(edge) {
    this.updateEdgeAttribute(edge, 'selected', v => !v);
  }

  // 📦 Get selected node/edge keys
  getSelectedNodes() {
    return this.filterNodes((_, attrs) => attrs.selected);
  }

  getSelectedEdges() {
    return this.filterEdges((_, attrs) => attrs.selected);
  }

  // 🧹 Delete all selected nodes and edges
  deleteSelected() {
    this.getSelectedEdges().forEach(edge => this.dropEdge(edge));
    this.getSelectedNodes().forEach(node => this.dropNode(node));
  }

  // 🎨 Update a specific attribute (like color) for all selected nodes
  updateSelectedNodesColor(color) {
    this.updateSelectedNodesAttributes({ color });
  }

  // 🎨 Update a specific attribute (like color) for all selected edges
  updateSelectedEdgesColor(color) {
    this.updateSelectedEdgesAttributes({ color });
  }

  // 🛠️ Update multiple attributes for selected nodes
  updateSelectedNodesAttributes(updates) {
    this.getSelectedNodes().forEach((node) => {
      this.mergeNodeAttributes(node, updates);
    });
  }

  // 🛠️ Update multiple attributes for selected edges
  updateSelectedEdgesAttributes(updates) {
    this.getSelectedEdges().forEach((edge) => {
      this.mergeEdgeAttributes(edge, updates);
    });
  }

  // 🔗 Connect all selected nodes (fully connected using merge)
  connectSelectedNodes() {
    const selected = this.getSelectedNodes();
    if (selected.length < 2) return;
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const source = selected[i];
        const target = selected[j];
        // This creates the edge if it doesn't exist, or merges attributes if it does
        this.mergeUndirectedEdge(source, target, { selected: false });
      }
    }
  }

  // ✅ Select a path of nodes and connecting edges
  selectPath(path) {
    this.deselectAll(); // Clear previous selections

    // Select all nodes in the path
    path.forEach((node) => {
      if (this.hasNode(node)) {
        this.selectNode(node);
      }
    });

    // Select edges between consecutive nodes in the path
    for (let i = 0; i < path.length - 1; i++) {
      const source = path[i];
      const target = path[i + 1];
      if (this.hasEdge(source, target)) {
        const edgeKey = this.edge(source, target);
        this.selectEdge(edgeKey);
      }
    }
  }
}
