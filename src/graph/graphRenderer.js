import * as d3 from "d3";

export class GraphRenderer {
  constructor(app) {
    this.app = app;
    this.graphManager = app.graphManager;
    this.mainCanvas = app._canvas._canvas.main;
    this.nodeCanvas = app._canvas._canvas.node;
    this.edgeCanvas = app._canvas._canvas.edge;
    this.faceCanvas = app._canvas._canvas.face;

    this.settings = app.settings;
    this.rect = app.rect;
  }

  drawArrowhead(x, y, angle, size, color, ctx) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x - size * Math.cos(angle - Math.PI / 6),
      y - size * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      x - size * Math.cos(angle + Math.PI / 6),
      y - size * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  drawLabel(ctx, text, x, y, color, font) {
    if (!text?.trim()) return;
    ctx.fillStyle = color || "#000";
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }

  drawFaces(canvas, graph, settings, labelFont, labelOffsetX, labelOffsetY) {
    const ctx = canvas.ctx;
    ctx.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

    graph.forEachFace((_, attr) => {
      const hull = attr.nodes.map((p) => {
        const node = graph.getNodeAttributes(p);
        return [node.x, node.y];
      });

      const centroid = {
        x: d3.mean(hull, (d) => d[0]),
        y: d3.mean(hull, (d) => d[1]),
      };

      if (hull) {
        ctx.fillStyle = attr.selected ? "#FFA50055" : attr.color;
        ctx.beginPath();
        ctx.moveTo(hull[0][0], hull[0][1]);
        for (let i = 1; i < hull.length; i++) {
          ctx.lineTo(hull[i][0], hull[i][1]);
        }
        ctx.closePath();
        ctx.fill();
      }

      if (settings.faceLabel) {
        this.drawLabel(
          ctx,
          attr.label,
          centroid.x,
          centroid.y,
          attr.labelColor,
          labelFont,
        );
      }
    });
  }

  drawEdges(
    canvas,
    graph,
    settings,
    edgeSize,
    nodeRadius,
    labelFont,
    labelOffsetX,
    labelOffsetY,
  ) {
    const ctx = canvas.ctx;
    ctx.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

    graph.forEachEdge((edge, attr, s, t, source, target) => {
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const length = Math.hypot(dx, dy);
      const offsetX = (dx / length) * (12 + edgeSize);
      const offsetY = (dy / length) * (12 + edgeSize);

      const hasReverseEdge = graph.hasEdge(t, s);
      const startX = hasReverseEdge ? source.x + offsetX : source.x;
      const startY = hasReverseEdge ? source.y + offsetY : source.y;
      const endX = target.x - offsetX;
      const endY = target.y - offsetY;

      // Draw edge line
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = attr.selected ? "orange" : attr.color;
      ctx.lineWidth = edgeSize;
      ctx.stroke();
      ctx.closePath();

      // Arrowhead
      if (graph.isDirected(edge)) {
        const angle = Math.atan2(dy, dx);
        const arrowX = target.x - (Math.cos(angle) * nodeRadius) / 4;
        const arrowY = target.y - (Math.sin(angle) * nodeRadius) / 4;
        this.drawArrowhead(
          arrowX,
          arrowY,
          angle,
          14 + edgeSize,
          attr.selected ? "orange" : attr.color,
          ctx,
        );
      }

      // Edge label
      if (
        (settings.edgeLabel || settings.weightLabel) &&
        (attr.label || attr.weight != null)
      ) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const perpX = -dy / length;
        const perpY = dx / length;

        const labelX = midX + perpX * 10 + labelOffsetX;
        const labelY = midY + perpY * 10 + labelOffsetY;

        const labelParts = [];
        if (settings.edgeLabel && attr.label) labelParts.push(attr.label);
        if (settings.weightLabel && attr.weight != null)
          labelParts.push(attr.weight);

        if (labelParts.length) {
          this.drawLabel(
            ctx,
            labelParts.join(", "),
            labelX,
            labelY,
            attr.labelColor,
            labelFont,
          );
        }
      }
    });
  }

  drawNodes(
    canvas,
    graph,
    settings,
    nodeRadius,
    strokeSize,
    labelFont,
    labelOffsetX,
    labelOffsetY,
  ) {
    const ctx = canvas.ctx;
    ctx.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

    graph.forEachNode((node, attr) => {
      ctx.beginPath();
      ctx.arc(attr.x, attr.y, nodeRadius * attr.size, 0, 2 * Math.PI);
      ctx.fillStyle = attr.selected ? "orange" : attr.color;
      ctx.fill();
      if (strokeSize !== 0) {
        ctx.lineWidth = strokeSize;
        ctx.strokeStyle = attr.selected ? "orange" : attr.stroke;
        ctx.stroke();
      }
      ctx.closePath();

      if (settings.vertexLabel) {
        this.drawLabel(
          ctx,
          attr.label,
          attr.x + labelOffsetX,
          attr.y + labelOffsetY,
          attr.labelColor,
          labelFont,
        );
      }
    });
  }

  drawGraph() {
    const graph = this.graphManager.graph;
    const settings = this.settings;
    // Pre-extract commonly used settings
    const edgeSize = +settings.edge_size;
    const labelSize = settings.label_size;
    const labelFont = `${labelSize}px sans-serif`;
    const labelOffsetX = settings.label_pos.x;
    const labelOffsetY = settings.label_pos.y;
    const nodeRadius = settings.node_radius;
    const strokeSize = settings.stroke_size;

    this.drawFaces(
      this.faceCanvas,
      graph,
      settings,
      labelFont,
      labelOffsetX,
      labelOffsetY,
    );
    this.drawEdges(
      this.edgeCanvas,
      graph,
      settings,
      edgeSize,
      nodeRadius,
      labelFont,
      labelOffsetX,
      labelOffsetY,
    );
    this.drawNodes(
      this.nodeCanvas,
      graph,
      settings,
      nodeRadius,
      strokeSize,
      labelFont,
      labelOffsetX,
      labelOffsetY,
    );

    // Redraw selection rectangle
    this.rect.draw();
  }
}
