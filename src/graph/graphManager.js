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
import { db } from "../core/db.js";

export class GraphManager {
  constructor(app, type = "mixed") {
    this.app = app;
    this.eventBus = app.eventBus;
    this.settings = app.settings;
    this.layout = app.layout;
    this.generator = new Generator(this);
    this.metric = new Metric(this);
    this.graphsPanel = new GraphsPanel(this);
    this.facePanel = new FacePanel(this);
    this.needsRedraw = {
      node: true,
      edge: true,
      face: true,
      rect: false,
    };

    this._saveQueue = Promise.resolve();
    this.index = -1;
    this.cut = false;
    this._cutNode = [];
    this.graphClass = {
      directed: DirectedGraph,
      undirected: UndirectedGraph,
      mixed: Mixed,
    };

    this._graph = empty(this.graphClass[type], 0);
    this._graph.updateAttributes((attr) => {
      return {
        ...attr,
        label: "Graph",
        id: 0,
        selected: false,
      };
    });
    this.graphs = { index: 0, all: [this._graph] };
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
    return this.graphs.all[this.graphs.index];
  }

  set graph(value) {
    value.mergeAttributes(this.graphs.all[this.graphs.index].getAttributes());
    this.graphs.all[this.graphs.index] = value;
  }

  addNode(id, attr) {
    this.graph.addNode(id, attr);
    this.saveGraphState("add node");
  }

  async updateIndex(value = null) {
    const totalCount = await db.history.count();

    if (value < 0) {
      console.log("Nothing to Undo...", value, totalCount);
      return false;
    }
    if (value >= totalCount) {
      console.log("Nothing to Redo...", value, totalCount);
      return false;
    }

    if (value === null) this.index = totalCount - 1;
    else this.index = value;
    const snapshot = await this.getSnapshot(this.index);
    this.loadSnapshot(snapshot);
    this.refresh();
    return true;
  }

  clearTo(type = "mixed") {
    this.eventBus.emit("updateSetting", { key: "type", value: type });
    this.graph = empty(this.graphClass[type], 0);
    this.saveGraphState(`new ${type}`);
  }

  setupEventListeners() {
    this.eventBus.on("redo", async (event) => {
      await this.updateIndex(this.index + 1);
    });

    this.eventBus.on("undo", async (event) => {
      await this.updateIndex(this.index - 1);
    });
  }

  saveGraphState(action = "", force = true) {
    // Add to the queue
    this._saveQueue = this._saveQueue
      .then(() => this._performSaveGraphState(action, force))
      .catch((e) => {
        console.error("Error saving graph state:", e);
      });

    // Return nothing — fire and forget
  }

  async _performSaveGraphState(action = "", force = true) {
    const currentSnapshot = await this.getSnapshot(this.index);

    if (currentSnapshot) {
      await db.history
        .where("timestamp")
        .above(currentSnapshot.timestamp)
        .delete();
    }

    if (this.settings.saveHistory) {
      const limit = this.settings?.historyLimit || 100;

      const snapshot = {
        version: 1,
        index: this.graphs.index,
        all: this.graphs.all.map((graph) => graph.export()),
        timestamp: Date.now(),
        action,
      };

      await this.saveHistory(snapshot);
      if (this.index++ >= limit) this.index = limit - 1;
      this.graphsPanel.updateGraphsPanel();
      this.facePanel.updateFacePanel();
      if (force) this.app.updateSimulation();
      this.redraw();
    }
  }

  redraw(options = { node: true, edge: true, face: true, rect: true }) {
    this.needsRedraw = options;
    setTimeout(() => {
      this.needsRedraw = { node: false, edge: false, face: false, rect: false };
    }, 120);
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

    this.saveGraphState("connect all edges");
  }

  dropSelected() {
    const edges = this.graph.getSelectedEdges();
    const nodes = this.graph.getSelectedNodes();
    const faces = this.graph.getSelectedFaces();

    faces.forEach((face) => {
      if (this.graph.hasFace(face)) this.graph.dropFace(face);
    });

    edges.forEach((edge) => {
      if (this.graph.hasEdge(edge)) this.graph.dropEdge(edge);
    });

    nodes.forEach((node) => {
      if (this.graph.hasNode(node)) this.graph.dropNode(node);
    });

    this.app.rect.scale.active = false;
    this.saveGraphState("remove selected");
  }

  connectSelectedNodes(type = "directed") {
    this.graph.connectSelectedNodes(this.settings.edge_color, type);
    this.saveGraphState(`add ${type} edge`);
  }

  connectSelectedNodesInOrder(type = "directed") {
    this.graph.connectSelectedNodesInOrder(this.settings.edge_color, type);
    this.saveGraphState(`add ${type} edge in order`);
  }

  updateSelectedColor(n = true, s = true, e = true, f = true, l = true) {
    this.graph.updateSelectedNodesColor(
      n ? this.settings.node_color : false,
      s ? this.settings.stroke_color : false,
      l ? this.settings.label_color : false,
    );
    this.graph.updateSelectedEdgesColor(
      e ? this.settings.edge_color : false,
      l ? this.settings.label_color : false,
    );
    this.graph.updateSelectedFacesColor(
      f ? this.settings.face_color : false,
      l ? this.settings.label_color : false,
    );
    this.saveGraphState("update color", false);
  }

  updateSelectedName(name) {
    if (name) {
      this.graph.updateSelectedName(name);
      this.updateSelectedGarphsAttributes({ label: name });
    } else {
      this.graph.updateSelectedName("");
    }
    this.saveGraphState("update name", false);
  }

  getSelectedGraphs() {
    return this.graphs.all.filter((graph) => graph.getAttribute("selected"));
  }

