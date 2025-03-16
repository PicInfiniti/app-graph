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


