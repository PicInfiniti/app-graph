import { GRAPH_SETTINGS } from "./config";
export class GraphRenderer {
  constructor(canvas, graphManager, appSettings) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.graphManager = graphManager;
    this.appSettings = appSettings;
  }

  drawGraph() {
    requestAnimationFrame(() => {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawEdges();
      this.drawNodes();
    });
  }

  drawEdges() {
    const graph = this.graphManager.graph;
    graph.forEachEdge((edge, attr, s, t, source, target) => {
      this.context.beginPath();
      this.context.moveTo(source.x, source.y);
      this.context.lineTo(target.x, target.y);
      this.context.strokeStyle = attr.color || this.appSettings.settings.color;
      this.context.lineWidth = this.appSettings.settings.edge_size;
      this.context.stroke();
      this.context.closePath();
    });
  }

  drawNodes() {
    const graph = this.graphManager.graph;
    graph.forEachNode((node, attr) => {
      this.context.beginPath();
      this.context.arc(attr.x, attr.y, this.appSettings.settings.node_radius, 0, 2 * Math.PI);
      this.context.fillStyle = attr.color || this.appSettings.settings.color;
      this.context.fill();
      this.context.stroke();
      this.context.closePath();

      if (this.appSettings.settings.vertexLabel) {
        this.context.fillStyle = "black";
        this.context.font = `${GRAPH_SETTINGS.LABEL_FONT_SIZE}px sans-serif`;
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(attr.label, attr.x, attr.y);
      }
    });
  }
}