  updateSelectedGarphsAttributes(updates) {
    this.getSelectedGraphs().forEach((graph) => {
      graph.mergeAttributes(updates);
    });
  }

  updateSelectedInfo(val) {
    if (val) {
      const desc = { "": val };
      this.graph.updateSelectedInfo(desc);
      this.updateSelectedGarphsAttributes({ desc: desc });
    } else {
      this.graph.updateSelectedInfo({});
      this.updateSelectedGarphsAttributes({ desc: {} });
    }
    this.saveGraphState("update info", false);
  }

  updateSelectedWeight(val) {
    const weight = parseFloat(val);
    if (weight) {
      this.graph.updateSelectedWeight(weight);
      this.updateSelectedGarphsAttributes({ weight: weight });
    } else {
      this.graph.updateSelectedWeight(undefined);
      this.updateSelectedGarphsAttributes({ weight: undefined });
    }
    this.saveGraphState("update weight", false);
  }

  deselectAll() {
    this.deselectAllNode();
    this.deselectAllEdge();
    this.deselectAllFace();
    this.deselectAllGraph();
    this.redraw();
  }

  deselectAllGraph() {
    for (const graph of this.graphs.all) {
      graph.updateAttribute("selected", (x) => false);
    }
    this.app.rect.scale.active = false;
  }

  deselectAllNode() {
    this.graph.updateEachNodeAttributes((node, attrs) => ({
      ...attrs,
      selected: false,
    }));
    this.app.rect.scale.active = false;
    this.redraw({ node: true });
  }

  deselectAllEdge() {
    this.graph.updateEachEdgeAttributes((edge, attrs) => ({
      ...attrs,
      selected: false,
    }));
    this.app.rect.scale.active = false;
    this.redraw({ edge: true });
  }

  deselectAllFace() {
    this.graph.forEachFace((face, _) => this.graph.deselectFace(face));
    this.app.rect.scale.active = false;
    this.redraw({ face: true });
  }

  selectAll(array = null) {
    this.selectAllNode(array);
    this.selectAllEdge(array);
    this.selectAllFace(array);
    this.redraw();
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
    this.redraw({ face: true });
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
    this.redraw({ edge: true });
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
    this.redraw({ node: true });
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
    const selectedNodes = this.graph.getSelectedNodes();
    if (selectedNodes.length === 0) return null;
    this.subGraph = this.graph.subgraph(selectedNodes);
    this.cut = false;
  }

  //✂️ cutSelected()
  cutSubgraph() {
    this._cutNode = this.graph.getSelectedNodes();
    if (this._cutNode.length === 0) return null;
    this.subGraph = this.graph.subgraph(this._cutNode);
    this.cut = true;

    this.redraw();
  }

  //📋 pasteSubgraph(subgraph, offset = {x: 0, y: 0})
  pasteSubgraph(val = false, offset = { x: 150, y: 100 }) {
    if (!this.subGraph) return;
    this.subGraph.forEachNode((key, attrs) => {
      const newAttrs = { ...attrs };
      if ("x" in newAttrs) newAttrs.x += offset.x;
      if ("y" in newAttrs) newAttrs.y += offset.y;
      this.subGraph.replaceNodeAttributes(key, newAttrs);
    });

    this.deselectAll();
    this.graph.mergeWith(this.subGraph);
    for (const node of this._cutNode) this.graph.dropNode(node);

    this.cut = false;
    this._cutNode.length = 0;
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
    this.graph.updateEachEdgeAttributes((_, attrs) => ({
      ...attrs,
      weight: 1,
    }));
    this.saveGraphState("add weight to all edge");
  }

  toUnweighted() {
    this.graph.updateEachEdgeAttributes((_, attrs) => ({
      ...attrs,
      weight: undefined,
    }));
    this.saveGraphState("remove weight from all edge");
  }

  async saveHistory(snapshot) {
    try {
      await db.history.add(snapshot);
      // Enforce history limit (optional: use from settings if available)
      const limit = this.settings?.historyLimit || 100;

      const count = await db.history.count();
      if (count > limit) {
        const excess = await db.history
          .orderBy("id")
          .limit(count - limit)
          .toArray();

        const idsToDelete = excess.map((item) => item.id);
        await db.history.bulkDelete(idsToDelete);

        console.log(`Pruned ${idsToDelete.length} old history snapshots.`);
      }
    } catch (err) {
      console.error("Failed to save history snapshot:", err);
    }
  }

  async getLastSnapshot() {
    const lastSnapshot = await db.history.orderBy("id").reverse().first();
    return lastSnapshot;
  }

  async getSnapshot(index) {
    const snapshot = await db.history
      .orderBy("id")
      .offset(index)
      .limit(1)
      .first();
    return snapshot;
  }

  loadSnapshot(snapshot) {
    this.graphs = { index: snapshot.index, all: [] };
    for (const h of snapshot.all) {
      const graph = empty(this.graphClass[h.options.type], 0);
      this.graphs.all.push(graph.import(h));
    }
  }

  refresh() {
    this.eventBus.emit("updateSetting", {
      key: "type",
      value: this.graphs.all[0].type,
    });
    this.graphsPanel.updateGraphsPanel();
    this.facePanel.updateFacePanel();
    this.app.updateSimulation();
    this.redraw();
  }

  async clearHistory() {
    await db.history.clear();
    this.index = -1;
    console.log("History table cleared.");
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
    this.graphs.all.push(subgraph);
    subgraph.deselectAll();
    this.deselectAll();
    this.saveGraphState("add subgraph");
  }

  // Faces
  addFace() {
    const nodes = this.graph.getSelectedNodes();
    const _subgraph = subgraph(this.graph, nodes);
    if (this.metric._isCycle(_subgraph)) {
      this.graph.addFace(nodes);
      this.saveGraphState("add face");
    }
  }
}
