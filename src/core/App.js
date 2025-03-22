import * as d3 from 'd3';
import { EventBus } from './eventBus.js';
import { Canvas } from './canvas.js';
import { GraphManager } from '../graph/graphManager.js';
import { KeyHandler } from './keyHandler.js';
import AppSettings from './state.js';
import { Menu } from '../ui/menu.js';
import { getAvailableLabel } from '../utils/helperFunctions.js';
import { EventHandlers } from './eventHandlers.js';
import { menuData } from '../ui/MenuData.js';
import { Layout } from '../graph/layouts.js';
import { Widget } from '../ui/wedgets.js';
import { edge } from 'graphology-metrics';
export class App {
  constructor() {
    this.eventBus = EventBus;
    this.appSettings = new AppSettings(this);
    this.settings = this.appSettings.settings;
    this._canvas = new Canvas(this);
    this.canvas = this._canvas.canvas
    this.layout = new Layout(this)
    this.graphManager = new GraphManager(this, 100);  // Handles graph logic
    this.menu = new Menu(this, menuData)
    this.widget = new Widget(this)
    this.keyHandler = new KeyHandler(this);  // Handle global keyboard shortcuts
    this.eventHanders = new EventHandlers(this)

    this.simulation = null;
    this.nodes = [];
    this.links = [];

    // Rectangle properties
    this.selection = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      active: false
    };

