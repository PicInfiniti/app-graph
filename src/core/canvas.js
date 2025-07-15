import * as d3 from "d3";
import { pointToSegmentDistance } from "../utils/helperFunctions";
import {
  getAvailableLabel,
  getMinAvailableNumber,
} from "../utils/helperFunctions.js";

export class Canvas {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.settings = app.appSettings.settings;

    this._canvas = {
      main: {
        canvas: d3.select("#main-canvas").node(),
        ctx: d3.select("#main-canvas").node().getContext("2d"),
      },
      node: {
        canvas: d3.select("#node-canvas").node(),
        ctx: d3.select("#node-canvas").node().getContext("2d"),
      },
      edge: {
        canvas: d3.select("#edge-canvas").node(),
        ctx: d3.select("#edge-canvas").node().getContext("2d"),
      },
      face: {
        canvas: d3.select("#face-canvas").node(),
        ctx: d3.select("#face-canvas").node().getContext("2d"),
      },
    };

    this.canvas = d3.select("#main-canvas").node();
    this.ctx = this.canvas.getContext("2d");

    this.mouse = {
      x: 0,
      y: 0,
      dragging: false,
    };
  }

  init() {
    this.updateCanvasSize(window.innerWidth, window.innerHeight);
    this.canvas.addEventListener("dblclick", this.handleDbclick.bind(this));
    this.canvas.addEventListener("click", this.handleClick.bind(this));

    // 👇 Double-tap detection for touchscreens
    let lastTap = 0;

    this.canvas.addEventListener("touchend", (event) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        this.handleDbclick(event);
      }
      lastTap = currentTime;
    });

    d3.select("#main-canvas")
      .on("mousedown", (event) => {
        this.mouse.dragging = false;
        [this.mouse.x, this.mouse.y] = d3.pointer(event);
      })
      .on("mousemove", (event) => {
        const [x, y] = d3.pointer(event);
        if (Math.abs(x - this.mouse.x) > 2 || Math.abs(y - this.mouse.y) > 2) {
          this.mouse.dragging = true;
        }
      })
      .on("mouseup", (event) => {
        if (!this.mouse.dragging) {
          [this.mouse.x, this.mouse.y] = d3.pointer(event);
        }
      });

    d3.select(this.canvas).call(
      d3
        .drag()
        .container(this.canvas)
        .subject(this.dragsubject.bind(this)) // 👈 Bind this
        .filter((event) => {
          return !(this.settings.scale || this.settings.select);
        })
        .on("start", this.dragstarted.bind(this))
        .on("drag", this.dragged.bind(this))
        .on("end", this.dragended.bind(this)),
    );
  }

  updateCanvasSize(w, h) {
    for (const canvas in this._canvas) {
      this._canvas[canvas].canvas.width = w;
      this._canvas[canvas].canvas.height = h;
    }
    this.app.graphManager.redraw();
  }

  addNodeAtEvent(event) {
    event.preventDefault();
    const [x, y] =
      event.type == "touchend"
        ? getTouchPosition(event, this.canvas)
        : d3.pointer(event, this.canvas);

    const allNodes = [
      ...new Set(this.app.graphManager.graphs.all.flatMap((g) => g.nodes())),
    ];

    const newID = getMinAvailableNumber(allNodes);
    const newLabel = getAvailableLabel(newID);
    this.app.graphManager.addNode(newID, {
      x: x,
      y: y,
      color: this.settings.node_color,
      label: newLabel,
    });
  }

  addNodeConnectedToNode(node) {
    const allNodes = [
      ...new Set(this.app.graphManager.graphs.all.flatMap((g) => g.nodes())),
    ];

    const newID = getMinAvailableNumber(allNodes);
    const newLabel = getAvailableLabel(newID);
    const newNode = {
      x: node.x + 30,
      y: node.y + 30,
      color: this.settings.node_color,
      label: newLabel,
    };

    this.app.graphManager.addNode(newID, newNode);
    this.app.graphManager.graph.addEdge(node.id, newID);

    this.app.graphManager.saveGraphState("tree-node");
  }

  dragsubject(event) {
    let subject = { id: null };
    let minDist = Infinity;

    this.app.nodes.forEach((node) => {
      const dx = event.x - node.x;
      const dy = event.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.settings.node_radius * node.size && dist < minDist) {
        minDist = dist;
        subject = node;
      }
    });

    if (subject) {
      if (this.settings.component) {
        subject.component = this.app.graphManager.metric.getComponent(
          subject.id,
        );
      } else {
        subject.component = this.app.graphManager.graph.getSelectedNodes();
      }
    }

    if (this.settings.panning) {
      subject.component = this.app.graphManager.graph.nodes();
    }
    return subject;
  }

  dragstarted(event) {
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
    event.subject.__moved = false;
    if (event.subject.id !== null) {
      this.app.graphManager.update = true;
      this.canvas.style.cursor = "grab"; // Corrected this line
      if (!event.active && this.settings.forceSimulation) {
        this.app.simulation.alphaTarget(0.5).restart();
      }
    }
  }

  dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;

    if (event.dx !== 0 || event.dy !== 0) {
      event.subject.__moved = true;
    }

    if (!this.settings.forceSimulation && event.subject.component) {
      for (let node of event.subject.component) {
        this.app.graphManager.graph.updateNodeAttributes(node, (attr) => {
          return {
            ...attr,
            x: attr.x + event.dx,
            y: attr.y + event.dy,
          };
        });

        if (this.settings.performance)
          this.app.graphManager.needsRedraw = {
            node: true,
            edge: false,
            face: false,
          };
        else
          this.app.graphManager.needsRedraw = {
            node: true,
            edge: true,
            face: true,
          };
      }

      if (event.subject.id !== null) {
        this.canvas.style.cursor = "grabbing"; // Corrected this line

        this.app.graphManager.graph.updateNodeAttributes(
          event.subject.id,
          (attr) => {
            return {
              ...attr,
              x: event.x,
              y: event.y,
            };
          },
        );

        if (this.settings.performance)
          this.app.graphManager.needsRedraw = {
            node: true,
            edge: false,
            face: false,
          };
        else
          this.app.graphManager.needsRedraw = {
            node: true,
            edge: true,
            face: true,
          };
      }
    }
  }

  dragended(event) {
    if (!event.active) this.app.simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
    event.subject.x = event.x;
    event.subject.y = event.y;
    this.canvas.style.cursor = "default"; // Corrected this line

    if (!this.settings.forceSimulation) this.app.updateSimulation();

    if (
      event.subject.__moved &&
      event.subject.id !== null &&
      !this.settings.forceSimulation
    ) {
      this.app.graphManager.graph.updateNodeAttributes(
        event.subject.id,
        (attr) => {
          return {
            ...attr,
            x: event.x,
            y: event.y,
          };
        },
      );
    }

    if (
      (event.subject.component && event.subject.component.length) ||
      event.subject.id !== null
    )
      if (!this.settings.forceSimulation)
        this.app.graphManager.saveGraphState("update-position");
  }

  findClickedNode(x, y) {
    return this.app.nodes.find((node) => {
      let dx = x - node.x;
      let dy = y - node.y;
      return (
        Math.sqrt(dx * dx + dy * dy) < this.settings.node_radius * node.size
      ); // Adjust radius threshold as needed
    });
  }

  findClickedEdge(x, y) {
    let threshold = 10; // Distance threshold for edge selection
    return this.app.links.find((link) => {
      let source = link.source;
      let target = link.target;

      let dist = pointToSegmentDistance(
        x,
        y,
        source.x,
        source.y,
        target.x,
        target.y,
      );
      return dist < threshold;
    });
  }

  insertNodeInEdge(edge) {
    const allNodes = [
      ...new Set(this.app.graphManager.graphs.all.flatMap((g) => g.nodes())),
    ];

    const newID = getMinAvailableNumber(allNodes);
    const newLabel = getAvailableLabel(newID);
    let midX = (edge.source.x + edge.target.x) / 2;
    let midY = (edge.source.y + edge.target.y) / 2;

    this.app.graphManager.graph.addNode(newID, {
      x: midX,
      y: midY,
      color: this.settings.color,
      label: newLabel,
    });

    // Remove old edge
    this.app.graphManager.graph.dropEdge(edge.source.id, edge.target.id);

    // Add two new edges
    this.app.graphManager.graph.addEdge(edge.source.id, newID);
    this.app.graphManager.graph.addEdge(newID, edge.target.id);
    this.app.graphManager.saveGraphState("tree-edge");
  }

  handleDbclick(event) {
    const [x, y] =
      event.type == "touchend"
        ? getTouchPosition(event, this.canvas)
        : d3.pointer(event, this.canvas);
    let clickedNode = this.findClickedNode(x, y);
    let clickedEdge = this.findClickedEdge(x, y);

    if (clickedNode) {
      if (this.settings.tree) {
        this.addNodeConnectedToNode(clickedNode);
      } else {
        this.app.graphManager.graph.toggleNodeSelection(clickedNode.id);
      }
    } else if (clickedEdge) {
      if (this.settings.tree) {
        this.insertNodeInEdge(clickedEdge);
      } else {
        this.app.graphManager.graph.findEdge(
          clickedEdge.source.id,
          clickedEdge.target.id,
          (edge) => {
            this.app.graphManager.graph.toggleEdgeSelection(edge);
          },
        );
      }
    } else {
      this.addNodeAtEvent(event);
    }
  }

  handleClick(event) {
    if (this.mouse.dragging) return;
    let [x, y] = d3.pointer(event, this.canvas);
    let clickedNode = this.findClickedNode(x, y);
    let clickedEdge = this.findClickedEdge(x, y);

    if (clickedNode) {
      if (this.settings.select) {
        this.app.graphManager.graph.toggleNodeSelection(clickedNode.id);
        if (!this.settings.forceSimulation) {
          this.eventBus.emit("graph:updated", { type: "selected" });
        }
      } else {
        this.app.graphManager.metric.addNEFGInfo(clickedNode);

        if (this.settings.colorPicker) {
          this.app.colorPicker.setColor("node", clickedNode.color);
          this.app.colorPicker.setColor("stroke", clickedNode.stroke);
          this.app.colorPicker.setColor("label", clickedNode.labelColor);
        }
      }
    } else if (clickedEdge) {
      if (this.settings.select) {
        this.app.graphManager.graph.findEdge(
          clickedEdge.source.id,
          clickedEdge.target.id,
          (edge) => {
            this.app.graphManager.graph.toggleEdgeSelection(edge);
          },
        );
      } else {
        this.app.graphManager.metric.addNEFGInfo(clickedEdge);

        if (this.settings.colorPicker) {
          this.app.colorPicker.setColor("edge", clickedEdge.color);
          this.app.colorPicker.setColor("label", clickedEdge.labelColor);
        }
      }
    } else {
      this.app.graphManager.deselectAll();
      this.app.rect.scale.active = false;
    }
  }
}

export function getTouchPosition(event, canvas) {
  const touch = event.changedTouches[0];
  const rect = canvas.getBoundingClientRect();
  return [touch.clientX - rect.left, touch.clientY - rect.top];
}
