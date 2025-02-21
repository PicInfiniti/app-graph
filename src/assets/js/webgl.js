import $ from "jquery";
import * as d3 from 'd3';
import Graph from 'graphology'; // Import Graphology
import { getMinAvailableNumber, getAvailableLabel, removeString, lineIntersectsRect, pointInRect } from './utils';
import { LimitedArray, getTouchPosition } from './utils';
import { getComponent } from "./utils";
import { appSettings } from "./menu_bars/settings";

// Initialize data structures
export const selectedNode = [];
export const selectedEdge = [];
export let pressTimer = null;
export const History = new LimitedArray(50);
window.History = History

export const common = {
  selectedEdge: [],
  selectedNode: [],
  pressTimer: null,
  lastTapTime: 0,
  hover: false,
  scaleData: {},
  rect: { x: 100, y: 100, width: 150, height: 100 },
  x: 0,
  y: 0
}

// Create SVG container
export const svg = d3.select("#chart")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("preserveAspectRatio", "xMinYMin meet");

History.push(new Graph())

const edgeGroup = svg.append("g").attr("class", "edges");
const nodeGroup = svg.append("g").attr("class", "nodes");



svg.on("dblclick touchend", handleDoubleClick);

// Handle double click or double tap to add a node
function handleDoubleClick(event) {
  const currentTime = Date.now();
  if (event.type === "dblclick" || (event.type === "touchend" && currentTime - common.lastTapTime < 300)) {
    if (!common.hover) {
      addNodeAtEvent(event);
    }
  }
  common.lastTapTime = currentTime;
}

// Function to add a new node at event position
function addNodeAtEvent(event) {
  event.preventDefault();
  const color = $("#color").val();
  let [x, y] = event.type === "touchend" ? getTouchPosition(event, svg) : d3.pointer(event);

  const newID = getMinAvailableNumber(History.graph.nodes());
  const newLabel = getAvailableLabel(newID);

  updateHistory(History, "add");
  History.graph.addNode(newID, { x, y, color, label: newLabel });
  updateGraph(History.graph);
}

// Dragging behavior
const dragNode = d3.drag()
  .on("start", (event, d) => {
    // Store the initial pointer position
    common.x = event.x;
    common.y = event.y;

    updateHistory(History, "update");
  })
  .on("drag", (event, d) => {
    // Calculate the distance moved from the initial pointer position
    const distanceX = event.x - common.x;
    const distanceY = event.y - common.y;

    if (appSettings.dragComponent) {
      for (let node of getComponent(History.graph, d.id)) {
        History.graph.updateNodeAttributes(node, attrs => ({
          ...attrs,
          x: attrs.x + distanceX,
          y: attrs.y + distanceY
        }));
      }
    } else {
      for (let node of selectedNode) {
        History.graph.updateNodeAttributes(node, attrs => ({
          ...attrs,
          x: attrs.x + distanceX,
          y: attrs.y + distanceY
        }));
      }
      if (!selectedNode.includes(d.id)) {
        History.graph.updateNodeAttributes(d.id, attrs => ({
          ...attrs,
          x: attrs.x + distanceX,
          y: attrs.y + distanceY
        }));

      }
    }

    common.x = event.x;
    common.y = event.y;

    updateGraph(History.graph);
  })


// Dragging behavior
const dragEdge = d3.drag()
  .on("start", (event, d) => {
    // Store the initial pointer position
    common.x = event.x;
    common.y = event.y;

    updateHistory(History, "update");
  })
  .on("drag", (event, d) => {
    // Calculate the distance moved from the initial pointer position
    const distanceX = event.x - common.x;
    const distanceY = event.y - common.y;

    if (appSettings.dragComponent) {
      for (let node of getComponent(History.graph, History.graph.source(d))) {
        History.graph.updateNodeAttributes(node, attrs => ({
          ...attrs,
          x: attrs.x + distanceX,
          y: attrs.y + distanceY
        }));
      }
    } else {
      // Update node position using the original node coordinates
      History.graph.updateNodeAttributes(History.graph.source(d), attrs => ({
        ...attrs,
        x: attrs.x + distanceX,
        y: attrs.y + distanceY
      }));
      History.graph.updateNodeAttributes(History.graph.target(d), attrs => ({
        ...attrs,
        x: attrs.x + distanceX,
        y: attrs.y + distanceY
      }));

    }

    // Update the stored pointer position for continuous tracking
    common.x = event.x;
    common.y = event.y;

    updateGraph(History.graph);
  })

