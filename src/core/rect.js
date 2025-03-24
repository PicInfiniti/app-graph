import * as d3 from 'd3';
import { graph } from 'graphology-library/metrics';
export class Rect {
  constructor(app, canvas) {
    this.app = app
    this.settings = app.settings
    this.canvas = app.canvas
    this.ctx = app._canvas.ctx

    this.scale = {
      isDragging: false,
      activeHandle: null,
      scaleData: {},
      rect: { x: 200, y: 150, width: 200, height: 150 },
      prevMouse: { x: 0, y: 0 },
      offsetX: 0,
      offsetY: 0,
      handleSize: 10,
      handles: ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'],
      cursorMap: {
        'nw': 'nwse-resize',
        'n': 'ns-resize',
        'ne': 'nesw-resize',
        'e': 'ew-resize',
        'se': 'nwse-resize',
        's': 'ns-resize',
        'sw': 'nesw-resize',
        'w': 'ew-resize',
      }
    }

  }
  init() {
    // Add mouse event listeners for rectangle dragging
    this.canvas.addEventListener("mousedown", (event) => this.startSelection(event));
    this.canvas.addEventListener("mousemove", (event) => this.updateSelection(event));
    this.canvas.addEventListener("mouseup", () => this.endSelection());
    d3.select(this.canvas)
      .on("mousedown", this.onMouseDown.bind(this))
      .on("mousemove", this.onMouseMove.bind(this))
      .on("mouseup", this.onMouseUp.bind(this));
    this.app.drawGraph()
  }

  draw() {
    const selection = this.app.selection
    if (this.settings.select || this.settings.scale) {
      if (selection.active) {
        // this.drawSelect(this.app.selection)
      }

      if (this.settings.scale) {
        this.drawScale()
      }
    }
  }

