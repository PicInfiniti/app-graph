import { connectedComponents } from "graphology-components";
import { type } from "jquery";

export function getComponents(graph, node) {
  // Get all connected components
  const components = connectedComponents(graph);

  // Find the component that contains the given node
  for (let component of components) {
    if (component.includes(node)) {
      return component;
    }
  }

  return null; // If node is not found in any component
}

export function getElementryMetrics(graph) {
  return {
    order: graph.order,
    size: graph.size,
    type: graph.type
  }
}
export function degreeSequesnce(graph) {
  return graph.mapNodes((node, attr) => graph.degree(node));
}