export function updateGraph(graph) {
  const color = $("#color").val();
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
      if (graph.getEdgeAttribute(d, 'color')) {
        return graph.getEdgeAttribute(d, 'color')
      } else {
        graph.setEdgeAttribute(d, 'color', color)
        return color
      }
    })
    .attr("stroke-width", appSettings.edge_size)
    .on("click touchend", function (event, d) {
      if (event.ctrlKey || event.type === "touchend") {
        selectElement("edge", d);
      }
    })
    .on("dblclick", function (event, d) {
      selectElement("edge", d);
      console.log("select edge")
    })
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "orange");
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
      common.hover = true;
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", d => {
        if (selectedEdge.includes(d)) return "orange"
        else return graph.getEdgeAttribute(d, 'color')
      });
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
      common.hover = false;
    })
    .call(dragEdge)

  // Update nodes
  const nodesSelection = nodeGroup.selectAll("circle").data(nodes, d => d.id);
  nodesSelection.exit().remove();
  nodesSelection.enter()
    .append("circle")
    .merge(nodesSelection)
    .attr("cx", d => d.x)
import $ from "jquery";
import * as d3 from 'd3';
import Graph from 'graphology'; // Import Graphology
import { getMinAvailableNumber, getAvailableLabel, removeString, lineIntersectsRect, pointInRect } from './utils';
import { LimitedArray, getTouchPosition } from './utils';
import { getComponent } from "./utils";
import { appSettings } from "./menu_bars/settings";

// Initialize data structures
export const selectedNode = [];
export const selectedEdge = [];
export let pressTimer = null;
export const History = new LimitedArray(50);
window.History = History

export const common = {
  selectedEdge: [],
  selectedNode: [],
  pressTimer: null,
  lastTapTime: 0,
  hover: false,
  scaleData: {},
  rect: { x: 100, y: 100, width: 150, height: 100 },
  x: 0,
  y: 0
}

// Create SVG container
export const svg = d3.select("#chart")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("preserveAspectRatio", "xMinYMin meet");

History.push(new Graph())

const edgeGroup = svg.append("g").attr("class", "edges");
const nodeGroup = svg.append("g").attr("class", "nodes");



svg.on("dblclick touchend", handleDoubleClick);

// Handle double click or double tap to add a node
function handleDoubleClick(event) {
  const currentTime = Date.now();
  if (event.type === "dblclick" || (event.type === "touchend" && currentTime - common.lastTapTime < 300)) {
    if (!common.hover) {
      addNodeAtEvent(event);
    }
  }
  common.lastTapTime = currentTime;
}

// Function to add a new node at event position
function addNodeAtEvent(event) {
  event.preventDefault();
  const color = $("#color").val();
  let [x, y] = event.type === "touchend" ? getTouchPosition(event, svg) : d3.pointer(event);

  const newID = getMinAvailableNumber(History.graph.nodes());
  const newLabel = getAvailableLabel(newID);

  updateHistory(History, "add");
  History.graph.addNode(newID, { x, y, color, label: newLabel });
  updateGraph(History.graph);
}

