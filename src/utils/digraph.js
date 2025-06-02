import { DirectedGraph } from "graphology";

export class Digraph extends DirectedGraph {
  constructor(options) {
    super(options);

    // Automatically add 'id' and 'selected' to nodes
    this.on("nodeAdded", ({ key }) => {
      const attrs = this.getNodeAttributes(key);

      if (!attrs.id) this.setNodeAttribute(key, "id", Number(key));
      if (attrs.selected === undefined)
        this.setNodeAttribute(key, "selected", false);
      if (attrs.size === undefined) this.setNodeAttribute(key, "size", 0.25);
      if (attrs.magnitude === undefined)
        this.setNodeAttribute(key, "magnitude", 1);
      if (attrs.desc === undefined) this.setNodeAttribute(key, "desc", {});
    });

    // Automatically add 'source', 'target', and 'selected' to edges
    this.on("edgeAdded", ({ key, source, target }) => {
      const attrs = this.getEdgeAttributes(key);
      if (!attrs.id) this.setEdgeAttribute(key, "id", this.size - 1);
      if (!attrs.source) this.setEdgeAttribute(key, "source", Number(source));
      if (!attrs.target) this.setEdgeAttribute(key, "target", Number(target));
      if (attrs.selected === undefined)
        this.setEdgeAttribute(key, "selected", false);
      if (attrs.desc === undefined) this.setEdgeAttribute(key, "desc", {});
    });
  }

  // 🧬 Deep copy with structure and attributes
  copy() {
    const newGraph = new Digraph(this.options);
    newGraph.import(this.export());
    return newGraph;
  }

  // 🚀 Prepare nodes for D3
  getNodesForD3() {
    return this.nodes().map((id) => ({
      ...this.getNodeAttributes(id),
      id: Number(id),
    }));
  }

  // 🚀 Prepare edges for D3
  getEdgesForD3() {
    return this.edges().map((edgeKey) => {
      const { source, target, ...attributes } = this.getEdgeAttributes(edgeKey);
      return {
        source: Number(source),
        target: Number(target),
        ...attributes,
      };
    });
  }

  getEdgeSourcetarget(e) {
    return [this.source(e), this.target(e)];
  }
  // ❌ Clear selection on all nodes and edges
  deselectAll() {
    this.updateEachNodeAttributes((_, attrs) => ({
      ...attrs,
      selected: 0,
    }));

    this.updateEachEdgeAttributes((_, attrs) => ({
      ...attrs,
      selected: false,
    }));
  }

  // ✅ Select node/edge
  selectNode(node) {
    this.setNodeAttribute(node, "selected", true);
  }

  selectEdge(edge) {
    this.setEdgeAttribute(edge, "selected", true);
  }

  // ❌ Deselect node/edge
  deselectNode(node) {
    this.setNodeAttribute(node, "selected", false);
  }

  deselectEdge(edge) {
    this.setEdgeAttribute(edge, "selected", false);
  }

  // 🔁 Toggle selection
  toggleNodeSelection(node) {
    const current = this.getNodeAttribute(node, "selected") || 0;

    if (current > 0) {
      // Deselect
      this.setNodeAttribute(node, "selected", 0);
    } else {
      // Assign next available number
      let max = 0;
      this.forEachNode((_, attrs) => {
        if (attrs.selected > max) {
          max = attrs.selected;
        }
      });
      this.setNodeAttribute(node, "selected", max + 1);
    }
  }

  toggleEdgeSelection(edge) {
    const current = this.getEdgeAttribute(edge, "selected") || 0;

    if (current > 0) {
      // Deselect
      this.setEdgeAttribute(edge, "selected", 0);
    } else {
      // Assign next available number
      let max = 0;
      this.forEachEdge((_, attrs) => {
        if (attrs.selected > max) {
          max = attrs.selected;
        }
      });
      this.setEdgeAttribute(edge, "selected", max + 1);
    }
  }

  // 📦 Get selected node/edge keys
  getSelectedNodes() {
    return this.filterNodes((_, attrs) => attrs.selected > 0).sort(
      (a, b) =>
        this.getNodeAttribute(a, "selected") -
        this.getNodeAttribute(b, "selected"),
    );
  }

  getSelectedEdges() {
    return this.filterEdges((_, attrs) => attrs.selected > 0).sort(
      (a, b) =>
        this.getEdgeAttribute(a, "selected") -
        this.getEdgeAttribute(b, "selected"),
    );
  }

  // 🧹 Delete all selected nodes and edges
  deleteSelected() {
    this.getSelectedEdges().forEach((edge) => this.dropEdge(edge));
    this.getSelectedNodes().forEach((node) => this.dropNode(node));
  }

  // 🎨 Update a specific attribute (like color) for all selected nodes
  updateSelectedNodesColor(color, stroke) {
    this.updateSelectedNodesAttributes({ color, stroke });
  }

  updateSelectedName(label) {
    this.updateSelectedNodesAttributes({ label });
    this.updateSelectedEdgesAttributes({ label });
  }

  updateSelectedInfo(desc) {
    this.updateSelectedNodesAttributes({ desc });
    this.updateSelectedEdgesAttributes({ desc });
  }

  updateSelectedNodesName(label) {
    this.updateSelectedNodesAttributes({ label });
  }

  updateSelectedNodesInfo(desc) {
    this.updateSelectedNodesAttributes({ desc });
  }

  updateSelectedEdgesName(label) {
    this.updateSelectedEdgesAttributes({ label });
  }

  updateSelectedEdgesInfo(desc) {
    this.updateSelectedEdgesAttributes({ desc });
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
  connectSelectedNodes(color) {
    const selected = this.getSelectedNodes();
    if (selected.length < 2) return;
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const source = selected[i];
        const target = selected[j];
        // This creates the edge if it doesn't exist, or merges attributes if it does
        this.mergeEdge(source, target, { color: color, selected: false });
      }
    }
  }

  connectSelectedNodesInOrder(color) {
    const ordered = this.getSelectedNodes();
    for (let i = 0; i < ordered.length - 1; i++) {
      const source = ordered[i];
      const target = ordered[i + 1];
      this.mergeEdge(source, target, { color: color, selected: false });
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
