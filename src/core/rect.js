import * as d3 from "d3";

export class Rect {
  constructor(app, canvas) {
    this.app = app;
    this.settings = app.settings;
    this.canvas = app.canvas;
    this.ctx = app._canvas.ctx;

    this.selection = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      active: false,
    };

    this.mouseDown = false;
    this.scale = {
      isDragging: false,
      active: false,
      activeHandle: null,
      scaleData: {},
      rect: { x: 100, y: 100, width: 200, height: 150 },
      prevMouse: { x: 0, y: 0 },
      offsetX: 0,
      offsetY: 0,
      handleSize: 10,
      handles: ["nw", "n", "ne", "e", "se", "s", "sw", "w"],
      cursorMap: {
        nw: "nwse-resize",
        n: "ns-resize",
        ne: "nesw-resize",
        e: "ew-resize",
        se: "nwse-resize",
        s: "ns-resize",
        sw: "nesw-resize",
        w: "ew-resize",
      },
    };
  }

  init() {
    // Add mouse event listeners for rectangle dragging
    this.canvas.addEventListener("mousedown", this.startSelection.bind(this));
    this.canvas.addEventListener("mousemove", this.updateSelection.bind(this));
    this.canvas.addEventListener("mouseup", this.endSelection.bind(this));
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.settings.select || this.settings.scale) {
      if (this.selection.active) {
        this.drawSelect(this.selection);
      }

      if (this.settings.scale) {
        this.drawScale();
      }
    }
  }

  drawSelect(selection) {
    if (!selection) return;
    const ctx = this.ctx;
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Semi-transparent blue fill
    ctx.fillRect(selection.x, selection.y, selection.width, selection.height);

    ctx.strokeStyle = "rgba(0, 0, 255, 0.7)"; // Blue outline
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // Dashed border effect
    ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
    ctx.setLineDash([]); // Reset line style
  }

  drawScale() {
    if (this.scale.active) {
      this.drawScaleBox(this.scale.rect, this.ctx);
    }
  }

  redraw() {
    if (!this.mouseDown) return;
    if (this.settings.performance)
      this.app.graphManager.needsRedraw = { rect: true };
    else
      this.app.graphManager.needsRedraw = {
        node: true,
        edge: true,
        face: true,
        rect: true,
      };
  }
  // Dragging logic
  startSelection(event) {
    this.mouseDown = true;

    this.redraw();
    if (this.settings.select || this.settings.scale) {
      // selection rect
      const [mouseX, mouseY] = d3.pointer(event, this.canvas);
      this.selection.x = mouseX;
      this.selection.y = mouseY;
      this.selection.width = 0;
      this.selection.height = 0;
      this.selection.active = !this.scale.active;

      //Scale rect
      if (this.settings.scale && this.scale.active) {
        const [mx, my] = d3.pointer(event);
        this.scale.prevMouse = { x: mx, y: my };
        this.scale.activeHandle = this.hitTestHandle(mx, my);

        if (this.scale.activeHandle) return;

        if (
          mx >= this.scale.rect.x &&
          mx <= this.scale.rect.x + this.scale.rect.width &&
          my >= this.scale.rect.y &&
          my <= this.scale.rect.y + this.scale.rect.height
        ) {
          this.scale.isDragging = true;
          this.scale.offsetX = mx - this.scale.rect.x;
          this.scale.offsetY = my - this.scale.rect.y;
        }
      }
    } else {
      this.selection.active = false;
      this.scale.active = false;
    }
  }

  updateSelection(event) {
    if (this.selection.active && !this.scale.active) {
      const [mouseX, mouseY] = d3.pointer(event, this.canvas);
      this.selection.width = mouseX - this.selection.x;
      this.selection.height = mouseY - this.selection.y;

      return;
    }

    if (this.scale.active) {
      const rect = this.scale.rect;
      const selectedNodes = this.app.graphManager.graph.getSelectedNodes();
      const [mx, my] = d3.pointer(event);

      if (this.scale.activeHandle) {
        this.resizeRect(this.scale.activeHandle, mx, my);
        for (let node of selectedNodes) {
          this.app.graphManager.graph.updateNodeAttributes(node, (attr) => {
            return {
              ...attr,
              x: rect.x + rect.width * this.scale.scaleData[node].x,
              y: rect.y + rect.height * this.scale.scaleData[node].y,
            };
          });
        }
        return;
      }

      if (this.scale.isDragging) {
        this.scale.rect.x = mx - this.scale.offsetX;
        this.scale.rect.y = my - this.scale.offsetY;

        const dx = mx - this.scale.prevMouse.x;
        const dy = my - this.scale.prevMouse.y;
        for (let node of selectedNodes) {
          this.app.graphManager.graph.updateNodeAttributes(node, (attr) => {
            return {
              ...attr,
              x: attr.x + dx,
              y: attr.y + dy,
            };
          });
        }
        this.scale.prevMouse = { x: mx, y: my };
        return;
      }

      // Set cursor based on position
      const handle = this.hitTestHandle(mx, my);
      if (handle) {
        this.canvas.style.cursor = this.scale.cursorMap[handle];
      } else if (
        mx >= this.scale.rect.x &&
        mx <= this.scale.rect.x + this.scale.rect.width &&
        my >= this.scale.rect.y &&
        my <= this.scale.rect.y + this.scale.rect.height
      ) {
        this.canvas.style.cursor = "move";
      } else {
        this.canvas.style.cursor = "default";
      }

      this.redraw();
    }
  }

  endSelection(event) {
    this.mouseDown = false;
    this.selection.active = false;
    this.scale.isDragging = false;
    this.scale.activeHandle = null;

    const selectedNodes = this.pointsInRect(this.selection);
    selectedNodes.forEach((node) => {
      this.app.graphManager.graph.toggleNodeSelection(node);
    });

    const selectedEdges = this.linesInRect(this.selection);
    selectedEdges.forEach((edge) => {
      this.app.graphManager.graph.toggleEdgeSelection(edge);
    });

    const SELECTED = this.app.graphManager.graph.getSelectedNodes();
    if (this.settings.scale && SELECTED.length > 0 && !this.scale.active) {
      this.scale.active = true;
      this.scale.rect = getBoundingBox(
        this.app.graphManager.graph,
        SELECTED,
        this.settings.node_radius,
      );
      this.scaleData = {};
      SELECTED.forEach((nodeId) => {
        const node = this.app.graphManager.graph.getNodeAttributes(nodeId);
        this.scale.scaleData[nodeId] = {
          id: nodeId,
          x: (node.x - this.scale.rect.x) / this.scale.rect.width,
          y: (node.y - this.scale.rect.y) / this.scale.rect.height,
        };
      });
    }
    this.app.graphManager.saveGraphState();
  }

  pointsInRect(selection) {
    const [x1, y1, x2, y2] = getRectAxis(selection);
    return this.app.graphManager.graph.filterNodes((node, attrs) =>
      pointInRect(attrs.x, attrs.y, x1, y1, x2, y2),
    );
  }

  linesInRect(selection) {
    const rect = getRectAxis(selection);
    return this.app.graphManager.graph.filterEdges(
      (edge, attr, s, t, source, target) =>
        this.lineIntersectsRect([source.x, source.y, target.x, target.y], rect),
    );
  }

  lineIntersectsRect(line, rect) {
    let [x1, y1, x2, y2] = line; // Line segment coordinates
    let [a, b, c, d] = rect; // Rectangle properties
    const treshHold = this.settings.node_radius / 2 + 20;
    // Check if the line intersects any of the rectangle's edges
    if (lineIntersectsLine([x1, y1, x2, y2], [a, b, c, d])) return true;
    if (lineIntersectsLine([x1, y1, x2, y2], [a, d, c, b])) return true;
    if (
      pointInRect(
        x1,
        y1,
        a + treshHold,
        b + treshHold,
        c - treshHold,
        d - treshHold,
      )
    )
      return true;
    if (
      pointInRect(
        x2,
        y2,
        a + treshHold,
        b + treshHold,
        c - treshHold,
        d - treshHold,
      )
    )
      return true;

    return false; // No intersection
  }

  drawScaleBox(rect, ctx) {
    if (!rect) return;
    // Draw main rect
    ctx.fillStyle = "#cce5ff20";
    ctx.strokeStyle = "#3399ff";
    ctx.lineWidth = 2;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    // Draw handles
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    this.scale.handles.forEach((dir) => {
      const [hx, hy] = this.getHandlePosition(dir);
      ctx.fillRect(hx, hy, this.scale.handleSize, this.scale.handleSize);
      ctx.strokeRect(hx, hy, this.scale.handleSize, this.scale.handleSize);
    });
  }

  getHandlePosition(dir) {
    const { x, y, width: w, height: h } = this.scale.rect;
    const s = this.scale.handleSize / 2;
    switch (dir) {
      case "nw":
        return [x - s, y - s];
      case "n":
        return [x + w / 2 - s, y - s];
      case "ne":
        return [x + w - s, y - s];
      case "e":
        return [x + w - s, y + h / 2 - s];
      case "se":
        return [x + w - s, y + h - s];
      case "s":
        return [x + w / 2 - s, y + h - s];
      case "sw":
        return [x - s, y + h - s];
      case "w":
        return [x - s, y + h / 2 - s];
    }
  }

  hitTestHandle(mx, my) {
    return this.scale.handles.find((dir) => {
      const [hx, hy] = this.getHandlePosition(dir);
      return (
        mx >= hx &&
        mx <= hx + this.scale.handleSize &&
        my >= hy &&
        my <= hy + this.scale.handleSize
      );
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
  const [a, b, c, d] = line1;
  const [p, q, r, s] = line2;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  }
}

function getBoundingBox(graph, nodeIds, node_radius) {
  if (!nodeIds.length) return null;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  nodeIds.forEach((id) => {
    const n = graph.getNodeAttributes(id);
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x > maxX) maxX = n.x;
    if (n.y > maxY) maxY = n.y;
  });

  const treshHold = node_radius * 1.5;

  return {
    x: minX - treshHold,
    y: minY - treshHold,
    width: maxX - minX + 2 * treshHold,
    height: maxY - minY + 2 * treshHold,
  };
}