// Dragging behavior
const dragNode = d3.drag()
  .on("start", (event, d) => {
    // Store the initial pointer position
    common.x = event.x;
    common.y = event.y;

    updateHistory(History, "update");
  })
  .on("drag", (event, d) => {
    // Calculate the distance moved from the initial pointer position
    const distanceX = event.x - common.x;
    const distanceY = event.y - common.y;

    if (appSettings.dragComponent) {
      for (let node of getComponent(History.graph, d.id)) {
        History.graph.updateNodeAttributes(node, attrs => ({
          ...attrs,
          x: attrs.x + distanceX,
          y: attrs.y + distanceY
        }));
      }
    } else {
      for (let node of selectedNode) {
        History.graph.updateNodeAttributes(node, attrs => ({
          ...attrs,
          x: attrs.x + distanceX,
          y: attrs.y + distanceY
        }));
      }
      if (!selectedNode.includes(d.id)) {
        History.graph.updateNodeAttributes(d.id, attrs => ({
          ...attrs,
          x: attrs.x + distanceX,
          y: attrs.y + distanceY
        }));

      }
    }

    common.x = event.x;
    common.y = event.y;

    updateGraph(History.graph);
  })


// Dragging behavior
const dragEdge = d3.drag()
  .on("start", (event, d) => {
    // Store the initial pointer position
    common.x = event.x;
    common.y = event.y;

    updateHistory(History, "update");
  })
  .on("drag", (event, d) => {
    // Calculate the distance moved from the initial pointer position
    const distanceX = event.x - common.x;
    const distanceY = event.y - common.y;

    if (appSettings.dragComponent) {
      for (let node of getComponent(History.graph, History.graph.source(d))) {
        History.graph.updateNodeAttributes(node, attrs => ({
          ...attrs,
          x: attrs.x + distanceX,
          y: attrs.y + distanceY
        }));
      }
    } else {
      // Update node position using the original node coordinates
      History.graph.updateNodeAttributes(History.graph.source(d), attrs => ({
        ...attrs,
        x: attrs.x + distanceX,
        y: attrs.y + distanceY
      }));
      History.graph.updateNodeAttributes(History.graph.target(d), attrs => ({
        ...attrs,
        x: attrs.x + distanceX,
        y: attrs.y + distanceY
      }));

    }

    // Update the stored pointer position for continuous tracking
    common.x = event.x;
    common.y = event.y;

    updateGraph(History.graph);
  })

export function updateGraph(graph) {
  const color = $("#color").val();
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
      if (graph.getEdgeAttribute(d, 'color')) {
        return graph.getEdgeAttribute(d, 'color')
      } else {
        graph.setEdgeAttribute(d, 'color', color)
        return color
      }
    })
    .attr("stroke-width", appSettings.edge_size)
    .on("click touchend", function (event, d) {
      if (event.ctrlKey || event.type === "touchend") {
        selectElement("edge", d);
      }
    })
    .on("dblclick", function (event, d) {
      selectElement("edge", d);
      console.log("select edge")
    })
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "orange");
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
      common.hover = true;
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", d => {
        if (selectedEdge.includes(d)) return "orange"
        else return graph.getEdgeAttribute(d, 'color')
      });
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
      common.hover = false;
    })
    .call(dragEdge)

  // Update nodes
  const nodesSelection = nodeGroup.selectAll("circle").data(nodes, d => d.id);
  nodesSelection.exit().remove();
  nodesSelection.enter()
    .append("circle")
    .merge(nodesSelection)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", appSettings.node_radius)
    .attr("fill", d => {
      if (appSettings.vertexLabel) {
        return "white"
      } else {
        if (d.color) {
          return d.color
        } else {
          return color
        }
      }
    })
    .attr("stroke", d => {
      if (selectedNode.includes(d.id)) return "orange"
      if (d.color) {
        return d.color
      } else {
        graph.setNodeAttribute(d.id, 'color', color)
        return color
      }
    })
    .attr("stroke-width", 3)
    .on("click touchend", function (event, d) {
      if (event.ctrlKey || event.type === "touchend") {
        if (appSettings.dragComponent) {
          for (let node of getComponent(History.graph, d.id)) {
            selectElement("node", node);
          }
        } else {
          selectElement("node", d.id);
        }
        console.log("select node")
      }
    })
    .on("dblclick", function (event, d) {
      if (appSettings.dragComponent) {
        for (let node of getComponent(History.graph, d.id)) {
          selectElement("node", node);
        }
      } else {
        selectElement("node", d.id);
      }
      console.log("select node")
    })
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "orange");
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
      common.hover = true

    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", d => {
        if (selectedNode.includes(d.id)) {
          return "orange"
        } else {
          if (d.color) {
            return d.color
          } else {
            graph.setNodeAttribute(d.id, 'color', color)
            return color
          }
        }
      });
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
      common.hover = false;
    })
    .call(dragNode); // Apply drag behavior

  // Update labels

  if (appSettings.vertexLabel) {
    const labelsSelection = nodeGroup.selectAll("text").data(nodes, d => d.id);
    labelsSelection.exit().remove();
    labelsSelection.enter()
      .append("text")
      .merge(labelsSelection)
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(d => {
        if (d.label) {
          return d.label
        } else {
          const label = getAvailableLabel(d.id)
          graph.setNodeAttribute(d.id, 'label', label)
          return label
        }
      })
      .attr("font-size", `${appSettings.label_size}px`)
      .attr("fill", "black");
  } else {
    nodeGroup.selectAll("text").remove();
  }

  if (selectedNode.length < 1) {
    deselectAll();
  }
}

