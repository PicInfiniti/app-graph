import * as d3 from "d3";
import { collectLayout, assignLayout } from "graphology-layout/utils";
import {
  circular,
  random as _random,
  rotation,
} from "graphology-library/layout";
import forceAtlas2 from "graphology-layout-forceatlas2";
import noverlap from "graphology-layout-noverlap";

export class Layout {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.canvas = app.canvas;
  }

  init() {}

  applyLayout(type, param) {
    let layoutApplied = true;
    switch (type) {
      case "force":
        this.force();
        break;

      case "noverlap":
        this.noverlap();
        break;

      case "rotate180":
        this.rotate180();
        break;

      case "rotate":
        this.rotate(param);
        break;

      case "h-flip":
        this.hFlip();
        break;

      case "v-flip":
        this.vFlip();
        break;

      case "center":
        this.center();
        break;

      case "random":
        this.random();
        break;

      case "circle":
        this.organizeNodesInCircle();
        break;

      case "oneLine":
        this.organizeNodesInLine();

        break;

      case "twoLine":
        this.organizeNodesInTwoLines(param.line1Count, param.Y);
        break;

      default:
        layoutApplied = false;
        break;
    }

    if (layoutApplied) this.app.graphManager.saveGraphState();
  }

  noverlap() {
    const graph = this.app.graphManager.graph;
    const positions = noverlap(graph, {
      maxIterations: 50,
      settings: {
        ratio: 100,
        expansion: 1.5,
        gridSize: 5,
      },
    });
    this.center(positions);
  }

  force() {
    const graph = this.app.graphManager.graph;
    const positions = forceAtlas2(graph, {
      iterations: 5,
      settings: {
        gravity: 10,
        scalingRatio: 100,
      },
    });

    this.center(positions);
  }

  hFlip() {
    const centerX = this.canvas.width / 2;
    const graph = this.app.graphManager.graph;
    const positions = collectLayout(graph);

    Object.values(positions).forEach((node) => {
      const dx = centerX - node.x;
      node.x += 2 * dx;
    });

    assignLayout(graph, positions);
  }

  vFlip() {
    const centerY = this.canvas.height / 2;
    const graph = this.app.graphManager.graph;
    const positions = collectLayout(graph);

    Object.values(positions).forEach((node) => {
      const dy = centerY - node.y;
      node.y += 2 * dy;
    });

    assignLayout(graph, positions);
  }

  rotate(degree = 90) {
    const graph = this.app.graphManager.graph;
    const radians = (degree * Math.PI) / -180;

    const positions = rotation(graph, radians);
    this.center(positions);
  }

  center(positions = undefined) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    const graph = this.app.graphManager.graph;
    if (!positions) positions = collectLayout(graph);

    const centroid = {
      x: d3.mean(Object.values(positions), (d) => d.x),
      y: d3.mean(Object.values(positions), (d) => d.y),
    };

    const dx = centerX - centroid.x;
    const dy = centerY - centroid.y;
    Object.values(positions).forEach((node) => {
      node.x += dx;
      node.y += dy;
    });

    assignLayout(graph, positions);
  }

  random() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const graph = this.app.graphManager.graph;
    const positions = _random(graph, {
      scale: Math.max(centerX, centerY) - 200,
    });

    this.center(positions);
  }

  organizeNodesInCircle() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    const graph = this.app.graphManager.graph;

    const radius = Math.min(centerX * 0.5, centerY * 0.5);

    const positions = circular(graph, {
      scale: radius,
      dimensions: ["x", "y"],
    });

    Object.values(positions).forEach((node) => {
      node.x += centerX;
      node.y += centerY;
    });

    assignLayout(graph, positions);
  }

  organizeNodesInLine() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const padding = centerX * 0.1; // Space from edges

    const graph = this.app.graphManager.graph;
    const nodeIds = this.app.graphManager.graph.nodes(); // Get ordered nodes
    const positions = {};

    if (graph.order === 0) return; // Avoid errors if no nodes

    const stepX =
      (this.canvas.width - 2 * padding) / Math.max(1, graph.order - 1); // Space between nodes

    nodeIds.forEach((node, index) => {
      positions[node] = { x: padding + index * stepX, y: centerY };
    });

    assignLayout(graph, positions);
  }

  organizeNodesInTwoLines(line1Count, Y = 50) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const paddingX = centerX * 0.1; // Horizontal padding
    const paddingY = Y; // Vertical spacing between lines

    const graph = this.app.graphManager.graph;
    const nodeIds = this.app.graphManager.graph.nodes(); // Get ordered nodes
    const positions = {};

    if (graph.order === 0) return; // Avoid errors if no nodes

    if (line1Count > graph.order) {
      console.error("Line1 count exceeds total nodes.");
      return;
    }

    const line1Ids = nodeIds.slice(0, line1Count); // First N nodes
    const line2Ids = nodeIds.slice(line1Count); // Remaining nodes

    const totalLine1 = line1Ids.length;
    const totalLine2 = line2Ids.length;

    // Compute spacing for each line
    const stepX1 =
      totalLine1 > 1
        ? (this.canvas.width - 2 * paddingX) / (totalLine1 - 1)
        : 0;
    const stepX2 =
      totalLine2 > 1
        ? (this.canvas.width - 2 * paddingX) / (totalLine2 - 1)
        : 0;

    const y1 = centerY - paddingY; // Upper line
    const y2 = centerY + paddingY; // Lower line

    // Position nodes in line 1
    line1Ids.forEach((node, index) => {
      positions[node] = {
        x: paddingX + index * stepX1,
        y: y1,
      };
    });

    // Position nodes in line 2
    line2Ids.forEach((node, index) => {
      positions[node] = {
        x: paddingX + index * stepX2,
        y: y2,
      };
    });

    assignLayout(graph, positions);
  }

  rotate180() {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const padding = canvasWidth * 0.15;

    const graph = this.app.graphManager.graph;
    const nodeIds = graph.nodes();
    const positions = {};

    if (graph.order === 0) return;

    // Get bounding box of the current layout
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    nodeIds.forEach((id) => {
      const { x, y } = graph.getNodeAttributes(id);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    });

    const layoutWidth = maxX - minX;
    const layoutHeight = maxY - minY;

    // Calculate scaling factor to fit layout inside canvas with padding
    const scaleX = (canvasWidth - 2 * padding) / layoutWidth;
    const scaleY = (canvasHeight - 2 * padding) / layoutHeight;
    const scale = Math.min(scaleX, scaleY);

    // Calculate center offset
    const offsetX = (canvasWidth - layoutWidth * scale) / 2;
    const offsetY = (canvasHeight - layoutHeight * scale) / 2;

    // Apply scaling and centering
    graph.forEachNode((node, attr) => {
      const newX = canvasWidth - ((attr.x - minX) * scale + offsetX);
      const newY = canvasHeight - ((attr.y - minY) * scale + offsetY);

      positions[node] = {
        x: newX,
        y: newY,
      };
    });

    assignLayout(graph, positions);
  }
}
