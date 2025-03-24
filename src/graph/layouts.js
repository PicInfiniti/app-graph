import { circular } from "graphology-library/layout";

export class Layout {
  constructor(app) {
    this.app = app
    this.eventBus = app.eventBus
    this.canvas = app.canvas
  }

  init() {

  }

  applyLayout(type, param) {
    switch (type) {
      case 'circle':
        this.organizeNodesInCircle();
        this.eventBus.emit("graph:updated", { type: "layout" })
        break;

      case 'oneLine':
        this.organizeNodesInLine();
        this.eventBus.emit("graph:updated", { type: "layout" })

        break;

      case 'twoLine':
        this.organizeNodesInTwoLines(param.line1Count, param.Y);
        this.eventBus.emit("graph:updated", { type: "layout" })
        break;

      default:
        break;
    }

    // More layouts can be added here
  }
  organizeNodesInCircle() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(centerX * 0.5, centerY * 0.5);
    const positions = circular(this.app.graphManager.graph, { scale: radius, dimensions: ['x', 'y'] });
    this.app.graphManager.updateNodesPostion(positions, { x: centerX, y: centerY })
  }

  organizeNodesInLine() {
    const graph = this.app.graphManager.graph
    const centerY = this.canvas.height / 2; // Middle of the canvas
    const padding = 100; // Space from edges
    const nodeIds = Array.from(graph.nodes()); // Get ordered nodes
    const totalNodes = nodeIds.length;

    if (totalNodes === 0) return; // Avoid errors if no nodes

    const stepX = (this.canvas.width - 2 * padding) / Math.max(1, totalNodes - 1); // Space between nodes

    nodeIds.forEach((id, index) => {
      const x = padding + index * stepX; // Spread across the width

      graph.updateNodeAttributes(id, (attr) => ({
        ...attr,
        x,
        y: centerY, // Align all nodes in the middle
      }));
    });
  }

  organizeNodesInTwoLines(line1Count, Y = 50) {
    const graph = this.app.graphManager.graph
    const centerY = this.canvas.height / 2;
    const paddingX = 100; // Horizontal padding
    const paddingY = Y; // Vertical spacing between lines

    const nodeIds = Array.from(graph.nodes()); // Get all node IDs
    const totalNodes = nodeIds.length;

    if (line1Count > totalNodes) {
      console.error("Line1 count exceeds total nodes.");
      return;
    }

    const line1Ids = nodeIds.slice(0, line1Count); // First N nodes
    const line2Ids = nodeIds.slice(line1Count); // Remaining nodes

    const totalLine1 = line1Ids.length;
    const totalLine2 = line2Ids.length;

    // Compute spacing for each line
    const stepX1 = totalLine1 > 1 ? (this.canvas.width - 2 * paddingX) / (totalLine1 - 1) : 0;
    const stepX2 = totalLine2 > 1 ? (this.canvas.width - 2 * paddingX) / (totalLine2 - 1) : 0;

    const y1 = centerY - paddingY; // Upper line
    const y2 = centerY + paddingY; // Lower line

    // Position nodes in line 1
    line1Ids.forEach((id, index) => {
      const x = paddingX + index * stepX1;
      graph.updateNodeAttributes(id, (attr) => ({
        ...attr,
        x,
        y: y1,
      }));
    });

    // Position nodes in line 2
    line2Ids.forEach((id, index) => {
      const x = paddingX + index * stepX2;
      graph.updateNodeAttributes(id, (attr) => ({
        ...attr,
        x,
        y: y2,
      }));
    });
  }

}