function selectElement(element = "node", d) {
  if (element == "node") {
    if (selectedNode.includes(d)) {
      removeString(selectedNode, d)
    } else {
      selectedNode.push(d)
    }
  }
  if (element == "edge") {
    if (selectedEdge.includes(d)) {
      removeString(selectedEdge, d)
    } else {
      selectedEdge.push(d)
    }
  }
  updateGraph(History.graph); // Re-draw graph
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
      const graphClone = History.graph.copy();
      History.data.length = History.index + 1
      History.push(graphClone);
      break;
  }

  updateGraph(History.graph);

}

// Selection Box
let selectionBox = svg.append("rect")
  .attr("fill", "rgba(0, 0, 200, 0.2)") // Semi-transparent blue
  .attr("stroke", "blue")
  .attr("stroke-dasharray", "4")
  .style("display", "none");

let startX, startY;

// Mouse Down - Start Selection
svg.on("mousedown", function (event) {
  if (event.button !== 0) return
  if (event.target.tagName !== "svg") return; // Only start selection if clicking on empty space

  const [x, y] = d3.pointer(event);
  startX = x;
  startY = y;

  selectionBox
    .attr("x", x)
    .attr("y", y)
    .attr("width", 0)
    .attr("height", 0)
    .style("display", "block");

  svg.on("mousemove", function (event) {
    const [newX, newY] = d3.pointer(event);

    selectionBox
      .attr("x", Math.min(startX, newX))
      .attr("y", Math.min(startY, newY))
      .attr("width", Math.abs(newX - startX))
      .attr("height", Math.abs(newY - startY));
  });

  svg.on("mouseup", function () {
    const x1 = parseFloat(selectionBox.attr("x")),
      y1 = parseFloat(selectionBox.attr("y")),
      x2 = x1 + parseFloat(selectionBox.attr("width")),
      y2 = y1 + parseFloat(selectionBox.attr("height"));

    // Clear previous selections
    selectedNode.length = 0;
    selectedEdge.length = 0;

    // Select nodes inside the box
    nodeGroup.selectAll("circle").each(function (d) {
      if (pointInRect(d.x, d.y, x1, y1, x2, y2)) {
        selectElement("node", d.id); // Store selected node ID
      }
    });

    // Select edges that have at least one endpoint inside OR intersect the selection box
    edgeGroup.selectAll("line").each(function (d) {
      const sx = History.graph.getNodeAttribute(History.graph.source(d), 'x');
      const sy = History.graph.getNodeAttribute(History.graph.source(d), 'y');
      const tx = History.graph.getNodeAttribute(History.graph.target(d), 'x');
      const ty = History.graph.getNodeAttribute(History.graph.target(d), 'y');

      if (
        pointInRect(sx, sy, x1 + 10, y1 + 10, x2 - 10, y2 - 10) ||
        pointInRect(tx, ty, x1 + 10, y1 + 10, x2 - 10, y2 - 10) ||
        lineIntersectsRect([sx, sy, tx, ty], [x1, y1, x2, y2])
      ) {
        selectElement("edge", d);
      }
    });

    updateGraph(History.graph); // Re-draw the graph with selections
    selectionBox.style("display", "none"); // Hide selection box
    svg.on("mousemove", null).on("mouseup", null); // Remove event listeners
    if (appSettings.scale)
      salma();
  });

});

