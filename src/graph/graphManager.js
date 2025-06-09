import { Digraph } from "../utils/digraph";
import { Graph } from "../utils/graph";
import { empty } from "graphology-generators/classic";
import { Metric } from "./metrics";
import { Generator } from "../generator/main";
import { positiveModulus } from "../utils/helperFunctions.js";
import { reverse, toDirected, toUndirected } from "graphology-operators";

export class GraphManager {
  constructor(app, limit) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.settings = app.settings;
    this.layout = app.layout;
    this.graphClass = this.settings.directed ? Digraph : Graph;

    this.generator = new Generator(this);
    this.metric = new Metric(this);

    this.limit = limit;
    this.index = 0;
    this.history = [empty(this.graphClass, 0)];
    this.graph = this.history[0];

    this.selectNodeIndex = 0;
    this.selectEdgeIndex = 0;

    this.subGraph = undefined;
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  addNode(id, attr) {
    this.saveGraphState();
    this.graph.addNode(id, attr);
    this.eventBus.emit("graph:updated", { type: "addNode", node: id });
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
    return this.history[index] ?? undefined;
  }

  updateIndex(value) {
    if (value < 0) {
      console.log("Nothing to Undo...");
      return false;
    }
    if (value >= this.history.length) {
      console.log("Nothing to Redo...");
      return false;
    }

    this.index = value;
    this.graph = this.history[value];
    return true;
  }

  clear() {
    this.saveGraphState();
    this.graph = empty(Graph, 0);
    this.eventBus.emit("graph:updated", { type: "clear" });
    this.graphClass = Graph;
  }

  clearToDigraph() {
    this.saveGraphState();
    this.graph = empty(Digraph, 0);
    this.eventBus.emit("graph:updated", { type: "clear" });
    this.graphClass = Digraph;
  }

  setupEventListeners() {
    this.eventBus.on("redo", (event) => {
      if (this.updateIndex(this.index + 1))
        this.eventBus.emit("graph:updated", { type: "redo" });
    });

    this.eventBus.on("undo", (event) => {
      if (this.updateIndex(this.index - 1))
        this.eventBus.emit("graph:updated", { type: "undo" });
    });
  }

  updateNodesPostion(positions, center) {
    this.saveGraphState();
    // update position of all nodes
    this.graph.forEachNode((node, attr) => {
      this.graph.updateNodeAttributes(node, (attr) => {
        return {
          ...attr,
          x: positions[node].x + center.x,
          y: positions[node].y + center.y,
        };
      });
    });
  }

  saveGraphState() {
    this.history.length = this.index + 1;
    this.push(this.graph.copy());
  }

  makeGraphComplete() {
    this.saveGraphState();
    for (let i = 0; i < this.graph.order; i++) {
      for (let j = i + 1; j < this.graph.order; j++) {
        this.graph.mergeEdge(i, j); // Add edge if it doesn't exist
      }
    }
    this.eventBus.emit("graph:updated", { type: "addEdge" });
  }

  dropSelectedNodesEdges() {
    this.saveGraphState();
    this.graph.deleteSelected();
    this.eventBus.emit("graph:updated", { type: "dropNodesEdges" });
  }

  connectSelectedNodes() {
    this.saveGraphState();
    this.graph.connectSelectedNodes(this.settings.edge_color);
    this.eventBus.emit("graph:updated", { type: "addNodesEdges" });
  }

  connectSelectedNodesInOrder() {
    this.saveGraphState();
    this.graph.connectSelectedNodesInOrder(this.settings.edge_color);
    this.eventBus.emit("graph:updated", { type: "addNodesEdges" });
  }

  updateSelectedNodesEdgesColor(n = true, s = true, e = true, l = true) {
    this.saveGraphState();
    this.graph.updateSelectedNodesColor(
      n ? this.settings.node_color : false,
      s ? this.settings.stroke_color : false,
      l ? this.settings.label_color : false,
    );
    this.graph.updateSelectedEdgesColor(
      e ? this.settings.edge_color : false,
      l ? this.settings.label_color : false,
    );
    this.eventBus.emit("graph:updated", { type: "updateNodesEdgesColor" });
  }

  updateSelectedName(name) {
    this.saveGraphState();
    if (name) {
      this.graph.updateSelectedName(name);
    } else {
      this.graph.updateSelectedName("");
    }
    this.eventBus.emit("graph:updated", { type: "updateNodesNames" });
  }

  updateSelectedInfo(val) {
    this.saveGraphState();
    if (val) {
      this.graph.updateSelectedInfo({ "": val });
    } else {
      this.graph.updateSelectedInfo({});
    }
    this.eventBus.emit("graph:updated", { type: "updateNodesInfo" });
  }

  updateSelectedWeight(val) {
    this.saveGraphState();
    const weight = parseFloat(val);
    if (weight) {
      this.graph.updateSelectedWeight(weight);
    } else {
      this.graph.updateSelectedWeight(undefined);
    }
    this.eventBus.emit("graph:updated", { type: "updateEdgeWeight" });
  }

