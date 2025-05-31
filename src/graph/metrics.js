import {
  connectedComponents,
  forEachConnectedComponent,
  countConnectedComponents,
} from "graphology-components";
import { bidirectional } from "graphology-shortest-path";
import { density, diameter } from "graphology-metrics/graph";
import { simmelianStrength } from "graphology-metrics/edge";
import closenessCentrality from "graphology-metrics/centrality/closeness";
import { degreeCentrality } from "graphology-metrics/centrality/degree";
import betweennessCentrality from "graphology-metrics/centrality/betweenness";
import eigenvectorCentrality from "graphology-metrics/centrality/eigenvector";
import { edgeUniformity } from "graphology-metrics/layout-quality";
import stress from "graphology-metrics/layout-quality/stress";
import eccentricity from "graphology-metrics/node/eccentricity";
import pagerank from "graphology-metrics/centrality/pagerank";
import neighborhoodPreservation from "graphology-metrics/layout-quality/neighborhood-preservation";
import disparity from "graphology-metrics/edge/disparity";

const d = document;

export class Metric {
  constructor(graphManager) {
    this.graphManager = graphManager;
    this.pannel = d.querySelector("#floating-panel .body-info");
  }

  addHeader(h) {
    const header = d.createElement("h4");
    header.textContent = h;
    this.pannel.appendChild(header);
    console.log(h);
  }

  addInfo(info) {
    const div = d.createElement("div");
    div.insertAdjacentHTML("beforeend", info);
    this.pannel.appendChild(div);
    console.log(info);
  }

  addLine() {
    const line = d.createElement("hr");
    this.pannel.appendChild(line);
    this.pannel.scrollTop = this.pannel.scrollHeight;
  }

  allInfo() {
    for (let node of this.graphManager.graph.getSelectedNodes()) {
      const attrs = this.graphManager.graph.getNodeAttributes(node);
      console.log(attrs);
      if (Object.keys(attrs.desc).length != 0) {
        this.addHeader(`${attrs.label}:`);
        for (let key in attrs.desc) {
          this.addInfo(`${key}: ${attrs.desc[key]}`);
        }
        this.addLine();
      }
    }
  }

  getComponent(node) {
    const graph = this.graphManager.graph;
    const components = connectedComponents(graph);
    for (let component of components) {
      if (component.includes(String(node))) {
        return component;
      }
    }
    return null;
  }

  basicInfo() {
    const graph = this.graphManager.graph;
    this.addHeader("Basic Informattion");
    this.addInfo(`|V|: ${graph.order}`);
    this.addInfo(`|E|: ${graph.size}`);
    this.addInfo(`Type: ${graph.type}`);
    this.addLine();
  }

  degreeSequesnce() {
    this.addHeader("Degree Sequence");

    const graph = this.graphManager.graph;
    const ds = graph.mapNodes((node, attr) => graph.degree(node));
    const degrees = `(${ds.join(", ")})`;

    this.addInfo(degrees);
    this.addLine();
  }

  countComponents() {
    const graph = this.graphManager.graph;
    this.addHeader("Connected Components");
    const count = countConnectedComponents(graph);
    this.addInfo(`Count: ${count}`);
    forEachConnectedComponent(graph, (component) => {
      this.addInfo(
        component
          .map((node) => graph.getNodeAttribute(node, "label"))
          .join(", "),
      );
    });

    this.addLine();
  }

  neighbors() {
    const graph = this.graphManager.graph;
    this.addHeader("Neighbors");

    const selectedNodes = this.graphManager.graph.getSelectedNodes();
    if (selectedNodes.length !== 1) {
      this.addInfo("Select one node");
      this.addLine();
      return;
    }

    const [node] = selectedNodes;
    const n = graph.neighbors(node);

    this.addInfo(
      n.map((node) => graph.getNodeAttribute(node, "label")).join(", "),
    );
    this.addLine();
  }

  shortestPath() {
    this.addHeader("Shortest Path");

    const graph = this.graphManager.graph;
    const selectedNodes = this.graphManager.graph.getSelectedNodes();
    if (selectedNodes.length !== 2) {
      this.addInfo("Select two nodes");
      this.addLine();
      return;
    }

    const [source, target] = selectedNodes;
    const path = bidirectional(graph, source, target);

    if (path) {
      this.addInfo(
        path.map((node) => graph.getNodeAttribute(node, "label")).join(" -> "),
      );
      this.addLine();
      graph.selectPath(path);
      this.graphManager.app.drawGraph();
    } else {
      this.addInfo("They are not connected");
      this.addLine();
    }
  }