  drawSelect(selection) {
    if (!selection) return
    const ctx = this.ctx
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Semi-transparent blue fill
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

  drawScale() {
    const graph = this.app.graphManager.graph;
    const selectedNodes = graph.getSelectedNodes()
    const rect = getBoundingBox(graph, selectedNodes, this.settings.node_radius);

    this.drawScaleBox(this.scale.rect, this.ctx)
  }

  // Dragging logic
  startSelection(event) {
    const selection = this.app.selection
    const [mouseX, mouseY] = d3.pointer(event, this.canvas);
    selection.x = mouseX;
    selection.y = mouseY;
    selection.width = 0;
    selection.height = 0;
    selection.active = this.settings.select || this.settings.scale;
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
    selectedNodes.forEach(node => {
      this.app.graphManager.graph.toggleNodeSelection(node);
    });

    const selectedEdges = this.linesInRect();
    selectedEdges.forEach(edge => {
      this.app.graphManager.graph.toggleEdgeSelection(edge);
    });

    this.app.drawGraph();
  }

  pointsInRect(selection) {
    const [x1, y1, x2, y2] = getRectAxis(selection);
    return this.app.graphManager.graph.filterNodes(
      (node, attrs) => pointInRect(attrs.x, attrs.y, x1, y1, x2, y2));
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

  drawScaleBox(rect, ctx) {
    if (!rect) return;

    // Draw main rect
    ctx.fillStyle = "#cce5ff";
    ctx.strokeStyle = "#3399ff";
    ctx.lineWidth = 2;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    // Draw handles
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    this.scale.handles.forEach(dir => {
      const [hx, hy] = this.getHandlePosition(dir);
      ctx.fillRect(hx, hy, this.scale.handleSize, this.scale.handleSize);
      ctx.strokeRect(hx, hy, this.scale.handleSize, this.scale.handleSize);
    });
  }
  getHandlePosition(dir) {
    const { x, y, width: w, height: h } = this.scale.rect;
    const s = this.scale.handleSize / 2;
    switch (dir) {
      case 'nw': return [x - s, y - s];
      case 'n': return [x + w / 2 - s, y - s];
      case 'ne': return [x + w - s, y - s];
      case 'e': return [x + w - s, y + h / 2 - s];
      case 'se': return [x + w - s, y + h - s];
      case 's': return [x + w / 2 - s, y + h - s];
      case 'sw': return [x - s, y + h - s];
      case 'w': return [x - s, y + h / 2 - s];
    }
  }

  onMouseDown(event) {
    const [mx, my] = d3.pointer(event);
    this.scale.prevMouse = { x: mx, y: my };
    this.scale.activeHandle = this.hitTestHandle(mx, my);

    if (this.scale.activeHandle) return;

    if (
      mx >= this.scale.rect.x && mx <= this.scale.rect.x + this.scale.rect.width &&
      my >= this.scale.rect.y && my <= this.scale.rect.y + this.scale.rect.height
    ) {
      this.scale.isDragging = true;
      this.scale.offsetX = mx - this.scale.rect.x;
      this.scale.offsetY = my - this.scale.rect.y;
    }
  }


  onMouseMove(event) {
    const [mx, my] = d3.pointer(event);

    if (this.scale.activeHandle) {
      this.resizeRect(this.scale.activeHandle, mx, my);
      this.draw();
      return;
    }

    if (this.scale.isDragging) {
      this.scale.rect.x = mx - this.scale.offsetX;
      this.scale.rect.y = my - this.scale.offsetY;
      this.draw();
      return;
    }

    // Set cursor based on position
    const handle = this.hitTestHandle(mx, my);
    if (handle) {
      this.canvas.style.cursor = this.scale.cursorMap[handle];
    } else if (
      mx >= this.scale.rect.x && mx <= this.scale.rect.x + this.scale.rect.width &&
      my >= this.scale.rect.y && my <= this.scale.rect.y + this.scale.rect.height
    ) {
      this.canvas.style.cursor = 'move';
    } else {
      this.canvas.style.cursor = 'default';
    }
  }

  onMouseUp() {
    this.scale.isDragging = false;
    this.scale.activeHandle = null;
  }

  hitTestHandle(mx, my) {
    return this.scale.handles.find(dir => {
      const [hx, hy] = this.getHandlePosition(dir);
      return mx >= hx && mx <= hx + this.scale.handleSize && my >= hy && my <= hy + this.scale.handleSize;
    });
  }


  resizeRect(handle, mx, my) {
    const minSize = 20;
    const dx = mx - this.scale.prevMouse.x;
    const dy = my - this.scale.prevMouse.y;

    let { x, y, width, height } = this.scale.rect;

    switch (handle) {
      case "nw":
        x += dx;
        y += dy;
        width -= dx;
        height -= dy;
        break;
      case "n":
        y += dy;
        height -= dy;
        break;
      case "ne":
        y += dy;
        width += dx;
        height -= dy;
        break;
      case "e":
        width += dx;
        break;
      case "se":
        width += dx;
        height += dy;
        break;
      case "s":
        height += dy;
        break;
      case "sw":
        x += dx;
        width -= dx;
        height += dy;
        break;
      case "w":
        x += dx;
        width -= dx;
        break;
    }

    // Adjust if width is below minimum
    if (width < minSize) {
      const diff = minSize - width;
      if (handle.includes("w")) {
        x -= diff;
      }
      width = minSize;
    }

    // Adjust if height is below minimum
    if (height < minSize) {
      const diff = minSize - height;
      if (handle.includes("n")) {
        y -= diff;
      }
      height = minSize;
    }

    // Update rect and prevMouse
    this.scale.rect.x = x;
    this.scale.rect.y = y;
    this.scale.rect.width = width;
    this.scale.rect.height = height;

    this.scale.prevMouse = { x: mx, y: my };
  }
}

function pointInRect(x, y, x1, y1, x2, y2) {
  return x >= x1 && x <= x2 && y >= y1 && y <= y2;
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

// ----- Bounding Box -----
function salma() {
  const rect = getBoundingBox(History.graph, selectedNode);
  if (!rect) return;
  common.rect = rect;
  common.scaleData = {};
  selectedNode.forEach((id) => {
    const n = History.graph.getNodeAttributes(id);
    common.scaleData[id] = {
      x: (n.x - rect.x) / rect.width,
      y: (n.y - rect.y) / rect.height,
    };
  });
  update(rect);
}


function getHandles(rect, size) {
  const half = size / 2;
  return [
    { x: rect.x - half, y: rect.y - half, action: "top-left" },
    { x: rect.x + rect.width / 2 - half, y: rect.y - half, action: "top" },
    { x: rect.x + rect.width - half, y: rect.y - half, action: "top-right" },
    { x: rect.x + rect.width - half, y: rect.y + rect.height / 2 - half, action: "right" },
    { x: rect.x + rect.width - half, y: rect.y + rect.height - half, action: "bottom-right" },
    { x: rect.x + rect.width / 2 - half, y: rect.y + rect.height - half, action: "bottom" },
    { x: rect.x - half, y: rect.y + rect.height - half, action: "bottom-left" },
    { x: rect.x - half, y: rect.y + rect.height / 2 - half, action: "left" }
  ];
}

// ----- Box Resize -----
function resizeBox(action, dx, dy) {
  const rect = common.rect;
  const minSize = 10;
  switch (action) {
    case "top-left": rect.x += dx; rect.y += dy; rect.width -= dx; rect.height -= dy; break;
    case "top": rect.y += dy; rect.height -= dy; break;
    case "top-right": rect.y += dy; rect.width += dx; rect.height -= dy; break;
    case "right": rect.width += dx; break;
    case "bottom-right": rect.width += dx; rect.height += dy; break;
    case "bottom": rect.height += dy; break;
    case "bottom-left": rect.x += dx; rect.width -= dx; rect.height += dy; break;
    case "left": rect.x += dx; rect.width -= dx; break;
  }
  rect.width = Math.max(minSize, rect.width);
  rect.height = Math.max(minSize, rect.height);
}


function getBoundingBox(graph, nodeIds, node_radius) {
  if (!nodeIds.length) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  nodeIds.forEach(id => {
    const n = graph.getNodeAttributes(id);
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x > maxX) maxX = n.x;
    if (n.y > maxY) maxY = n.y;
  });

  const treshHold = node_radius * 1.5

  return {
    x: minX - treshHold, y: minY - treshHold,
    width: maxX - minX + 2 * treshHold,
    height: maxY - minY + 2 * treshHold
  };
}

function update(rect) {
  moveNodes(selectedNode, rect);
}

function moveNodes(nodes, rect) {
  nodes.forEach(id => {
    History.graph.updateNodeAttributes(id, () => ({
      x: rect.x + rect.width * common.scaleData[id].x,
      y: rect.y + rect.height * common.scaleData[id].y,
    }));
  });
}