  deselectAll() {
    this.deselectAllNode();
    this.deselectAllEdge();
  }

  deselectAllNode() {
    this.graph.updateEachNodeAttributes((node, attrs) => ({
      ...attrs,
      selected: false,
    }));
    this.app.rect.scale.active = false;
    this.eventBus.emit("graph:updated", { type: "unselect" });
  }

  deselectAllEdge() {
    this.graph.updateEachEdgeAttributes((edge, attrs) => ({
      ...attrs,
      selected: false,
    }));
    this.app.rect.scale.active = false;
    this.eventBus.emit("graph:updated", { type: "unselect" });
  }

  selectAll() {
    this.selectAllNode();
    this.selectAllEdge();
  }

  selectAllEdge() {
    this.graph.updateEachEdgeAttributes((edge, attrs) => ({
      ...attrs,
      selected: attrs.id + 1,
    }));
    this.eventBus.emit("graph:updated", { type: "select" });
  }

  selectAllNode() {
    this.graph.updateEachNodeAttributes((node, attrs) => {
      return {
        ...attrs,
        selected: attrs.id + 1,
      };
    });
    this.eventBus.emit("graph:updated", { type: "select" });
  }

  selectNode(node) {
    this.graph.selectNode(node);
    this.eventBus.emit("graph:updated", { type: "select" });
  }

  selectNextNode() {
    if (!this.app.keyHandler.Shift) this.deselectAllNode();
    this.selectNodeIndex = positiveModulus(
      this.selectNodeIndex + 1,
      this.graph.order,
    );
    const node = this.graph.nodes()[this.selectNodeIndex];
    this.graph.selectNode(node);
    this.eventBus.emit("graph:updated", { type: "select" });
  }

  selectPerviousNode() {
    if (!this.app.keyHandler.Shift) this.deselectAllNode();
    this.selectNodeIndex = positiveModulus(
      this.selectNodeIndex - 1,
      this.graph.order,
    );
    const node = this.graph.nodes()[this.selectNodeIndex];
    this.graph.selectNode(node);
    this.eventBus.emit("graph:updated", { type: "select" });
  }

  selectNextEdge() {
    if (!this.app.keyHandler.Shift) this.deselectAllEdge();
    this.selectEdgeIndex = positiveModulus(
      this.selectEdgeIndex + 1,
      this.graph.size,
    );
    const edge = this.graph.edges()[this.selectEdgeIndex];
    this.graph.selectEdge(edge);
    this.eventBus.emit("graph:updated", { type: "select" });
  }

  selectPerviousEdge() {
    if (!this.app.keyHandler.Shift) this.deselectAllEdge();
    this.selectEdgeIndex = positiveModulus(
      this.selectEdgeIndex + 1,
      this.graph.size,
    );
    const edge = this.graph.edges()[this.selectEdgeIndex];
    this.graph.selectEdge(edge);
    this.eventBus.emit("graph:updated", { type: "select" });
  }

  //🔁 copySelected()
  copySubgraph() {
    this.saveGraphState();
    this.subGraph = this.graph.copySubgraph();
  }

  //✂️ cutSelected()
  cutSubgraph() {
    this.saveGraphState();
    this.subGraph = this.graph.cutSubgraph();
  }

  //📋 pasteSubgraph(subgraph, offset = {x: 0, y: 0})
  pasteSubgraph(offset = { x: 150, y: 100 }) {
    this.saveGraphState();
    this.graph.pasteSubgraph(this.subGraph, offset);
    this.eventBus.emit("graph:updated", { type: "pasteSubgraph" });
  }

  reverseGraph() {
    if (this.graph.type == "directed") {
      this.saveGraphState();
      const reversedGraph = reverse(this.graph);
      this.graph.replace(reversedGraph);
      this.eventBus.emit("graph:updated", { type: "reverseGraph" });
    }
  }

  toDigraph() {
    if (this.graph.type == "undirected") {
      this.saveGraphState();
      const diGraph = toDirected(this.graph);
      this.clearToDigraph();
      this.graph.replace(diGraph);
      this.eventBus.emit("updateSetting", { key: "directed", value: true });
      this.eventBus.emit("graph:updated", { type: "toDigraph" });
    }
  }

  toGraph() {
    if (this.graph.type == "directed") {
      this.saveGraphState();
      const graph = toUndirected(this.graph);
      this.clear();
      this.graph.replace(graph);
      this.eventBus.emit("updateSetting", { key: "directed", value: false });
      this.eventBus.emit("graph:updated", { type: "toGraph" });
    }
  }

  toWeighted() {
    this.saveGraphState();
    this.graph.updateEachEdgeAttributes((edge, attrs) => ({
      ...attrs,
      weight: 1,
    }));
    this.eventBus.emit("graph:updated", { type: "toWeighted" });
  }

  toUnweighted() {
    this.saveGraphState();
    this.graph.updateEachEdgeAttributes((edge, attrs) => ({
      ...attrs,
      weight: undefined,
    }));
    this.eventBus.emit("graph:updated", { type: "toUnweighted" });
  }
}
