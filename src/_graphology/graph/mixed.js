import { Graph } from "graphology";
import { union } from "graphology-operators";
import { attachNodeMethods } from "./methods/node-methods";
import { attachEdgeMethods } from "./methods/edge-methods";
import { attachFaceMethods } from "./methods/face-methods";
import { getAvailableLabel } from "../../utils/helperFunctions";
export default class Mixed extends Graph {
  constructor(options) {
    super(options);
    this.isCustom = true;

    this.defaultColors = {
      edge_color: "#4682b4",
      label_color: "#000000",
      node_color: "#ffffff",
      face_color: "#4682b455",
      stroke_color: "#4682b4",
    };

    this.colors = this.loadFromLocalStorage();

    // Faces
    this._faces = new Map();
    this.events();
  }

  events() {
    // Automatically add 'id' and 'selected' to nodes
    this.on("nodeAdded", ({ key }) => {
      const attrs = this.getNodeAttributes(key);

      if (!attrs.id) this.setNodeAttribute(key, "id", +key);
      if (attrs.label === undefined)
        this.setNodeAttribute(key, "label", getAvailableLabel(attrs.id)); // it shouldn't be null
      if (attrs.weight === undefined)
        this.setNodeAttribute(key, "weight", undefined);

      if (attrs.color === undefined)
        this.setNodeAttribute(key, "color", this.colors.node_color);
      if (attrs.stroke === undefined)
        this.setNodeAttribute(key, "stroke", this.colors.stroke_color);
      if (attrs.labelColor === undefined)
        this.setNodeAttribute(key, "labelColor", this.colors.label_color);
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
        this.setEdgeAttribute(key, "label", getAvailableLabel(attrs.id));
      if (attrs.weight === undefined)
        this.setEdgeAttribute(key, "weight", undefined);
      if (attrs.color === undefined)
        this.setEdgeAttribute(key, "color", this.colors.edge_color);
      if (attrs.labelColor === undefined)
        this.setEdgeAttribute(key, "labelColor", undefined);
      if (!attrs.source) this.setEdgeAttribute(key, "source", Number(source));
      if (!attrs.target) this.setEdgeAttribute(key, "target", Number(target));
      if (attrs.selected === undefined)
        this.setEdgeAttribute(key, "selected", false);
      if (attrs.desc === undefined) this.setEdgeAttribute(key, "desc", {});
    });
  }

