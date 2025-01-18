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
    const angle = getMultiCharIndex(id) * angleStep - Math.PI / 2;
    graph.updateNodeAttributes(id, attr => {
      return {
        color: attr.color,
        x: 2 * radius + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  });

  updateGraph(); // Re-draw nodes and edges
}

function getMultiCharIndex(label) {
  const alphabetSize = 26;
  let index = 0;

  for (let i = 0; i < label.length; i++) {
    const charIndex = label.charCodeAt(i) - 'a'.charCodeAt(0);
    index = index * alphabetSize + charIndex;
  }

  return index;
}