function getBoundingBox(graph, selectedNodeIds) {
  if (selectedNodeIds.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  selectedNodeIds.forEach(nodeId => {
    let node = graph.getNodeAttributes(nodeId);
    if (node.x < minX) minX = node.x;
    if (node.y < minY) minY = node.y;
    if (node.x > maxX) maxX = node.x;
    if (node.y > maxY) maxY = node.y;
  });

  return { x: minX - appSettings.node_radius, y: minY - appSettings.node_radius, width: maxX - minX + 2 * appSettings.node_radius, height: maxY - minY + 2 * appSettings.node_radius };
}

function update(rect) {
  const handleSize = 8;
  let rectSelection = svg.select(".rect");
  // Update or create the rectangle
  if (rectSelection.empty()) {
    rectSelection = svg.append("rect").attr("class", "rect");
    if (appSettings.scale) {
      common.scaleData = {};
      selectedNode.forEach(
        nodeId => {
          const node = History.graph.getNodeAttributes(nodeId)
          common.scaleData[nodeId] =
            { id: nodeId, x: (node.x - rect.x) / rect.width, y: (node.y - rect.y) / rect.height }
        }
      )
    }
  }

  rectSelection
    .attr("x", rect.x)
    .attr("y", rect.y)
    .attr("width", rect.width)
    .attr("height", rect.height)
    .style("cursor", "move")
    .call(d3.drag().on("drag", dragRect));
  // Handle positions
  let handles = [
    { x: rect.x, y: rect.y, cursor: "nwse-resize", action: "top-left" },
    { x: rect.x + rect.width / 2, y: rect.y, cursor: "ns-resize", action: "top" },
    { x: rect.x + rect.width, y: rect.y, cursor: "nesw-resize", action: "top-right" },
    { x: rect.x + rect.width, y: rect.y + rect.height / 2, cursor: "ew-resize", action: "right" },
    { x: rect.x + rect.width, y: rect.y + rect.height, cursor: "nwse-resize", action: "bottom-right" },
    { x: rect.x + rect.width / 2, y: rect.y + rect.height, cursor: "ns-resize", action: "bottom" },
    { x: rect.x, y: rect.y + rect.height, cursor: "nesw-resize", action: "bottom-left" },
    { x: rect.x, y: rect.y + rect.height / 2, cursor: "ew-resize", action: "left" }
  ];

  // Update or create handles
  let handleSelection = svg.selectAll(".handle").data(handles);

  handleSelection
    .join("rect") // If it doesn’t exist, create it
    .attr("class", "handle")
    .attr("x", d => d.x - handleSize / 2)
    .attr("y", d => d.y - handleSize / 2)
    .attr("width", handleSize)
    .attr("height", handleSize)
    .style("cursor", d => d.cursor)
    .call(d3.drag().on("drag", handleDrag));


  moveNodes(selectedNode, rect)
}

// Drag function for moving the rectangle
function dragRect(event) {
  common.rect.x += event.dx;
  common.rect.y += event.dy;
  update(common.rect);
}

function handleDrag(event, d) {
  const rect = common.rect
  const minSize = 10; // Minimum size constraint

  let dx = event.dx, dy = event.dy;
  let newX = rect.x, newY = rect.y, newWidth = rect.width, newHeight = rect.height;

  switch (d.action) {
    case "top-left":
      newX += dx;
      newY += dy;
      newWidth -= dx;
      newHeight -= dy;
      break;
    case "top":
      newY += dy;
      newHeight -= dy;
      break;
    case "top-right":
      newY += dy;
      newWidth += dx;
      newHeight -= dy;
      break;
    case "right":
      newWidth += dx;
      break;
    case "bottom-right":
      newWidth += dx;
      newHeight += dy;
      break;
    case "bottom":
      newHeight += dy;
      break;
    case "bottom-left":
      newX += dx;
      newWidth -= dx;
      newHeight += dy;
      break;
    case "left":
      newX += dx;
      newWidth -= dx;
      break;
  }

  // Prevent width/height from going below minSize
  if (newWidth >= minSize && newHeight >= minSize) {
    rect.x = newX;
    rect.y = newY;
    rect.width = newWidth;
    rect.height = newHeight;
  } else {
    // If size is too small, adjust x/y to prevent movement
    if (newWidth < minSize) {
      if (d.action.includes("left")) rect.x = rect.x + rect.width - minSize;
      rect.width = minSize;
    }
    if (newHeight < minSize) {
      if (d.action.includes("top")) rect.y = rect.y + rect.height - minSize;
      rect.height = minSize;
    }
  }

  update(rect);

}

function salma() {
  common.rect = getBoundingBox(History.graph, selectedNode)
  if (common.rect)
    update(common.rect);
}

function moveNodes(selectedNode, rect) {
  selectedNode.forEach(nodeId => {
    History.graph.updateNodeAttributes(nodeId, attrs => {
      return {
        ...attrs,
        x: rect.x + rect.width * common.scaleData[nodeId].x,
        y: rect.y + rect.height * common.scaleData[nodeId].y
      }
    });
  })
  updateGraph(History.graph)
}


export function deselectAll() {
  svg.select('.rect').remove()
  svg.selectAll('.handle').remove()
}
    .attr("cy", d => d.y)
    .attr("r", appSettings.node_radius)
    .attr("fill", d => {
      if (appSettings.vertexLabel) {
        return "white"
      } else {
        if (d.color) {
          return d.color
        } else {
          return color
        }
      }
    })
    .attr("stroke", d => {
      if (selectedNode.includes(d.id)) return "orange"
      if (d.color) {
        return d.color
      } else {
        graph.setNodeAttribute(d.id, 'color', color)
        return color
      }
    })
    .attr("stroke-width", 3)
    .on("click touchend", function (event, d) {
      if (event.ctrlKey || event.type === "touchend") {
        if (appSettings.dragComponent) {
          for (let node of getComponent(History.graph, d.id)) {
            selectElement("node", node);
          }
        } else {
          selectElement("node", d.id);
        }
        console.log("select node")
      }
    })
    .on("dblclick", function (event, d) {
      if (appSettings.dragComponent) {
        for (let node of getComponent(History.graph, d.id)) {
          selectElement("node", node);
        }
      } else {
        selectElement("node", d.id);
      }
      console.log("select node")
    })
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "orange");
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
      common.hover = true

    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", d => {
        if (selectedNode.includes(d.id)) {
          return "orange"
        } else {
          if (d.color) {
            return d.color
          } else {
            graph.setNodeAttribute(d.id, 'color', color)
            return color
          }
        }
      });
      clearTimeout(pressTimer); // Cancel selection if user moves or lifts finger
      common.hover = false;
    })
    .call(dragNode); // Apply drag behavior

  // Update labels

  if (appSettings.vertexLabel) {
    const labelsSelection = nodeGroup.selectAll("text").data(nodes, d => d.id);
    labelsSelection.exit().remove();
    labelsSelection.enter()
      .append("text")
      .merge(labelsSelection)
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(d => {
        if (d.label) {
          return d.label
        } else {
          const label = getAvailableLabel(d.id)
          graph.setNodeAttribute(d.id, 'label', label)
          return label
        }
      })
      .attr("font-size", `${appSettings.label_size}px`)
      .attr("fill", "black");
  } else {
    nodeGroup.selectAll("text").remove();
  }

  if (selectedNode.length < 1) {
    deselectAll();
  }
}

