import { Mixed, DirectedGraph, UndirectedGraph } from "../_graphology/graph";
import { empty } from "graphology-generators/classic";
import { Metric } from "./metrics";
import { Generator } from "../generator/main";
import { positiveModulus } from "../utils/helperFunctions.js";
import {
  reverse,
  toDirected,
  toUndirected,
  toMixed,
} from "graphology-operators";
import { GraphsPanel } from "../wedgets/graphsPanel.js";
import { FacePanel } from "../wedgets/facePanel.js";
import { subgraph } from "graphology-operators";

export class GraphManager {
  constructor(app, limit, type = "mixed") {
    this.app = app;
    this.eventBus = app.eventBus;
    this.settings = app.settings;
    this.layout = app.layout;
    this.generator = new Generator(this);
    this.metric = new Metric(this);
    this.graphsPanel = new GraphsPanel(this);
    this.facePanel = new FacePanel(this);
    this.needsRedraw = true;

    this.limit = limit;
    this.index = 0;
    this.cut = false;
    this.graphClass = {
      directed: DirectedGraph,
      undirected: UndirectedGraph,
      mixed: Mixed,
    };
    this.graphIndex = 0;
    this._graph = empty(this.graphClass[type], 0);
    this._graph.updateAttributes((attr) => {
      return {
        ...attr,
        label: "Graph",
        id: 0,
      };
    });
    this.graphs = [this._graph];
    this.history = [this.graphs.map((graph) => graph.export())];

    this.selectNodeIndex = 0;
    this.selectEdgeIndex = 0;

    this.subGraph = undefined;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.graphsPanel.init();
    this.facePanel.init();
  }

  get graph() {
    return this.graphs[this.graphIndex];
  }

  set graph(value) {
    value.mergeAttributes(this.graphs[this.graphIndex].getAttributes());
    // this.graphs[this.graphIndex] = value;
    this.graphs = [value];
  }

  addNode(id, attr) {
    this.graph.addNode(id, attr);
    this.saveGraphState();
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
    this.graphs = [];
    for (const h of this.history[this.index]) {
      const graph = empty(this.graphClass[h.options.type], 0);
      this.graphs.push(graph.import(h));
    }
    this.eventBus.emit("updateSetting", {
      key: "type",
      value: this.history[this.index][0].options.type,
    });
    this.graphIndex = 0;
    this.graphsPanel.updateGraphsPanel();
    this.facePanel.updateFacePanel();
    if (this.settings.forceSimulation) {
      this.app.updateSimulation();
    }
    return true;
  }

