import * as d3 from 'd3';
import { pointToSegmentDistance } from '../utils/helperFunctions';
import { getAvailableLabel, getMinAvailableNumber } from '../utils/helperFunctions.js';

export class Canvas {
  constructor(app) {
    this.app = app
    this.eventBus = app.eventBus
    this.settings = app.appSettings.settings
    this.canvas = d3.select("#chart").node()
    this.ctx = this.canvas.getContext("2d")

    this.panning = {
      xOffset: 0,
      yOffset: 0,
      isDragging: false
    }
  }

  init() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.addEventListener("dblclick", this.handleDbclick.bind(this));

    this.canvas.addEventListener("click", this.handleclick.bind(this));

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

    this.initialPanning()
  }

  addNodeAtEvent(event) {
    event.preventDefault();

    let [x, y] = d3.pointer(event, this.canvas);
    x = x - this.panning.xOffset
    y = y - this.panning.yOffset

    const newID = getMinAvailableNumber(this.app.graphManager.graph.nodes());
    const newLabel = getAvailableLabel(newID);
    this.app.graphManager.addNode(newID, { x: x, y: y, color: this.settings.color, label: newLabel });
  }

  addNodeConnectedToNode(node) {
    const newID = getMinAvailableNumber(this.app.graphManager.graph.nodes());
    const newLabel = getAvailableLabel(newID);
    const newNode = { x: node.x + 30, y: node.y + 30, color: this.settings.color, label: newLabel };

    this.app.graphManager.graph.addNode(newID, newNode);
    this.app.graphManager.graph.addEdge(node.id, newID);

    this.eventBus.emit('graph:updated', { type: 'addNode', node: newID });
  }

  dragsubject(event) {
    const x = event.x - this.panning.xOffset;
    const y = event.y - this.panning.yOffset;
    let subject = null;
    let minDist = Infinity;

    this.app.nodes.forEach((node) => {
      const dx = x - node.x;
      const dy = y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.settings.node_radius && dist < minDist) {
        minDist = dist;
        subject = node;
      }
    });

    if (this.settings.panning) return;

    if (subject) {
      if (this.settings.component) {
        subject.component = this.app.graphManager.metric.getComponent(subject.id)
      } else {
        subject.component = new Set(this.app.selectedNodes)
        subject.component.add(subject.id)
      }
    }

    return subject;
  }

  dragstarted(event) {
    if (!event.active && this.settings.forceSimulation) {
      this.app.simulation.alphaTarget(0.3).restart()
    }
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
    if (!this.settings.forceSimulation) {
      this.app.graphManager.saveGraphState();
    }
  }

  dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;

    if (!this.settings.forceSimulation) {
      for (let node of event.subject.component) {
        this.app.graphManager.graph.updateNodeAttributes(node, attr => {
          return {
            ...attr,
            x: attr.x + event.dx,
            y: attr.y + event.dy
          };
        });
      }
      this.app.drawGraph()
    }
  }

  dragended(event) {
    if (!event.active) this.app.simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
    event.subject.x = event.x;
    event.subject.y = event.y;
    if (!this.settings.forceSimulation) this.app.updateSimulation()
  }


  findClickedNode(x, y) {
    x = x - this.panning.xOffset
    y = y - this.panning.yOffset
    return this.app.nodes.find(node => {
      let dx = x - node.x;
      let dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < this.settings.node_radius; // Adjust radius threshold as needed
    });
  }


  findClickedEdge(x, y) {
    x = x - this.panning.xOffset
    y = y - this.panning.yOffset
    let threshold = 10; // Distance threshold for edge selection
    return this.app.links.find(link => {
      let source = link.source;
      let target = link.target;

      let dist = pointToSegmentDistance(x, y, source.x, source.y, target.x, target.y);
      return dist < threshold;
    });
  }

  insertNodeInEdge(edge) {
    const newID = getMinAvailableNumber(this.app.graphManager.graph.nodes());
    const newLabel = getAvailableLabel(newID);
    let midX = (edge.source.x + edge.target.x) / 2;
    let midY = (edge.source.y + edge.target.y) / 2;

    this.app.graphManager.graph.addNode(newID, { x: midX, y: midY, color: this.settings.color, label: newLabel });

    // Remove old edge
    this.app.graphManager.graph.dropEdge(edge.source.id, edge.target.id);

    // Add two new edges
    this.app.graphManager.graph.addEdge(edge.source.id, newID);
    this.app.graphManager.graph.addEdge(newID, edge.target.id);

    this.eventBus.emit('graph:updated', { type: 'addNodeInEdge', node: newID });
  }

  handleDbclick(event) {
    let [x, y] = d3.pointer(event, this.canvas);

    let clickedNode = this.findClickedNode(x, y);
    let clickedEdge = this.findClickedEdge(x, y);

    if (clickedNode) {
      if (this.settings.tree) {
        this.addNodeConnectedToNode(clickedNode);
      } else {
        this.app.graphManager.graph.toggleNodeSelection(clickedNode.id);
        if (!this.settings.forceSimulation) {
          this.eventBus.emit("graph:updated", { type: "selected" })
        }
      }
    } else if (clickedEdge) {
      if (this.settings.tree) {
        this.insertNodeInEdge(clickedEdge);
      } else {
        this.app.graphManager.graph.findEdge(clickedEdge.source.id, clickedEdge.target.id, (edge) => {
          this.app.graphManager.graph.toggleEdgeSelection(edge);
          if (!this.settings.forceSimulation) {
            this.eventBus.emit("graph:updated", { type: "selected" })
          }
        })
      }
    } else {
      this.addNodeAtEvent(event);
    }
  }

  handleclick(event) {
    let [x, y] = d3.pointer(event, this.canvas);
    let clickedNode = this.findClickedNode(x, y);
    let clickedEdge = this.findClickedEdge(x, y);

    if (clickedNode || clickedEdge) {

    } else {
      this.app.graphManager.deselectAll();
      this.eventBus.emit("graph:updated", { type: "unselect" })
    }
  }

  initialPanning() {
    // Event Listeners for Dragging
    this.canvas.addEventListener("mousedown", (event) => {
      if (this.settings.panning) {
        this.panning.isDragging = true;
        this.panning.startX = event.clientX - this.panning.xOffset;
        this.panning.startY = event.clientY - this.panning.yOffset;
      }
    });

    this.canvas.addEventListener("mousemove", (event) => {
      if (this.settings.panning && this.panning.isDragging) {
        this.panning.xOffset = event.clientX - this.panning.startX;
        this.panning.yOffset = event.clientY - this.panning.startY;
        this.app.drawGraph(); // Redraw with new offset
      }
    });

    this.canvas.addEventListener("mouseup", () => this.panning.isDragging = false);
    this.canvas.addEventListener("mouseleave", () => this.panning.isDragging = false);

    this.app.drawGraph(); // Redraw with new offset
  }
}
