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

const d = document;

export class GraphManager {
  constructor(app, limit, type = "mixed") {
    this.app = app;
    this.eventBus = app.eventBus;
    this.settings = app.settings;
    this.layout = app.layout;
    this.generator = new Generator(this);
    this.metric = new Metric(this);

    this.limit = limit;
    this.index = 0;

    switch (type) {
      case "directed":
        this.graphClass = DirectedGraph;
        break;

      case "undirected":
        this.graphClass = UndirectedGraph;
        break;

      default:
        this.graphClass = Mixed;
        break;
    }

    this.graphIndex = 0;
    this._graph = empty(this.graphClass, 0);
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
  }

  get graph() {
    // return this.graphs[this.graphIndex];
    return this.graphs[0];
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
      const graph = empty(this.graphClass, 0);
      this.graphs.push(graph.import(h));
    }
    this.graphIndex = 0;
    this.updateGraphsPanel();
    return true;
  }

  clearToMixed() {
    this.saveGraphState();
    this.graph = empty(Mixed, 0);
    this.eventBus.emit("graph:updated", { type: "clear" });
    this.graphClass = Mixed;
  }

  clearToUndirectedGraph() {
    this.saveGraphState();
    this.graph = empty(UndirectedGraph, 0);
    this.eventBus.emit("graph:updated", { type: "clear" });
    this.graphClass = UndirectedGraph;
  }

  clearToDigraph() {
    this.saveGraphState();
    this.graph = empty(DirectedGraph, 0);
    this.eventBus.emit("graph:updated", { type: "clear" });
    this.graphClass = DirectedGraph;
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

  updateNodesPostion(positions, center = { x: 0, y: 0 }) {
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
    this.saveGraphState();
  }

  push(graphs) {
    this.history.push(graphs);
    this.index++;

    if (this.history.length >= this.limit) {
      this.history = this.history.slice(-this.limit);
      this.index = this.history.length - 1;
    }
  }

  saveGraphState() {
    if (this.history.length != this.index + 1) {
      this.history.length = this.index + 1;
    }
    this.push(this.graphs.map((graph) => graph.export()));
    if (this.settings.saveHistory) {
      this.saveHistoryToLocalStorage();
    }
    this.updateGraphsPanel();
  }

  makeGraphComplete(type = "directed") {
    this.saveGraphState();
    for (let i = 0; i < this.graph.order; i++) {
      for (let j = i + 1; j < this.graph.order; j++) {
        if (type == "undirected") {
          this.graph.mergeUndirectedEdge(i, j);
        } else {
          this.graph.mergeDirectedEdge(i, j);
        }
      }
    }
    this.eventBus.emit("graph:updated", { type: "addEdge" });
  }

  dropSelectedNodesEdges() {
    this.saveGraphState();
    this.graph.deleteSelected();
    this.eventBus.emit("graph:updated", { type: "dropNodesEdges" });
  }

  connectSelectedNodes(type = "directed") {
    this.saveGraphState();
    this.graph.connectSelectedNodes(this.settings.edge_color, type);
    this.eventBus.emit("graph:updated", { type: "addNodesEdges" });
  }

  connectSelectedNodesInOrder(type = "directed") {
    this.saveGraphState();
    this.graph.connectSelectedNodesInOrder(this.settings.edge_color, type);
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
  }

  deselectAllEdge() {
    this.graph.updateEachEdgeAttributes((edge, attrs) => ({
      ...attrs,
      selected: false,
    }));
    this.app.rect.scale.active = false;
  }

  selectAll(array = null) {
    this.selectAllNode(array);
    this.selectAllEdge(array);
  }

  selectAllEdge(array) {
    if (array) {
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
      array.forEach((id) => {
        const graph = this.graphs[id];
        graph.forEachNode((node, attr) => {
          this.graph.updateNodeAttributes(node, (attrs) => {
            return {
              ...attrs,
              selected: attrs.id + 1,
            };
          });
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
    this.eventBus.emit("graph:updated", { type: "select" });
  }

  selectNextEdge() {
    if (!this.app.keyHandler.isShiftHold()) this.deselectAllEdge();
    this.selectEdgeIndex = positiveModulus(
      this.selectEdgeIndex + 1,
      this.graph.size,
    );
    const edge = this.graph.edges()[this.selectEdgeIndex];
    this.graph.selectEdge(edge);
    this.eventBus.emit("graph:updated", { type: "select" });
  }

  selectPerviousEdge() {
    if (!this.app.keyHandler.isShiftHold()) this.deselectAllEdge();
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
  pasteSubgraph(val = false, offset = { x: 150, y: 100 }) {
    this.subGraph = this.graph.pasteSubgraph(this.subGraph, offset);
    if (val) this.subgraph();

    this.saveGraphState();
  }

  reverseGraph() {
    if (this.graph.type == "directed") {
      this.saveGraphState();
      const reversedGraph = reverse(this.graph);
      this.graph.replace(reversedGraph);
    }
  }

  toDirectedGraph() {
    if (this.graph.type !== "directed") {
      this.saveGraphState();
      const diGraph = toDirected(this.graph);
      this.clearToDigraph();
      this.graph.replace(diGraph);
      this.eventBus.emit("updateSetting", { key: "type", value: "directed" });
      this.eventBus.emit("graph:updated", { type: "toDirectedGraph" });
    }
  }

  toMixedGraph() {
    if (this.graph.type !== "mixed") {
      this.saveGraphState();
      const graph = toMixed(this.graph);
      this.clearToMixed();
      this.graph.replace(graph);
      this.eventBus.emit("updateSetting", { key: "type", value: "mixed" });
      this.eventBus.emit("graph:updated", { type: "toMixedGraph" });
    }
  }

  toUndirectedGraph() {
    if (this.graph.type !== "undirected") {
      this.saveGraphState();
      const diGraph = toUndirected(this.graph);
      this.clearToUndirectedGraph();
      this.graph.replace(diGraph);
      this.eventBus.emit("updateSetting", { key: "type", value: "undirected" });
      this.eventBus.emit("graph:updated", { type: "toUndirectedGraph" });
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

  updateGraphsPanel() {
    const ul = d.querySelector("widgets #graphs-panel ul");
    ul.innerHTML = "";
    this.graphs.forEach((graph, index) => {
      if (graph.getAttribute("id") === undefined)
        graph.setAttribute("id", index);
      if (!graph.getAttribute("label"))
        graph.setAttribute("label", `graph ${index}`);

      const li = d.createElement("li");
      li.id = `graphs-${graph.getAttribute("id")}`; // set the ID
      li.setAttribute("name", "graphs");
      li.textContent = graph.getAttribute("label"); // set the display name
      if (index === this.graphIndex) {
        li.classList.add("select");
      }
      ul.appendChild(li);
    });
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
    this.deselectAll();
    this.saveGraphState();
  }
}
