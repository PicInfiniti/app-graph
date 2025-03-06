import * as d3 from 'd3';
import { EventBus } from './eventBus.js';
import { GraphManager } from '../graph/graphManager.js';
import { KeyHandler } from './keyHandler.js';
import AppSettings from './state.js';
import { createMenu } from '../ui/menu.js';
import { getAvailableLabel, getMinAvailableNumber } from '../utils/helperFunctions.js';


export class App {
  constructor() {
    this.graphManager = new GraphManager();  // Handles graph logic
    this.canvas = d3.select("#chart").node();
    this.appSettings = new AppSettings(EventBus);
    this.simulation = null;
    this.nodes = [];
    this.links = [];
    this.init()
  }

  init() {
    createMenu()
    this.appSettings.init()
    this.initCanvas();
    KeyHandler.init();  // Handle global keyboard shortcuts
    this.loadInitialGraph();
    this.setupEventListeners();
    this.initSimulation()


    d3.select(this.canvas)
      .call(
        d3.drag()
          .container(this.canvas)
          .subject(this.dragsubject.bind(this))  // 👈 Bind this
          .on("start", this.dragstarted.bind(this))
          .on("drag", this.dragged.bind(this))
          .on("end", this.dragended.bind(this))
      );
  }

  addNodeAtEvent(event) {
    event.preventDefault();

    let [x, y] = d3.pointer(event, this.canvas);
    const newID = getMinAvailableNumber(this.graphManager.graph.nodes());
    const newLabel = getAvailableLabel(newID);
    this.graphManager.graph.addNode(newID, { x, y, color: this.appSettings.settings.color, label: newLabel });
    EventBus.emit('graph:updated')
    this.nodes.push({ id: newID, x: x, y: y })
  }

  initCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.addEventListener("dblclick", (event) => {
      this.addNodeAtEvent(event)
    });
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
    EventBus.on('settingToggled', (event) => {
      const { key, value } = event.detail
      if (key == 'forceSimulation' && value) {
        this.startSimulation()
      } else {
        this.stopSimulation()
      }
    })
  }

  loadInitialGraph() {
    this.graphManager.applyLayout('circle', this.canvas)
    this.drawGraph();  // Visualize the graph
  }

  setupEventListeners() {
    // When layout changes (e.g., user selects new layout from UI)
    EventBus.on('layout:changed', (event) => {
      const { layoutType } = event.detail;
      this.graphManager.applyLayout(layoutType);
      EventBus.emit('graph:updated', { graph: this.graphManager.getGraph() });
    });

    // When graph data updates, re-render visualization
    EventBus.on('graph:updated', (event) => {
      this.drawGraph();  // Visualize the graph
    });

    // Toggle simulation based on UI interactions
    EventBus.on('simulation:toggled', (event) => {
      event.detail.running ? this.startSimulation() : this.stopSimulation();
    });

    // Example: Key event to toggle simulation
    EventBus.on('key:pressed', (event) => {
      if (event.detail.key === 's') {
        this.appSettings.settings.forceSimulation = !this.appSettings.settings.forceSimulation;
        EventBus.emit('simulation:toggled', { running: this.appSettings.settings.forceSimulation });
      }
    });
  }

  dragsubject(event) {
    const x = event.x;
    const y = event.y;
    let subject = null;
    let minDist = Infinity;

    this.nodes.forEach((node) => {
      const dx = x - node.x;
      const dy = y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10 && dist < minDist) {
        minDist = dist;
        subject = node;
      }
    });

    return subject;
  }

  dragstarted(event) {
    if (!event.active && this.appSettings.settings.forceSimulation) {
      this.simulation.alphaTarget(0.3).restart()
    }
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;

    this.graphManager.graph.updateNodeAttributes(event.subject.id, attr => {
      return {
        ...attr,
        x: event.x,
        y: event.y
      };
    });

    if (!this.appSettings.settings.forceSimulation) {
      this.drawGraph()
    }
  }

  dragended(event) {
    if (!event.active) this.simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
    event.subject.x = event.x;
    event.subject.y = event.y;

  }

  drawGraph() {
    const graph = this.graphManager.graph
    const canvas = this.canvas
    const settings = this.appSettings.settings

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    graph.forEachEdge(function (edge, attr, s, t, source, target) {
      if (!attr.color) {
        graph.setEdgeAttribute(edge, "color", settings.color)
      }
      context.beginPath();
      context.moveTo(source.x, source.y);
      context.lineTo(target.x, target.y);
      context.strokeStyle = attr.color;
      context.lineWidth = settings.edge_size;
      context.stroke();
      context.closePath();
    });

    // Draw nodes
    graph.forEachNode(function (node, attr) {
      if (!attr.label) {
        const newLabel = getAvailableLabel(node);
        graph.setNodeAttribute(node, "label", newLabel)
      }
      if (!attr.color) {
        graph.setNodeAttribute(node, "color", settings.color)
      }
      context.beginPath();
      context.arc(attr.x, attr.y, settings.node_radius, 0, 2 * Math.PI);
      context.fillStyle = settings.vertexLabel ? "white" : attr.color;
      context.fill();
      context.lineWidth = 3;
      context.strokeStyle = attr.color;
      context.stroke();
      context.closePath();

      if (settings.vertexLabel) {
        context.fillStyle = "black";
        context.font = `${settings.label_size}px sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(attr.label, attr.x, attr.y);
      }
    });
  }

  ticked() {
    // Draw nodes
    const sNode = this.nodes[0]
    const gNode = this.graphManager.graph.getNodeAttributes(sNode.id)
    if (gNode.x != sNode.x) {
      this.nodes.forEach((d) => {
        this.graphManager.graph.updateNodeAttributes(d.id, attr => {
          return {
            ...attr,
            x: d.x,
            y: d.y
          };
        });
      });
      EventBus.emit('graph:updated')
    }
  }

  startSimulation() {
    this.simulation.alpha(1).restart();
  }

  stopSimulation() {
    this.simulation.stop();
  }

  updateSimulation() {
    this.simulation.nodes(this.graphManager.graph.getNodesForD3());
    this.simulation.force("link").links(this.graphManager.graph.getEdgesForD3());
    this.startSimulation()
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

}