  clearTo(type = "mixed") {
    this.eventBus.emit("updateSetting", { key: "type", value: type });
    this.graph = empty(this.graphClass[type], 0);
    this.saveGraphState();
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

  push(graphs) {
    this.history.push(graphs);
    this.index++;

    if (this.history.length >= this.limit) {
      this.history = this.history.slice(-this.limit);
      this.index = this.history.length - 1;
    }
  }

  saveGraphState(force = true) {
    if (this.history.length != this.index + 1) {
      this.history.length = this.index + 1;
    }
    this.push(this.graphs.map((graph) => graph.export()));
    if (this.settings.saveHistory) {
      this.saveHistoryToLocalStorage();
    }
    this.graphsPanel.updateGraphsPanel();
    this.facePanel.updateFacePanel();
    if (force) {
      this.app.updateSimulation();
    }
    this.needsRedraw = true;
  }

  makeGraphComplete(type = "directed") {
    for (let i = 0; i < this.graph.order; i++) {
      for (let j = i + 1; j < this.graph.order; j++) {
        if (this.graph.type == "mixed") {
          if (type == "undirected") {
            this.graph.mergeUndirectedEdge(i, j);
          } else {
            this.graph.mergeDirectedEdge(i, j);
          }
        } else {
          this.graph.mergeEdge(i, j);
        }
      }
    }

    this.saveGraphState();
  }

  dropSelectedNodesEdges() {
    const edges = this.graph.getSelectedEdges();
    const nodes = this.graph.getSelectedNodes();
    const faces = this.graph.getSelectedFaces();

    this.graphs.forEach((graph, index) => {
      faces.forEach((face) => {
        if (graph.hasFace(face)) graph.dropFace(face);
      });

      edges.forEach((edge) => {
        if (graph.hasEdge(edge)) graph.dropEdge(edge);
      });

      nodes.forEach((node) => {
        if (graph.hasNode(node)) graph.dropNode(node);
      });
    });

    this.saveGraphState();
  }

  connectSelectedNodes(type = "directed") {
    this.graph.connectSelectedNodes(this.settings.edge_color, type);
    this.saveGraphState();
  }

  connectSelectedNodesInOrder(type = "directed") {
    this.graph.connectSelectedNodesInOrder(this.settings.edge_color, type);
    this.saveGraphState();
  }

  updateSelectedNodesEdgesColor(n = true, s = true, e = true, l = true) {
    this.graph.updateSelectedNodesColor(
      n ? this.settings.node_color : false,
      s ? this.settings.stroke_color : false,
      l ? this.settings.label_color : false,
    );
    this.graph.updateSelectedEdgesColor(
      e ? this.settings.edge_color : false,
      l ? this.settings.label_color : false,
    );
    this.saveGraphState(false);
  }

  updateSelectedName(name) {
    if (name) {
      this.graph.updateSelectedName(name);
    } else {
      this.graph.updateSelectedName("");
    }
    this.saveGraphState(false);
  }

  updateSelectedInfo(val) {
    if (val) {
      this.graph.updateSelectedInfo({ "": val });
    } else {
      this.graph.updateSelectedInfo({});
    }
    this.saveGraphState(false);
  }

  updateSelectedWeight(val) {
    const weight = parseFloat(val);
    if (weight) {
      this.graph.updateSelectedWeight(weight);
    } else {
      this.graph.updateSelectedWeight(undefined);
    }
    this.saveGraphState(false);
  }

  deselectAll() {
    this.deselectAllNode();
    this.deselectAllEdge();
    this.deselectAllFace();
  }

  deselectAllNode() {
    this.graph.updateEachNodeAttributes((node, attrs) => ({
      ...attrs,
      selected: false,
    }));
    this.app.rect.scale.active = false;
  }

  deselectAllEdge() {
    this.graph.updateEachEdgeAttributes((edge, attrs) => ({
      ...attrs,
      selected: false,
    }));
    this.app.rect.scale.active = false;
  }

  deselectAllFace() {
    this.graph.forEachFace((face, _) => this.graph.deselectFace(face));
    this.app.rect.scale.active = false;
  }

  selectAll(array = null) {
    this.selectAllNode(array);
    this.selectAllEdge(array);
    this.selectAllFace(array);
  }

  selectAllFace(array) {
    this.deselectAllFace();
    if (array) {
      array.forEach((face) => {
        this.selectFace(face);
      });
    } else {
      this.graph.updateEachFaceAttributes((edge, attrs) => ({
        ...attrs,
        selected: attrs.id + 1,
      }));
    }
  }

  selectAllEdge(array) {
    this.deselectAllEdge();
    if (array) {
      array.forEach((edge) => {
        this.selectEdge(edge);
      });
    } else {
      this.graph.updateEachEdgeAttributes((edge, attrs) => ({
        ...attrs,
        selected: attrs.id + 1,
      }));
    }
  }

  selectAllNode(array) {
    if (array) {
      this.deselectAllNode();
      array.forEach((node) => {
        if (this.graph.hasNode(node))
          this.graph.updateNodeAttributes(node, (attrs) => {
            return {
              ...attrs,
              selected: attrs.id + 1,
            };
          });
      });
    } else {
      this.graph.updateEachNodeAttributes((node, attrs) => {
        return {
          ...attrs,
          selected: attrs.id + 1,
        };
      });
    }
  }

  selectNode(node) {
    this.graph.selectNode(node);
  }

  selectFace(face) {
    this.graph.selectFace(face);
  }

  selectEdge(edge) {
    this.graph.selectEdge(edge);
  }

  selectNextNode() {
    if (!this.app.keyHandler.isShiftHold()) this.deselectAllNode();
    this.selectNodeIndex = positiveModulus(
      this.selectNodeIndex + 1,
      this.graph.order,
    );
    const node = this.graph.nodes()[this.selectNodeIndex];
    this.graph.selectNode(node);
  }

  selectPerviousNode() {
    if (!this.app.keyHandler.isShiftHold()) this.deselectAllNode();
    this.selectNodeIndex = positiveModulus(
      this.selectNodeIndex - 1,
      this.graph.order,
    );
    const node = this.graph.nodes()[this.selectNodeIndex];
    this.graph.selectNode(node);
  }

  selectNextEdge() {
    if (!this.app.keyHandler.isShiftHold()) this.deselectAllEdge();
    this.selectEdgeIndex = positiveModulus(
      this.selectEdgeIndex + 1,
      this.graph.size,
    );
    const edge = this.graph.edges()[this.selectEdgeIndex];
    this.graph.selectEdge(edge);
  }

  selectPerviousEdge() {
    if (!this.app.keyHandler.isShiftHold()) this.deselectAllEdge();
    this.selectEdgeIndex = positiveModulus(
      this.selectEdgeIndex + 1,
      this.graph.size,
    );
    const edge = this.graph.edges()[this.selectEdgeIndex];
    this.graph.selectEdge(edge);
  }

  //🔁 copySelected()
  copySubgraph() {
    this.subGraph = this.graph.copySubgraph();
    this.cut = false;
  }

  //✂️ cutSelected()
  cutSubgraph() {
    this.subGraph = this.graph.cutSubgraph();
    this.cut = true;
  }

  //📋 pasteSubgraph(subgraph, offset = {x: 0, y: 0})
  pasteSubgraph(val = false, offset = { x: 150, y: 100 }) {
    this.subGraph = this.graph.pasteSubgraph(this.subGraph, this.cut, offset);
    if (val) this.subgraph();
    this.cut = false;
    this.saveGraphState();
  }

  reverseGraph() {
    if (this.graph.type !== "undirected") {
      const reversedGraph = reverse(this.graph);
      this.graph.replace(reversedGraph);
      this.saveGraphState();
    }
  }

  toDirectedGraph() {
    if (this.graph.type !== "directed") {
      const diGraph = toDirected(this.graph);
      this.clearTo("directed");
      this.graph.replace(diGraph);
      this.eventBus.emit("updateSetting", { key: "type", value: "directed" });
      this.saveGraphState();
    }
  }

  toMixedGraph() {
    if (this.graph.type !== "mixed") {
      const graph = toMixed(this.graph);
      this.clearTo("mixed");
      this.graph.replace(graph);
      this.eventBus.emit("updateSetting", { key: "type", value: "mixed" });
      this.saveGraphState();
    }
  }

  toUndirectedGraph() {
    if (this.graph.type !== "undirected") {
      const diGraph = toUndirected(this.graph);
      this.clearTo("undirected");
      this.graph.replace(diGraph);
      this.eventBus.emit("updateSetting", { key: "type", value: "undirected" });
      this.saveGraphState();
    }
  }

  toWeighted() {
    this.graph.updateEachEdgeAttributes((edge, attrs) => ({
      ...attrs,
      weight: 1,
    }));
    this.saveGraphState();
  }

  toUnweighted() {
    this.graph.updateEachEdgeAttributes((edge, attrs) => ({
      ...attrs,
      weight: undefined,
    }));
    this.saveGraphState();
  }

  saveHistoryToLocalStorage() {
    if (!this.validateHistory(this.history)) {
      console.warn("Cannot save: history data is invalid.");
      return false;
    }

    try {
      const historyJSON = JSON.stringify(this.history);
      localStorage.setItem("graphStudio-history", historyJSON);
      // console.log("History successfully saved to local storage.");
      return true;
    } catch (error) {
      console.error("Failed to save history to local storage:", error);
      return false;
    }
  }

  loadHitoryFromLocalStorage() {
    const history = localStorage.getItem("graphStudio-history");
    if (history) {
      try {
        const parsedHistory = JSON.parse(history);
        if (this.validateHistory(parsedHistory)) {
          this.history = parsedHistory;
          this.updateIndex(this.history.length - 1);
          return true;
        }
      } catch (error) {
        console.warn("Invalid JSON format in localStorage.");
      }
    }
  }

  cleanLocalStorage() {
    localStorage.removeItem("graphStudio-history");
  }

  validateHistory(history) {
    if (!Array.isArray(history)) {
      console.error("Graph data must be an array.");
      return false;
    }

    for (const h of history) {
      const graph = h[0]; // Each graph state is wrapped in an array
      if (!graph) {
        console.error(`Graph at index ${i} is missing.`);
        return false;
      }

      // Validate nodes
      if (!Array.isArray(graph.nodes)) {
        console.error(`Graph at index ${i} has invalid or missing nodes.`);
        return false;
      }
      for (const node of graph.nodes) {
        if (typeof node.key !== "string") {
          console.error(`Node missing or invalid key at graph ${i}.`);
          return false;
        }
        if (typeof node.attributes !== "object" || node.attributes === null) {
          console.error(`Node ${node.key} missing attributes at graph ${i}.`);
          return false;
        }
        if (!("id" in node.attributes)) {
          console.error(`Node ${node.key} missing id at graph ${i}.`);
          return false;
        }
      }

      // Validate edges
      if (!Array.isArray(graph.edges)) {
        console.error(`Graph at index ${i} has invalid or missing edges.`);
        return false;
      }
      for (const edge of graph.edges) {
        if (typeof edge.key !== "string") {
          console.error(`Edge missing or invalid key at graph ${i}.`);
          return false;
        }
        if (
          typeof edge.source !== "string" ||
          typeof edge.target !== "string"
        ) {
          console.error(
            `Edge ${edge.key} missing or invalid source/target at graph ${i}.`,
          );
          return false;
        }
        if (typeof edge.attributes !== "object" || edge.attributes === null) {
          console.error(`Edge ${edge.key} missing attributes at graph ${i}.`);
          return false;
        }
      }
    }

    // console.log("Graph data validated successfully.");
    return true;
  }

  subgraph() {
    const nodeIds = this.graph.getSelectedNodes();
    if (!nodeIds.length) {
      this.metric.addHeader("Graphs");
      this.metric.addInfo("Select at least one node");
      this.metric.addLine();
      return;
    }
    const subgraph = this.graph.copySubgraph();
    subgraph.removeAttribute("id");
    subgraph.removeAttribute("label");
    this.graphs.push(subgraph);
    subgraph.deselectAll();
    this.deselectAll();
    this.saveGraphState();
  }

  // Faces
  addFace() {
    const nodes = this.graph.getSelectedNodes();
    const _subgraph = subgraph(this.graph, nodes);
    if (this.metric._isCycle(_subgraph)) {
      this.graph.addFace(nodes);
      this.saveGraphState();
    }
  }
}
