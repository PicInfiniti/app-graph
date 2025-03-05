import $ from "jquery"
import * as d3 from 'd3';
import { getMinAvailableNumber, getAvailableLabel } from "../utils/helperFunctions"


export function updateHistory(History, status = 'update') {
  switch (status) {
    case "redo":
      if (History.index < History.data.length - 1) {
        History.updateIndex(History.index + 1);
        console.log("redo")
      } else {
        console.log("nothing to redo")
      };
      break;
    case "undo":
      if (History.index > 0) {
        History.updateIndex(History.index - 1);
        console.log("undo")
      } else {
        console.log("nothing to undo")
      };
      break;

    default:
      console.log("update")
      const graphClone = History.graph.copy();
      History.data.length = History.index + 1
      History.push(graphClone);
      break;
  }
}

export function updateNodesPostion(graph, positions, center) {
  // update position of all nodes
  graph.forEachNode((node, attr) => {
    graph.updateNodeAttributes(node, attr => {
      return {
        ...attr,
        x: positions[node].x + center.x,
        y: positions[node].y + center.y,
      };
    });
  })
}

export function addNodeId(graph, node, id) {
  // graphology doesn't store node's id in attr so we can add that as an new attr.
  graph.setNodeAttribute(node, 'id', id);
}

export function updateForce(graph, nodes, links) {
  // update all node's position beased on what store in graph
  //
  nodes.length = 0
  graph.forEachNode((node, attr) => {
    nodes.push(
      {
        id: Number(node),
        x: attr.x,
        y: attr.y
      }
    )
  })

  links.length = 0
  graph.forEachEdge(function (edge, attr, s, t, source, target) {
    links.push(
      {
        source: Number(s),
        target: Number(t)
      }
    )
  })
}


export function makeGraphComplete(graph, color = null) {
  for (let i = 0; i < graph.order; i++) {
    for (let j = i + 1; j < graph.order; j++) {
      History.graph.mergeEdge(i, j, { color: color ? color : $("#color").val() }); // Add edge if it doesn't exist
    }
  }
}

export function removeNodes(graph, nodes, edges) {
  for (let edge of edges) {
    graph.dropEdge(edge); // Remove the selected node
  }
  for (let node of nodes) {
    graph.dropNode(node); // Remove the selected node
  }
}

export function updateColor(selectedNode, selectedEdge) {
  const color = $("#color").val()

  for (let node of selectedNode) {
    History.graph.updateNodeAttributes(node, attr => {
      return {
        ...attr,
        color: color,
      };
    })
  }

  for (let edge of selectedEdge) {
    History.graph.updateEdgeAttributes(edge, attr => {
      return {
        ...attr,
        color: color,
      };
    });
  }
}


export function connectNodes(graph, nodes, color) {
  for (let i = 0; i < nodes.lenght; i++) {
    for (let j = i + 1; j < nodes.lenght; j++) {
      graph.mergeEdge(nodes[i], nodes[j], { color: color ? color : $("#color").val() }); // Add edge if it doesn't exist
    }
  }
}




export function updateSimulation(simulation, nodes, links) {
  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(.3).restart(); // Reheat simulation after updates
}


