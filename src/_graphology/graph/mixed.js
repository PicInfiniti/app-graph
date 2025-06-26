import { Graph } from "graphology";
import { subgraph, disjointUnion, union } from "graphology-operators";

export default class Mixed extends Graph {
  constructor(options) {
    super(options);
    this.custom = true;
    // Automatically add 'id' and 'selected' to nodes
    this.on("nodeAdded", ({ key }) => {
      const attrs = this.getNodeAttributes(key);

      if (!attrs.id) this.setNodeAttribute(key, "id", Number(key));
      if (attrs.label === undefined)
        this.setNodeAttribute(key, "label", undefined); // it shouldn't be null
      if (attrs.weight === undefined)
        this.setNodeAttribute(key, "weight", undefined);
      if (attrs.color === undefined)
        this.setNodeAttribute(key, "color", undefined);
      if (attrs.labelColor === undefined)
        this.setNodeAttribute(key, "labelColor", undefined);
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
      if (attrs.label === undefined)
        this.setEdgeAttribute(key, "label", undefined);
      if (attrs.weight === undefined)
        this.setEdgeAttribute(key, "weight", undefined);
      if (attrs.color === undefined)
        this.setEdgeAttribute(key, "color", undefined);
      if (attrs.labelColor === undefined)
        this.setEdgeAttribute(key, "labelColor", undefined);
      if (!attrs.source) this.setEdgeAttribute(key, "source", Number(source));
      if (!attrs.target) this.setEdgeAttribute(key, "target", Number(target));
      if (attrs.selected === undefined)
        this.setEdgeAttribute(key, "selected", false);
      if (attrs.desc === undefined) this.setEdgeAttribute(key, "desc", {});
    });

    // Faces
    this._faces = new Map();
  }

  getEdgeWeight(edge) {
    const { weight } = this.getEdgeAttributes(edge);
    return weight;
  }

  setEdgeWeight(edge, val) {
    this.updateEdgeAttribute(edge, "weight", (n) => val);
  }

  setDefaultEdgeWeight(val = 1) {
    this.updateEachEdgeAttributes((_, attrs) => ({
      ...attrs,
      weight: val,
    }));
  }

  // 🧬 Deep copy with structure and attributes
  // other tyoe of copy includes emptyCopy and copy use this so it will fix functionality of all of them

