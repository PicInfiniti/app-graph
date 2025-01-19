import graph from "../init";
import { svg, updateGraph } from "../init"

// Attach the circular layout function to the button
$("#organize-circle").on("click", organizeNodesInCircle);

function organizeNodesInCircle() {
  const radius = 200; // Radius of the circle
  const centerX = svg.node().getBoundingClientRect().width / 2;
  const centerY = svg.node().getBoundingClientRect().height / 2;
  const angleStep = -(2 * Math.PI) / graph.order;
  graph.forEachNode((id, attributes) => {
    const angle = id * angleStep - Math.PI / 2;
    graph.updateNodeAttributes(id, attr => {
      return {
        label: attr.label,
        color: attr.color,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  });

  updateGraph(); // Re-draw nodes and edges
}

