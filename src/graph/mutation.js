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




