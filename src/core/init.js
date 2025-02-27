import * as d3 from 'd3';
import { History } from '../graph/graph_manager';
import { updateSimulation } from "../graph/mutation";
import { simulation } from '../visualization/force_simulation';
import { appSettings } from "./state";
import { drawGraph } from "../graph/mutation";
import { addNodeAtEvent } from "../graph/mutation";



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

simulation.restart()