    this.init()
  }

  init() {
    this.menu.init()
    this.appSettings.init();
    this.widget.init();
    this._canvas.init();
    this.keyHandler.init();  // Handle global keyboard shortcuts
    this.eventHanders.init();
    this.initSimulation()
    this.loadInitialGraph();
  }

  initSimulation() {
    this.nodes = this.graphManager.graph.getNodesForD3();
    this.links = this.graphManager.graph.getEdgesForD3();

    this.simulation = d3.forceSimulation(this.nodes)
      .force("link", d3.forceLink(this.links)
        .id(d => d.id)
        .distance(10)       // Increased link distance
        .strength(0.5))      // Moderate link strength
      .force("charge", d3.forceManyBody()
        .strength(-300))     // Stronger negative value for repulsion
      .force("collide", d3.forceCollide(20)) // Prevents node overlap
      .force("center", d3.forceCenter(this.canvas.width / 2, this.canvas.height / 2))
      .force("x", d3.forceX(this.canvas.width / 2).strength(0.05))  // Gentle attraction to center
      .force("y", d3.forceY(this.canvas.height / 1).strength(0.05)) // Gentle attraction to center
      .velocityDecay(0.3)     // Slower decay for smoother stabilization
      .alphaDecay(0.02)       // Slower cooling, better final spread
      .on("tick", this.ticked.bind(this))

    if (!this.appSettings.settings.forceSimulation) {
      this.simulation.stop()
    }
  }

  loadInitialGraph() {
    this.graphManager.generator.ladder(10);
    this.layout.applyLayout('circle')
  }

  drawGraph() {
    const graph = this.graphManager.graph
    const canvas = this.canvas
    const settings = this.appSettings.settings

    const ctx = this._canvas.ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save(); // Save original state
    ctx.translate(this._canvas.panning.xOffset, this._canvas.panning.yOffset); // Apply translation
    // Draw edges
    graph.forEachEdge((edge, attr, s, t, source, target) => {
      if (!attr.color) {
        graph.setEdgeAttribute(edge, "color", settings.color)
      }
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = attr.selected ? "orange" : attr.color;
      ctx.lineWidth = settings.edge_size;
      ctx.stroke();
      ctx.closePath();
    });

    // Draw nodes
    graph.forEachNode((node, attr) => {
      if (!attr.label) {
        const newLabel = getAvailableLabel(node);
        graph.setNodeAttribute(node, "label", newLabel)
      }
      if (!attr.color) {
        graph.setNodeAttribute(node, "color", settings.color)
      }

      ctx.beginPath();
      ctx.arc(attr.x, attr.y, settings.node_radius, 0, 2 * Math.PI);
      ctx.fillStyle = settings.vertexLabel ? "white" : attr.color;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = attr.selected ? "orange" : attr.color;
      ctx.stroke();
      ctx.closePath();

      if (settings.vertexLabel) {
        ctx.fillStyle = "black";
        ctx.font = `${settings.label_size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(attr.label, attr.x, attr.y);
      }
    });

    ctx.restore()

    if (this.settings.select) {
      this.drawRectangles(ctx);  // Redraw to remove rectangle
    };

  }

  ticked() {
    // Draw nodes
    this.nodes.forEach((d) => {
      this.graphManager.graph.updateNodeAttributes(d.id, attr => {
        return {
          ...attr,
          x: d.x,
          y: d.y
        };
      });
    });
    EventBus.emit('graph:updated', { type: 'tick' })
  }

  startSimulation() {
    this.simulation.alpha(.3).restart(); // Reheat simulation after updates
  }

  stopSimulation() {
    this.simulation.stop();
  }

  updateSimulation() {
    this.nodes.length = 0;
    this.nodes = this.graphManager.graph.getNodesForD3()

    this.links.length = 0;
    this.links = this.graphManager.graph.getEdgesForD3()

    this.simulation.nodes(this.nodes);
    this.simulation.force("link").links(this.links);
    if (this.appSettings.settings.forceSimulation) {
      this.startSimulation()
    } else {
      this.stopSimulation()
    }
  }

  updateForce() {
    const graph = this.graphManager.graph

    this.nodes.length = 0
    graph.forEachNode((node, attr) => {
      this.nodes.push(
        {
          id: Number(node),
          x: attr.x,
          y: attr.y
        }
      )
    })

    this.links.length = 0
    graph.forEachEdge(function (edge, attr, s, t, source, target) {
      this.links.push(
        {
          source: Number(s),
          target: Number(t)
        }
      )
    })
  }

  drawRectangles(ctx) {
    if (this.selection.active) {
      ctx.fillStyle = "rgba(0, 0, 255, 0.1)"; // Semi-transparent blue fill
      ctx.fillRect(
        this.selection.x,
        this.selection.y,
        this.selection.width,
        this.selection.height
      );

      ctx.strokeStyle = "rgba(0, 0, 255, 0.7)"; // Blue outline
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]); // Dashed border effect
      ctx.strokeRect(
        this.selection.x,
        this.selection.y,
        this.selection.width,
        this.selection.height
      );
      ctx.setLineDash([]); // Reset line style
    }
  }

  // Dragging logic

  startSelection(event) {
    const [mouseX, mouseY] = d3.pointer(event, this.canvas);
    this.selection.x = mouseX;
    this.selection.y = mouseY;
    this.selection.width = 0;
    this.selection.height = 0;
    this.selection.active = this.settings.select;
  }

  updateSelection(event) {
    if (!this.selection.active) return;

    const [mouseX, mouseY] = d3.pointer(event, this.canvas);
    this.selection.width = mouseX - this.selection.x;
    this.selection.height = mouseY - this.selection.y;
    this.drawGraph()
  }


  endSelection(event) {
    this.selection.active = false;
    const selectedNodes = this.pointsInRect();
    const selectedEdges = this.linesInRect();

    selectedNodes.forEach(node => {
      this.graphManager.graph.toggleNodeSelection(node);
    });
    selectedEdges.forEach(edge => {
      this.graphManager.graph.toggleEdgeSelection(edge);
    });

    this.drawGraph();
  }

  pointsInRect() {
    const [x1, y1, x2, y2] = getRectAxis(this.selection);
    return this.graphManager.graph.filterNodes(
      (node, attrs) => attrs.x >= x1 && attrs.x <= x2 && attrs.y >= y1 && attrs.y <= y2);
  }

  linesInRect() {
    const rect = getRectAxis(this.selection);
    return this.graphManager.graph.filterEdges(
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


