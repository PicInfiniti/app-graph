// 📁 edge-methods.js
export function attachEdgeMethods(Mixed) {
  Mixed.prototype.setDefaultEdgeWeight = function (val = 1) {
    this.updateEachEdgeAttributes((_, attrs) => ({
      ...attrs,
      weight: val,
    }));
  };

  Mixed.prototype.getEdgeSourceTarget = function (e) {
    return [this.source(e), this.target(e)];
  };

  Mixed.prototype.updateSelectedEdgesName = function (label) {
    this.updateSelectedEdgesAttributes({ label });
  };

  Mixed.prototype.updateSelectedEdgesInfo = function (desc) {
    this.updateSelectedEdgesAttributes({ desc });
  };

  // 🚀 Prepare edges for D3
  Mixed.prototype.getEdgesForD3 = function () {
    return this.edges().map((edgeKey) => {
      const { source, target } = this.getEdgeAttributes(edgeKey);
      return {
        source: source,
        target: target,
      };
    });
  };

  Mixed.prototype.selectEdge = function (edge) {
    this.setEdgeAttribute(edge, "selected", true);
  };

  Mixed.prototype.deselectEdge = function (edge) {
    this.setEdgeAttribute(edge, "selected", false);
  };

  Mixed.prototype.toggleEdgeSelection = function (edge) {
    const current = this.getEdgeAttribute(edge, "selected") || 0;
    if (current > 0) {
      this.setEdgeAttribute(edge, "selected", 0);
    } else {
      let max = 0;
      this.forEachEdge((_, attrs) => {
        if (attrs.selected > max) max = attrs.selected;
      });
      this.setEdgeAttribute(edge, "selected", max + 1);
    }
  };

  Mixed.prototype.getSelectedEdges = function () {
    return this.filterEdges((_, attrs) => attrs.selected > 0).sort(
      (a, b) =>
        this.getEdgeAttribute(a, "selected") -
        this.getEdgeAttribute(b, "selected"),
    );
  };

  // 🛠️ Update multiple attributes for selected edges
  Mixed.prototype.updateSelectedEdgesAttributes = function (updates) {
    this.getSelectedEdges().forEach((edge) => {
      this.mergeEdgeAttributes(edge, updates);
    });
  };

  // 🎨 Update a specific attribute (like color) for all selected edges
  Mixed.prototype.updateSelectedEdgesColor = function (color, labelColor) {
    const updates = {
      ...(color && { color }),
      ...(labelColor && { labelColor }),
    };
    this.updateSelectedEdgesAttributes(updates);
  };

  Mixed.prototype.updateSelectedEdgesName = function (label) {
    this.updateSelectedEdgesAttributes({ label });
  };

  Mixed.prototype.updateSelectedEdgesInfo = function (desc) {
    this.updateSelectedEdgesAttributes({ desc });
  };
}
