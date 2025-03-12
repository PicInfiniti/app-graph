import * as d3 from 'd3';
import { pointToSegmentDistance } from '../utils/helperFunctions';
import { getAvailableLabel, getMinAvailableNumber } from '../utils/helperFunctions.js';

export class Canvas {
  constructor(app, eventBus) {
    this.app = app
    this.settings = app.appSettings.settings
    this.eventBus = eventBus
    this.graphManager = app.graphManager
    this.canvas = d3.select("#chart").node()
  }
  init() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.addEventListener("dblclick", (event) => {
      let [x, y] = d3.pointer(event, this.canvas);
      let clickedNode = this.findClickedNode(x, y);
      let clickedEdge = this.findClickedEdge(x, y);

      if (clickedNode && this.settings.tree) {
        this.addNodeConnectedToNode(clickedNode);
      } else if (clickedEdge && this.settings.tree) {

        this.insertNodeInEdge(clickedEdge);
      } else {
        this.addNodeAtEvent(event);
      }
    });

    d3.select(this.canvas)
      .call(
        d3.drag()
          .container(this.canvas)
          .subject(this.dragsubject.bind(this))  // 👈 Bind this
          .on("start", this.dragstarted.bind(this))
          .on("drag", this.dragged.bind(this))
          .on("end", this.dragended.bind(this))
      );

    // Add mouse event listeners for rectangle dragging
    this.canvas.addEventListener("mousedown", (event) => this.app.startSelection(event));
    this.canvas.addEventListener("mousemove", (event) => this.app.updateSelection(event));
    this.canvas.addEventListener("mouseup", () => this.app.endSelection());

  }

  addNodeAtEvent(event) {
    event.preventDefault();

    let [x, y] = d3.pointer(event, this.canvas);
    const newID = getMinAvailableNumber(this.graphManager.graph.nodes());
    const newLabel = getAvailableLabel(newID);
    this.graphManager.graph.addNode(newID, { x, y, color: this.settings.color, label: newLabel });
    this.eventBus.emit('graph:updated', { type: 'addNode', node: newID })
  }

  addNodeConnectedToNode(node) {
    const newID = getMinAvailableNumber(this.app.graphManager.graph.nodes());
    const newLabel = getAvailableLabel(newID);
    const newNode = { x: node.x + 30, y: node.y + 30, color: this.settings.color, label: newLabel };

    this.graphManager.graph.addNode(newID, newNode);
    this.graphManager.graph.addEdge(node.id, newID);

    this.eventBus.emit('graph:updated', { type: 'addNode', node: newID });
  }

  dragsubject(event) {
    const x = event.x;
    const y = event.y;
    let subject = null;
    let minDist = Infinity;

    this.app.nodes.forEach((node) => {
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
    if (!event.active && this.settings.forceSimulation) {
      this.app.simulation.alphaTarget(0.3).restart()
    }
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;

    if (!this.settings.forceSimulation) {
      this.graphManager.graph.updateNodeAttributes(event.subject.id, attr => {
        return {
          ...attr,
          x: event.x,
          y: event.y
        };
      });
      this.app.drawGraph()
    }
  }

  dragended(event) {
    if (!event.active) this.app.simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
    event.subject.x = event.x;
    event.subject.y = event.y;
  }


  findClickedNode(x, y) {
    return this.app.nodes.find(node => {
      let dx = x - node.x;
      let dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < this.settings.node_radius + 10; // Adjust radius threshold as needed
    });
  }


  findClickedEdge(x, y) {
    let threshold = 10; // Distance threshold for edge selection
    return this.app.links.find(link => {
      let source = link.source;
      let target = link.target;

      let dist = pointToSegmentDistance(x, y, source.x, source.y, target.x, target.y);
      return dist < threshold;
    });
  }

  insertNodeInEdge(edge) {
    const newID = getMinAvailableNumber(this.graphManager.graph.nodes());
    const newLabel = getAvailableLabel(newID);
    let midX = (edge.source.x + edge.target.x) / 2;
    let midY = (edge.source.y + edge.target.y) / 2;

    this.graphManager.graph.addNode(newID, { x: midX, y: midY, color: this.settings.color, label: newLabel });

    // Remove old edge
    this.graphManager.graph.dropEdge(edge.source.id, edge.target.id);

    // Add two new edges
    this.graphManager.graph.addEdge(edge.source.id, newID);
    this.graphManager.graph.addEdge(newID, edge.target.id);

    this.eventBus.emit('graph:updated', { type: 'addNodeInEdge', node: newID });
  }


}

