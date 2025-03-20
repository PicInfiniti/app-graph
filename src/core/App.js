import * as d3 from 'd3';
import { EventBus } from './eventBus.js';
import { Canvas } from './canvas.js';
import { GraphManager } from '../graph/graphManager.js';
import { KeyHandler } from './keyHandler.js';
import AppSettings from './state.js';
import { Menu } from '../ui/menu.js';
import { getAvailableLabel, getMinAvailableNumber } from '../utils/helperFunctions.js';
import { EventHandlers } from './eventHandlers.js';
import { menuData } from '../ui/MenuData.js';
import { Layout } from '../graph/layouts.js';
import { Widget } from '../ui/wedgets.js';

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
    this.selectedNodes = new Set();
    this.selectedEdges = new Set();

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
      ctx.strokeStyle = this.selectedEdges.has(edge) ? "orange" : attr.color;
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
      ctx.strokeStyle = this.selectedNodes.has(attr.id) ? "orange" : attr.color;
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
    if (this.selection.active && !this.appSettings.settings.forceSimulation) {
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
    this.selection.active = true;
  }

  updateSelection(event) {
    if (!this.selection.active) return;

    const [mouseX, mouseY] = d3.pointer(event, this.canvas);
    this.selection.width = mouseX - this.selection.x;
    this.selection.height = mouseY - this.selection.y;
    this.drawGraph();  // Redraw canvas with the selection rectangle
  }

  endSelection() {
    this.selection.active = false;
    this.drawGraph();  // Redraw to remove rectangle
  }

}