  density() {
    this.addHeader("Density");
    const graph = this.graphManager.graph;
    const d = density(graph);
    this.addInfo(d);
    this.addLine();
  }

  diameter() {
    this.addHeader("Diameter");
    const graph = this.graphManager.graph;
    const d = diameter(graph);
    this.addInfo(d);
    this.addLine();
  }

  eccentricity() {
    this.addHeader("Eccentricity");

    const graph = this.graphManager.graph;
    const selectedNodes = this.graphManager.graph.getSelectedNodes();
    if (selectedNodes.length !== 1) {
      this.addInfo("Select one node");
      this.addLine();
      return;
    }
    const [node] = selectedNodes;
    const e = eccentricity(graph, node);
    this.addInfo(e);
    this.addLine();
  }

  simmelianStrength() {
    this.addHeader("Simmelian strength");
    const graph = this.graphManager.graph;
    const strengths = simmelianStrength(graph);
    for (const key in strengths) {
      const [source, target] = graph.getEdgeSourcetarget(key);
      this.addInfo(
        `${graph.getNodeAttribute(source, "label")}, ${graph.getNodeAttribute(target, "label")} : ${strengths[key]}`,
      );
    }
    this.addLine();
  }

  betweennessCentrality() {
    this.addHeader("Betweenness centrality");
    const graph = this.graphManager.graph;
    const strengths = betweennessCentrality(graph);
    for (const key in strengths) {
      this.addInfo(
        `${graph.getNodeAttribute(key, "label")}: ${strengths[key]}`,
      );
    }
    this.addLine();
  }

  closenessCentrality() {
    this.addHeader("Closeness centrality");
    const graph = this.graphManager.graph;
    const strengths = closenessCentrality(graph);
    for (const key in strengths) {
      this.addInfo(
        `${graph.getNodeAttribute(key, "label")}: ${strengths[key]}`,
      );
    }
    this.addLine();
  }

  degreeCentrality() {
    this.addHeader("Degree centrality");
    const graph = this.graphManager.graph;
    const strengths = degreeCentrality(graph);
    for (const key in strengths) {
      this.addInfo(
        `${graph.getNodeAttribute(key, "label")}: ${strengths[key]}`,
      );
    }
    this.addLine();
  }

  eigenvectorCentrality() {
    this.addHeader("Eigenvector centrality");
    const graph = this.graphManager.graph;
    const strengths = eigenvectorCentrality(graph);
    for (const key in strengths) {
      this.addInfo(
        `${graph.getNodeAttribute(key, "label")}: ${strengths[key]}`,
      );
    }
    this.addLine();
  }

  pagerank() {
    this.addHeader("Pagerank");
    const graph = this.graphManager.graph;
    const strengths = pagerank(graph);
    for (const key in strengths) {
      this.addInfo(
        `${graph.getNodeAttribute(key, "label")}: ${strengths[key]}`,
      );
    }
    this.addLine();
  }

  edgeUniformity() {
    this.addHeader("Edge Uniformity");
    const graph = this.graphManager.graph;
    const strengths = edgeUniformity(graph);
    this.addInfo(strengths);
    this.addLine();
  }

  neighborhoodPreservation() {
    this.addHeader("Neighborhood preservation");
    const graph = this.graphManager.graph;
    const strengths = neighborhoodPreservation(graph);
    this.addInfo(strengths);
    this.addLine();
  }

  stress() {
    this.addHeader("Stress");
    const graph = this.graphManager.graph;
    const strengths = stress(graph);
    this.addInfo(strengths);
    this.addLine();
  }

  disparity() {
    this.addHeader("disparity");
    const graph = this.graphManager.graph;
    const strengths = disparity(graph);
    for (const key in strengths) {
      const [source, target] = graph.getEdgeSourcetarget(key);
      this.addInfo(
        `${graph.getNodeAttribute(source, "label")}, ${graph.getNodeAttribute(target, "label")} : ${strengths[key]}`,
      );
    }
    this.addLine();
  }
}