function selectElement(element = "node", d) {
  if (element == "node") {
    if (selectedNode.includes(d)) {
      removeString(selectedNode, d)
    } else {
      selectedNode.push(d)
    }
  }
  if (element == "edge") {
    if (selectedEdge.includes(d)) {
      removeString(selectedEdge, d)
    } else {
      selectedEdge.push(d)
    }
  }
  updateGraph(History.graph); // Re-draw graph
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
      const graphClone = History.graph.copy();
      History.data.length = History.index + 1
      History.push(graphClone);
      break;
  }

  updateGraph(History.graph);

}

// Selection Box
let selectionBox = svg.append("rect")
  .attr("fill", "rgba(0, 0, 200, 0.2)") // Semi-transparent blue
  .attr("stroke", "blue")
  .attr("stroke-dasharray", "4")
  .style("display", "none");

let startX, startY;

// Mouse Down - Start Selection
svg.on("mousedown", function (event) {
  if (event.button !== 0) return
  if (event.target.tagName !== "svg") return; // Only start selection if clicking on empty space

  const [x, y] = d3.pointer(event);
  startX = x;
  startY = y;

  selectionBox
    .attr("x", x)
    .attr("y", y)
    .attr("width", 0)
    .attr("height", 0)
    .style("display", "block");

  svg.on("mousemove", function (event) {
    const [newX, newY] = d3.pointer(event);

    selectionBox
      .attr("x", Math.min(startX, newX))
      .attr("y", Math.min(startY, newY))
      .attr("width", Math.abs(newX - startX))
      .attr("height", Math.abs(newY - startY));
  });

  svg.on("mouseup", function () {
    const x1 = parseFloat(selectionBox.attr("x")),
      y1 = parseFloat(selectionBox.attr("y")),
      x2 = x1 + parseFloat(selectionBox.attr("width")),
      y2 = y1 + parseFloat(selectionBox.attr("height"));

    // Clear previous selections
    selectedNode.length = 0;
    selectedEdge.length = 0;

    // Select nodes inside the box
    nodeGroup.selectAll("circle").each(function (d) {
      if (pointInRect(d.x, d.y, x1, y1, x2, y2)) {
        selectElement("node", d.id); // Store selected node ID
      }
    });

    // Select edges that have at least one endpoint inside OR intersect the selection box
    edgeGroup.selectAll("line").each(function (d) {
      const sx = History.graph.getNodeAttribute(History.graph.source(d), 'x');
      const sy = History.graph.getNodeAttribute(History.graph.source(d), 'y');
      const tx = History.graph.getNodeAttribute(History.graph.target(d), 'x');
      const ty = History.graph.getNodeAttribute(History.graph.target(d), 'y');

      if (
        pointInRect(sx, sy, x1 + 10, y1 + 10, x2 - 10, y2 - 10) ||
        pointInRect(tx, ty, x1 + 10, y1 + 10, x2 - 10, y2 - 10) ||
        lineIntersectsRect([sx, sy, tx, ty], [x1, y1, x2, y2])
      ) {
        selectElement("edge", d);
      }
    });

    updateGraph(History.graph); // Re-draw the graph with selections
    selectionBox.style("display", "none"); // Hide selection box
    svg.on("mousemove", null).on("mouseup", null); // Remove event listeners
    if (appSettings.scale)
      salma();
  });

});

