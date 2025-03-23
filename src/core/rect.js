import * as d3 from 'd3';
export class Rect {
  constructor(app, canvas) {
    this.app = app
    this.settings = app.settings
    this.canvas = app.canvas
    this.ctx = app._canvas.ctx

  }
  init() {
    // Add mouse event listeners for rectangle dragging
    this.canvas.addEventListener("mousedown", (event) => this.startSelection(event));
    this.canvas.addEventListener("mousemove", (event) => this.updateSelection(event));
    this.canvas.addEventListener("mouseup", () => this.endSelection());
  }

  draw() {
    const ctx = this.ctx
    const selection = this.app.selection
    if (selection.active) {
      ctx.fillStyle = "rgba(0, 0, 255, 0.1)"; // Semi-transparent blue fill
      ctx.fillRect(
        selection.x,
        selection.y,
        selection.width,
        selection.height
      );

      ctx.strokeStyle = "rgba(0, 0, 255, 0.7)"; // Blue outline
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]); // Dashed border effect
      ctx.strokeRect(
        selection.x,
        selection.y,
        selection.width,
        selection.height
      );
      ctx.setLineDash([]); // Reset line style
    }
  }


  // Dragging logic
  startSelection(event) {
    const selection = this.app.selection
    const [mouseX, mouseY] = d3.pointer(event, this.canvas);
    selection.x = mouseX;
    selection.y = mouseY;
    selection.width = 0;
    selection.height = 0;
    selection.active = this.settings.select;
  }

  updateSelection(event) {
    const selection = this.app.selection

    if (!selection.active) return;

    const [mouseX, mouseY] = d3.pointer(event, this.canvas);
    selection.width = mouseX - selection.x;
    selection.height = mouseY - selection.y;
    this.app.drawGraph()
  }


  endSelection(event) {
    const selection = this.app.selection

    selection.active = false;
    const selectedNodes = this.pointsInRect(selection);
    const selectedEdges = this.linesInRect();

    selectedNodes.forEach(node => {
      this.app.graphManager.graph.toggleNodeSelection(node);
    });
    selectedEdges.forEach(edge => {
      this.app.graphManager.graph.toggleEdgeSelection(edge);
    });

    this.app.drawGraph();
  }

  pointsInRect(selection) {
    const [x1, y1, x2, y2] = getRectAxis(selection);
    return this.app.graphManager.graph.filterNodes(
      (node, attrs) => attrs.x >= x1 && attrs.x <= x2 && attrs.y >= y1 && attrs.y <= y2);
  }

  linesInRect() {
    const selection = this.app.selection
    const rect = getRectAxis(selection);
    return this.app.graphManager.graph.filterEdges(
      (edge, attr, s, t, source, target) => this.lineIntersectsRect([source.x, source.y, target.x, target.y], rect))
  }

  lineIntersectsRect(line, rect) {
    let [x1, y1, x2, y2] = line;  // Line segment coordinates
    let [a, b, c, d] = rect;  // Rectangle properties
    const treshHold = this.settings.node_radius + 5
    // Check if the line intersects any of the rectangle's edges
    if (lineIntersectsLine([x1, y1, x2, y2], [a, b, c, d])) return true
    if (lineIntersectsLine([x1, y1, x2, y2], [a, d, c, b])) return true
    if (x1 >= a + treshHold && x1 <= c - treshHold && y1 >= b + treshHold && y1 <= d - treshHold) return true
    if (x2 >= a + treshHold && x2 <= c - treshHold && y2 >= b + treshHold && y2 <= d - treshHold) return true

    return false;  // No intersection
  }
}


// Helper functios

function getRectAxis(sel) {
  const x1 = Math.min(sel.x, sel.x + sel.width);
  const y1 = Math.min(sel.y, sel.y + sel.height);
  const x2 = Math.max(sel.x, sel.x + sel.width);
  const y2 = Math.max(sel.y, sel.y + sel.height);

  return [x1, y1, x2, y2];
}

// returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function lineIntersectsLine(line1, line2) {
  var det, gamma, lambda;
  const [a, b, c, d] = line1
  const [p, q, r, s] = line2
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};


