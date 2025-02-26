import $ from "jquery";
import * as d3 from 'd3';
import { UndirectedGraph } from 'graphology'; // Import Graphology
import { ladder } from 'graphology-generators/classic';
import { caveman } from 'graphology-generators/community';
import { updateSimulation } from "./dependency/mutation";
import { appSettings } from "./menu_bars/settings";
import { LimitedArray } from "./dependency/classes";
import { drawGraph } from "./dependency/mutation";
import { addNodeAtEvent } from "./dependency/mutation";
export const common = {
  scaleData: {},
  rect: { x: 100, y: 100, width: 150, height: 100 },
  x: 0,
  y: 0,
  selectedNode: [],
  selectedEdge: [],
}

// Set up canvas
export const canvas = d3.select("#chart").node();
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Set Up graph
const graph = caveman(UndirectedGraph, 5, 5)

export const History = new LimitedArray(50);
History.push(graph)
window.History = History

canvas.addEventListener("dblclick", (event) => { addNodeAtEvent(event, History.graph, canvas) });




// Redraw on window resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (appSettings.forceSimulation) {
    updateSimulation();
  } else {
    drawGraph(History.graph, canvas);
  }
});


// Drag behavior - allows dragging at all times
d3.select(canvas)
  .call(
    d3.drag()
      .container(canvas)
      .subject(dragsubject)
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
  );


function dragsubject(event) {
  const x = event.x;
  const y = event.y;
  let subject = null;
  let minDist = Infinity;

  History.graph.forEachNode((node, attr) => {
    const dx = x - attr.x;
    const dy = y - attr.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < appSettings.node_radius && dist < minDist) {
      minDist = dist;
      subject = { ...attr, id: Number(node) };
    }
  });
  return subject;
}



function dragstarted(event) {
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;

  History.graph.updateNodeAttributes(event.subject.id, attr => {
    return {
      ...attr,
      x: event.x,
      y: event.y
    };
  });
  if (!appSettings.forceSimulation) {
    drawGraph(History.graph, canvas)
  }
}

function dragended(event) {
  event.subject.fx = null;
  event.subject.fy = null;
  event.subject.x = event.x;
  event.subject.y = event.y;

}

function addNode(node, attr) {
  const newNode = { id: Number(node), x: attr.x, y: attr.y };
  nodes.push(newNode);
  updateSimulation();
}

function removeNode() {
  if (nodes.length === 0) return;
  const removedNode = nodes.pop();

  // Remove any links connected to the removed node
  links = links.filter(
    (l) => l.source.id !== removedNode.id && l.target.id !== removedNode.id
  );
  updateSimulation();
}

export function addLink(source, target) {
  if (nodes.length < 2) return;
  links.push({ source: source, target: target });
  updateSimulation();
}

function removeLink() {
  if (links.length === 0) return;
  links.pop();
  updateSimulation();
}
