import * as d3 from 'd3';
import Graph from 'graphology'; // Import Graphology
import { getMinAvailableNumber, getAvailableLabel, includesById, removeString } from './utils';
import { keyDown } from '../../main';
import { LimitedArray } from './utils';
// Initialize data structures for nodes and edges

export const selectedNode = [];
export const selectedEdge = [];
export const History = new LimitedArray(20)

// Dimensions of the SVG
const width = "100%";
const height = "100%";

// Create SVG container
export const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("preserveAspectRatio", "xMinYMin meet")

History.push(new Graph())
// Draw edges and nodes
const edgeGroup = svg.append("g").attr("class", "edges");
const nodeGroup = svg.append("g").attr("class", "nodes");

// Disable the default context menu
svg.on("contextmenu", (event) => {
  event.preventDefault(); // Disable the default right-click menu
  const color = $("#color").val()

  const [x, y] = d3.pointer(event);

  // Generate the next available label
  const existingIds = History.graph.nodes();
  const newID = getMinAvailableNumber(existingIds)
  const NewLable = getAvailableLabel(newID)
  // Add node to Graphology with the new label
  updateHistory(History, "add"); // add to History before change
  History.graph.addNode(newID, { x: x, y: y, color: color, label: NewLable });
  updateGraph(History.graph);
});

svg.on("click", (event) => {
  if (!keyDown[0] && event.target.tagName === "svg") { // Check if the click is on the empty canvas
    selectedNode.length = 0; // Deselect any selected node
    selectedEdge.length = 0;
    updateGraph(History.graph); // Re-draw nodes and edges
  }
});

// Dragging behavior
const drag = d3.drag()
  .on("start", function (event, d) {
    updateHistory(History, "update"); // Update the graph to include the new node
    d3.select(this).attr("stroke", "orange");
  })
  .on("drag", function (event, d) {
    // Update node position in Graphology
    History.graph.updateNodeAttributes(d.id, (attributes) => {
      return { ...attributes, x: event.x, y: event.y };
    });

    updateGraph(History.graph); // Re-draw to reflect new positions
    d3.select(this).attr("stroke", "orange");
  })
  .on("end", function (event, d) {
    History.graph.updateNodeAttributes(d.id, (attributes) => {
      return { ...attributes, x: event.x, y: event.y };
    });

  });


export function updateGraph(graph) {
  const nodes = graph.nodes().map(id => ({ id, ...graph.getNodeAttributes(id) }));
  const edges = graph.edges();

  // Update edges
  const edgesSelection = edgeGroup.selectAll("line").data(edges);
  edgesSelection.exit().remove();

  edgesSelection.enter()
    .append("line")
    .merge(edgesSelection)
    .attr("x1", d => graph.getNodeAttribute(graph.source(d), 'x'))
    .attr("y1", d => graph.getNodeAttribute(graph.source(d), 'y'))
    .attr("x2", d => graph.getNodeAttribute(graph.target(d), 'x'))
    .attr("y2", d => graph.getNodeAttribute(graph.target(d), 'y'))
    .attr("stroke", d => {
      if (selectedEdge.includes(d)) return "orange"
      return graph.getEdgeAttribute(d, 'color')
    })
    .attr("stroke-width", 2)
    .on("click", handleEdgeClick)
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "orange");
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", d => {
        if (selectedEdge.includes(d)) return "orange"
        else return graph.getEdgeAttribute(d, 'color')
      });
    })

  // Update nodes
  const nodesSelection = nodeGroup.selectAll("circle").data(nodes, d => d.id);
  nodesSelection.exit().remove();
  nodesSelection.enter()
    .append("circle")
    .merge(nodesSelection)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 10)
    .attr("fill", "white")
    .attr("stroke", d => {
      if (selectedNode.includes(d.id)) return "orange"
      return d.color
    })
    .attr("stroke-width", 3)
    .on("click", handleNodeClick)
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "orange");
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", d => {
        if (selectedNode.includes(d.id)) return "orange"
        else return d.color
      });
    })
    .call(drag); // Apply drag behavior

  // Update labels
  const labelsSelection = nodeGroup.selectAll("text").data(nodes, d => d.id);
  labelsSelection.exit().remove();
  labelsSelection.enter()
    .append("text")
    .merge(labelsSelection)
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(d => d.label)
    .attr("font-size", "15px")
    .attr("fill", "black");
}

function handleNodeClick(event, d) {
  event.stopPropagation(); // Prevent SVG click event
  const color = $("#color").val()

  if (keyDown[0]) {
    switch (keyDown[1]) {
      case 'Control':
        if (selectedNode.includes(d.id)) {
          removeString(selectedNode, d.id)
        } else {
          selectedNode.push(d.id)
        }
        break;

      default:
        break;
    }
    updateGraph(History.graph); // Re-draw graph

  }
}

function handleEdgeClick(event, d) {
  event.stopPropagation(); // Prevent SVG click event
  const color = $("#color").val()

  if (keyDown[0]) {
    switch (keyDown[1]) {
      case 'Control':
        if (selectedEdge.includes(d)) {
          removeString(selectedEdge, d)
        } else {
          selectedEdge.push(d)
        }
        break;

      default:
        break;
    }
    updateGraph(History.graph); // Re-draw graph
  }
}


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
      const graphData = History.graph.export();
      const graphClone = new Graph();
      graphClone.import(graphData);
      History.data.length = History.index + 1
      History.push(graphClone);
      break;
  }

  updateGraph(History.graph);

}