function getBoundingBox(graph, selectedNodeIds) {
  if (selectedNodeIds.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  selectedNodeIds.forEach(nodeId => {
    let node = graph.getNodeAttributes(nodeId);
    if (node.x < minX) minX = node.x;
    if (node.y < minY) minY = node.y;
    if (node.x > maxX) maxX = node.x;
    if (node.y > maxY) maxY = node.y;
  });

  return { x: minX - appSettings.node_radius, y: minY - appSettings.node_radius, width: maxX - minX + 2 * appSettings.node_radius, height: maxY - minY + 2 * appSettings.node_radius };
}

function update(rect) {
  const handleSize = 8;
  let rectSelection = svg.select(".rect");
  // Update or create the rectangle
  if (rectSelection.empty()) {
    rectSelection = svg.append("rect").attr("class", "rect");
    if (appSettings.scale) {
      common.scaleData = {};
      selectedNode.forEach(
        nodeId => {
          const node = History.graph.getNodeAttributes(nodeId)
          common.scaleData[nodeId] =
            { id: nodeId, x: (node.x - rect.x) / rect.width, y: (node.y - rect.y) / rect.height }
        }
      )
    }
  }

  rectSelection
    .attr("x", rect.x)
    .attr("y", rect.y)
    .attr("width", rect.width)
    .attr("height", rect.height)
    .style("cursor", "move")
    .call(d3.drag().on("drag", dragRect));
  // Handle positions
  let handles = [
    { x: rect.x, y: rect.y, cursor: "nwse-resize", action: "top-left" },
    { x: rect.x + rect.width / 2, y: rect.y, cursor: "ns-resize", action: "top" },
    { x: rect.x + rect.width, y: rect.y, cursor: "nesw-resize", action: "top-right" },
    { x: rect.x + rect.width, y: rect.y + rect.height / 2, cursor: "ew-resize", action: "right" },
    { x: rect.x + rect.width, y: rect.y + rect.height, cursor: "nwse-resize", action: "bottom-right" },
    { x: rect.x + rect.width / 2, y: rect.y + rect.height, cursor: "ns-resize", action: "bottom" },
    { x: rect.x, y: rect.y + rect.height, cursor: "nesw-resize", action: "bottom-left" },
    { x: rect.x, y: rect.y + rect.height / 2, cursor: "ew-resize", action: "left" }
  ];

  // Update or create handles
  let handleSelection = svg.selectAll(".handle").data(handles);

  handleSelection
    .join("rect") // If it doesn’t exist, create it
    .attr("class", "handle")
    .attr("x", d => d.x - handleSize / 2)
    .attr("y", d => d.y - handleSize / 2)
    .attr("width", handleSize)
    .attr("height", handleSize)
    .style("cursor", d => d.cursor)
    .call(d3.drag().on("drag", handleDrag));


  moveNodes(selectedNode, rect)
}

// Drag function for moving the rectangle
function dragRect(event) {
  common.rect.x += event.dx;
  common.rect.y += event.dy;
  update(common.rect);
}

function handleDrag(event, d) {
  const rect = common.rect
  const minSize = 10; // Minimum size constraint

  let dx = event.dx, dy = event.dy;
  let newX = rect.x, newY = rect.y, newWidth = rect.width, newHeight = rect.height;

  switch (d.action) {
    case "top-left":
      newX += dx;
      newY += dy;
      newWidth -= dx;
      newHeight -= dy;
      break;
    case "top":
      newY += dy;
      newHeight -= dy;
      break;
    case "top-right":
      newY += dy;
      newWidth += dx;
      newHeight -= dy;
      break;
    case "right":
      newWidth += dx;
      break;
    case "bottom-right":
      newWidth += dx;
      newHeight += dy;
      break;
    case "bottom":
      newHeight += dy;
      break;
    case "bottom-left":
      newX += dx;
      newWidth -= dx;
      newHeight += dy;
      break;
    case "left":
      newX += dx;
      newWidth -= dx;
      break;
  }

  // Prevent width/height from going below minSize
  if (newWidth >= minSize && newHeight >= minSize) {
    rect.x = newX;
    rect.y = newY;
    rect.width = newWidth;
    rect.height = newHeight;
  } else {
    // If size is too small, adjust x/y to prevent movement
    if (newWidth < minSize) {
      if (d.action.includes("left")) rect.x = rect.x + rect.width - minSize;
      rect.width = minSize;
    }
    if (newHeight < minSize) {
      if (d.action.includes("top")) rect.y = rect.y + rect.height - minSize;
      rect.height = minSize;
    }
  }

  update(rect);

}

function salma() {
  common.rect = getBoundingBox(History.graph, selectedNode)
  if (common.rect)
    update(common.rect);
}

function moveNodes(selectedNode, rect) {
  selectedNode.forEach(nodeId => {
    History.graph.updateNodeAttributes(nodeId, attrs => {
      return {
        ...attrs,
        x: rect.x + rect.width * common.scaleData[nodeId].x,
        y: rect.y + rect.height * common.scaleData[nodeId].y
      }
    });
  })
  updateGraph(History.graph)
}


export function deselectAll() {
  svg.select('.rect').remove()
  svg.selectAll('.handle').remove()
}