  loadFromLocalStorage() {
    // for webworkers who don't access to local storage.
    if (typeof localStorage !== "undefined") {
      const savedSettings = localStorage.getItem("appSettings");
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          return this.validateSettings(parsedSettings);
        } catch (error) {
          console.warn("Invalid settings in localStorage. Using defaults.");
        }
      }
    }
    return { ...this.defaultColors };
  }

  validateSettings(saved = {}) {
    return Object.fromEntries(
      Object.keys(this.defaultColors).map((key) => [
        key,
        key in saved ? saved[key] : this.defaultColors[key],
      ]),
    );
  }

  // 🧬 Deep copy with structure and attributes
  // other tyoe of copy includes emptyCopy and copy use this so it will fix functionality of all of them

  nullCopy(options) {
    var graph = new Mixed(assign({}, this._options, options));
    graph.replaceAttributes(assign({}, this.getAttributes()));
    return graph;
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

  // 🧹 Delete all selected nodes and edges
  deleteSelected() {
    this.getSelectedEdges().forEach((edge) => this.dropEdge(edge));
    this.getSelectedNodes().forEach((node) => this.dropNode(node));
  }

  updateSelectedName(label) {
    this.updateSelectedNodesAttributes({ label });
    this.updateSelectedEdgesAttributes({ label });
    this.updateSelectedFacesAttributes({ label });
  }

  updateSelectedInfo(desc) {
    this.updateSelectedNodesAttributes({ desc });
    this.updateSelectedEdgesAttributes({ desc });
    this.updateSelectedFacesAttributes({ desc });
  }

  updateSelectedWeight(weight) {
    this.updateSelectedNodesAttributes({ weight });
    this.updateSelectedEdgesAttributes({ weight });
    this.updateSelectedFacesAttributes({ weight });
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

    return this.subgraph(selectedNodes);
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
      this.clear();
      this.import(combined.export());
    } else {
      this.disjointUnion(this, sub);
    }

    return sub;
  }

  replace(graph) {
    this.clear();
    this.import(graph.export());
  }

  // extends parent methods. Can't move to prototype.
  //nodes
  dropNode(node) {
    const faces = this.faceNodeNeighbors(node);
    if (faces.length)
      faces.map((face) => {
        this.dropFace(face);
      });

    super.dropNode(node);
  }

  //edges
  dropEdge(edge) {
    var edgeData;
    if (arguments.length > 1) {
      var source = "" + arguments[0];
      var target = "" + arguments[1];
      this.findEdge(source, target, (edge) => {
        edgeData = edge;
      });
    } else {
      edgeData = edge;
    }

    const faces = this.faceEdgeNeighbors(edgeData);
    if (faces.length)
      faces.map((face) => {
        this.dropFace(face);
      });

    super.dropEdge(edgeData);
  }

  export() {
    const _export = super.export();
    _export.attributes.selected = false;

    var faces = new Array(this._faces.size);
    var i = 0;
    this._faces.forEach(function (data, key) {
      faces[i++] = serializeFace(key, data);
    });
    _export.faces = faces;
    return _export;
  }

  import(h) {
    const graph = super.import(h);
    if (typeof h.faces === "function") {
      h.forEachFace((_, attrs) => {
        graph.addFace(attrs.nodes, attrs);
      });
    } else {
      for (const face of h.faces) {
        graph.addFace(face.nodes, face.attributes);
      }
    }

    return graph;
  }

  subgraph(nodes) {
    const S = this.nullCopy();

    // Normalize nodes to an array or set
    if (
      !nodes ||
      (Array.isArray(nodes) && nodes.length === 0) ||
      (nodes instanceof Set && nodes.size === 0)
    ) {
      return S;
    }

    const nodeSet = new Set(nodes); // To allow efficient lookups

    // Add nodes
    for (const node of nodeSet) {
      S.addNode(node, this.getNodeAttributes(node));
    }

    // Add relevant edges
    this.forEachEdge(
      (key, attr, source, target, sourceAttr, targetAttr, undirected) => {
        if (nodeSet.has(source) && nodeSet.has(target)) {
          if (undirected) S.addUndirectedEdgeWithKey(key, source, target, attr);
          else S.addDirectedEdgeWithKey(key, source, target, attr);
        }
      },
    );

    // Add relevant faces
    this.forEachFace((face, attr) => {
      const faceNodes = attr.nodes || [];
      if (faceNodes.every((n) => nodeSet.has(n))) {
        S.addFace(attr.nodes, attr);
      }
    });

    return S;
  }

  disjointUnion(G, H) {
    if (G.multi !== H.multi)
      throw new Error(
        "graphology-operators/disjoint-union: both graph should be simple or multi.",
      );

    // TODO: in the spirit of this operator we should probably prefix something
    G.mergeAttributes(G.getAttributes());

    var labelsH = {};

    var i = Math.max(...G.nodes()) + 1;

    // Adding nodes
    H.forEachNode(function (key, attr) {
      labelsH[key] = i;
      G.addNode(i++, attr);
    });

    // Adding edges
    i = Math.max(...G.edges()) + 1;

    H.forEachEdge(function (key, attr, source, target, _s, _t, undirected) {
      if (undirected)
        G.addUndirectedEdge(labelsH[source], labelsH[target], {
          ...attr,
          id: i++,
        });
      else
        G.addDirectedEdge(labelsH[source], labelsH[target], {
          ...attr,
          id: i++,
        });
    });

    i = Math.max(...G.faces()) + 1;

    H.forEachFace((_, attrs) => {
      G.addFace(
        attrs.nodes.map((old) => labelsH[old]),
        { ...attrs, id: i++ },
      );
    });
    return G;
  }

  clear() {
    this._faces.clear();
    this._edges.clear();
    this._nodes.clear();
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

attachNodeMethods(Mixed);
attachEdgeMethods(Mixed);
attachFaceMethods(Mixed);