  nullCopy(options) {
    var graph = new Mixed(assign({}, this._options, options));
    graph.replaceAttributes(assign({}, this.getAttributes()));
    return graph;
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

  getEdgeSourceTarget(e) {
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
  updateSelectedNodesColor(color, stroke, labelColor) {
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
  }

  updateSelectedName(label) {
    this.updateSelectedNodesAttributes({ label });
    this.updateSelectedEdgesAttributes({ label });
  }

  updateSelectedInfo(desc) {
    this.updateSelectedNodesAttributes({ desc });
    this.updateSelectedEdgesAttributes({ desc });
  }

  updateSelectedWeight(weight) {
    this.updateSelectedNodesAttributes({ weight });
    this.updateSelectedEdgesAttributes({ weight });
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
  updateSelectedEdgesColor(color, labelColor) {
    if (!color || !labelColor) {
      if (color) {
        this.updateSelectedEdgesAttributes({ color });
      } else if (labelColor) {
        this.updateSelectedEdgesAttributes({ labelColor });
      }
    } else {
      this.updateSelectedEdgesAttributes({ color, labelColor });
    }
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
  connectSelectedNodes(color, type = "directed") {
    const selected = this.getSelectedNodes();
    if (selected.length < 1) return;
    if (selected.length > 1) {
      for (let i = 0; i < selected.length; i++) {
        for (let j = i + 1; j < selected.length; j++) {
          const source = selected[i];
          const target = selected[j];
          // This creates the edge if it doesn't exist, or merges attributes if it does
          if (type == "undirected") {
            this.mergeUndirectedEdge(source, target, {
              color: color,
              selected: false,
            });
          } else {
            this.mergeDirectedEdge(source, target, {
              color: color,
              selected: false,
            });
          }
        }
      }
    } else if (this.allowSelfLoops) {
      const node = selected[0];
      if (type == "undirected") {
        this.mergeUndirectedEdge(node, node, {
          color: color,
          selected: false,
        });
      } else {
        this.mergeDirectedEdge(node, node, {
          color: color,
          selected: false,
        });
      }
    }
  }

  connectSelectedNodesInOrder(color, type = "directed") {
    const ordered = this.getSelectedNodes();
    for (let i = 0; i < ordered.length - 1; i++) {
      const source = ordered[i];
      const target = ordered[i + 1];
      if (type == "undirected") {
        this.mergeUndirectedEdge(source, target, {
          color: color,
          selected: false,
        });
      } else {
        this.mergeDirectedEdge(source, target, {
          color: color,
          selected: false,
        });
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

  //🔁 copySelected()
  copySubgraph() {
    const selectedNodes = this.getSelectedNodes();
    if (selectedNodes.length === 0) return null;

    return subgraph(this, selectedNodes);
  }

  //✂️ cutSelected()
  cutSubgraph() {
    const selected = this.copySubgraph();
    if (selected) this.deleteSelected();
    return selected;
  }

  //📋 pasteSubgraph(subgraph, offset = {x: 0, y: 0})
  pasteSubgraph(sub, cut = false, offset = { x: 0, y: 0 }) {
    if (!sub) return;

    // Optional: adjust layout if using x/y coordinates
    sub.forEachNode((key, attrs) => {
      const newAttrs = { ...attrs };
      if ("x" in newAttrs) newAttrs.x += offset.x;
      if ("y" in newAttrs) newAttrs.y += offset.y;
      sub.replaceNodeAttributes(key, newAttrs);
    });

    // Use disjointUnion to merge with remapped node keys
    this.deselectAll();
    let combined;
    if (cut) {
      combined = union(this, sub);
    } else {
      combined = disjointUnion(this, sub);
    }

    // Replace this graph's contents with the combined graph
    this.clear();
    this.Import(combined.Export());
    return sub;
  }

  replace(graph) {
    this.clear();
    this.Import(graph.Export());
  }

  //faces
  addFace(nodes, attributes) {
    nodes.sort();
    const face = nodes.join("_");

    attributes = {
      ...attributes,
      key: face,
      id: this._faces.size,
      nodes: nodes,
    };

    var faceData = new FaceData(face, nodes, attributes);
    this._faces.set(face, faceData);
  }

  faces() {
    return Array.from(this._faces.keys());
  }

  forEachFace(callback) {
    var iterator = this._faces.values();

    var step, faceData;
    while (((step = iterator.next()), step.done !== true)) {
      faceData = step.value;
      callback(faceData.key, faceData.attributes);
    }
  }

  setFaceAttribute(face, key, attr) {
    this._faces.get(face).attributes[key] = attr;
  }

  getFaceAttribute(face, key) {
    return this._faces.get(face).attributes[key];
  }

  getFaceAttributes(face) {
    return this._faces.get(face).attributes;
  }

  Export() {
    const _export = this.export();

    var faces = new Array(this._faces.size);
    var i = 0;
    this._faces.forEach(function (data, key) {
      faces[i++] = serializeFace(key, data);
    });
    _export.faces = faces;
    return _export;
  }

  Import(h) {
    const graph = this.import(h);
    for (const face of h.faces) {
      this.addFace(face.nodes, face.attributes);
    }
    return graph;
  }
}

// do note remove following code
function assignPolyfill() {
  var target = arguments[0];
  for (var i = 1, l = arguments.length; i < l; i++) {
    if (!arguments[i]) continue;
    for (var k in arguments[i]) {
      target[k] = arguments[i][k];
    }
  }
  return target;
}
var assign = assignPolyfill;
if (typeof Object.assign === "function") assign = Object.assign;

function FaceData(key, nodes, attributes) {
  this.key = key;
  this.attributes = attributes;
  this.nodes = nodes;
}

function serializeFace(key, data) {
  var serialized = {
    key: key,
    nodes: data.nodes,
  };
  if (Object.keys(data.attributes).length) {
    serialized.attributes = assign({}, data.attributes);
  }
  return serialized;
}
