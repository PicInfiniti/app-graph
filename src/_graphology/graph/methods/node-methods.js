export function attachNodeMethods(Mixed) {
  Mixed.prototype.updateSelectedNodesName = function (label) {
    this.updateSelectedNodesAttributes({ label });
  };

  Mixed.prototype.updateSelectedNodesInfo = function (desc) {
    this.updateSelectedNodesAttributes({ desc });
  };

  Mixed.prototype.setDefaultNodeWeight = function (val = 1) {
    this.updateEachNodeAttributes((_, attrs) => ({
      ...attrs,
      weight: val,
    }));
  };

  // 🚀 Prepare nodes for D3
  Mixed.prototype.getNodesForD3 = function () {
    return this.nodes().map((id) => ({
      ...this.getNodeAttributes(id),
      id: Number(id),
    }));
  };

  // ✅ Select node
  Mixed.prototype.selectNode = function (node) {
    this.setNodeAttribute(node, "selected", true);
  };

  // ❌ Deselect node
  Mixed.prototype.deselectNode = function (node) {
    this.setNodeAttribute(node, "selected", false);
  };

  // 🔁 Toggle selection
  Mixed.prototype.toggleNodeSelection = function (node) {
    const current = this.getNodeAttribute(node, "selected") || 0;

    if (current > 0) {
      this.setNodeAttribute(node, "selected", 0);
    } else {
      let max = 0;
      this.forEachNode((_, attrs) => {
        if (attrs.selected > max) {
          max = attrs.selected;
        }
      });
      this.setNodeAttribute(node, "selected", max + 1);
    }
  };

  // 📦 Get selected nodes
  Mixed.prototype.getSelectedNodes = function () {
    return this.filterNodes((_, attrs) => attrs.selected > 0).sort(
      (a, b) =>
        this.getNodeAttribute(a, "selected") -
        this.getNodeAttribute(b, "selected"),
    );
  };

  // 🎨 Update color/stroke/labelColor for selected nodes
  Mixed.prototype.updateSelectedNodesColor = function (
    color,
    stroke,
    labelColor,
  ) {
    if (!color || !stroke || !labelColor) {
      if (color) {
        this.updateSelectedNodesAttributes({ color });
      } else if (stroke) {
        this.updateSelectedNodesAttributes({ stroke });
      } else if (labelColor) {
        this.updateSelectedNodesAttributes({ labelColor });
      }
    } else {
      this.updateSelectedNodesAttributes({ color, stroke, labelColor });
    }
  };

  // 🛠️ Update multiple attributes
  Mixed.prototype.updateSelectedNodesAttributes = function (updates) {
    this.getSelectedNodes().forEach((node) => {
      this.mergeNodeAttributes(node, updates);
    });
  };

  // 🔗 Fully connect all selected nodes
  Mixed.prototype.connectSelectedNodes = function (color, type = "directed") {
    const selected = this.getSelectedNodes();
    if (selected.length < 1) return;

    if (selected.length > 1) {
      for (let i = 0; i < selected.length; i++) {
        for (let j = i + 1; j < selected.length; j++) {
          const source = selected[i];
          const target = selected[j];
          const edgeAttrs = { color, selected: false };
          if (this.type === "mixed") {
            if (type === "undirected") {
              this.mergeUndirectedEdge(source, target, edgeAttrs);
            } else {
              this.mergeDirectedEdge(source, target, edgeAttrs);
            }
          } else {
            this.mergeEdge(source, target, edgeAttrs);
          }
        }
      }
    } else if (this.allowSelfLoops) {
      const node = selected[0];
      const edgeAttrs = { color, selected: false };

      if (type === "undirected") {
        this.mergeUndirectedEdge(node, node, edgeAttrs);
      } else {
        this.mergeDirectedEdge(node, node, edgeAttrs);
      }
    }
  };

  // 🔗 Connect selected nodes in order
  Mixed.prototype.connectSelectedNodesInOrder = function (
    color,
    type = "directed",
  ) {
    const ordered = this.getSelectedNodes();

    for (let i = 0; i < ordered.length - 1; i++) {
      const source = ordered[i];
      const target = ordered[i + 1];
      const edgeAttrs = { color, selected: false };

      if (type === "undirected") {
        this.mergeUndirectedEdge(source, target, edgeAttrs);
      } else {
        this.mergeDirectedEdge(source, target, edgeAttrs);
      }
    }
  };
}
