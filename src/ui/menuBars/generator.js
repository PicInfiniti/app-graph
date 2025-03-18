$('#g-empty-btn').on('click', function (event) {
  event.preventDefault();
  let val = parseInt($("#g-empty").val())
  const graph = empty(Graph, val);
  organizeNodesInCircle(graph, canvas)
  drawGraph(graph)
});

$('#g-complete-btn').on('click', function (event) {
  event.preventDefault();
  let val = parseInt($("#g-complete").val())
  const graph = complete(Graph, val);
  History.push(graph)
  if (!appSettings.forceSimulation) {
    organizeNodesInCircle(graph, canvas)
    drawGraph(History.graph, canvas)
  } else {
    updateForce(graph, nodes, links)
    updateSimulation(simulation, nodes, links);
  }
});

$('#g-complete-bipartite-btn').on('click', function (event) {
  event.preventDefault();
  let val1 = parseInt($("#g-complete-bipartite-1").val())
  let val2 = parseInt($("#g-complete-bipartite-2").val())

  const graph = completeBipartite(Graph, val1, val2);
  organizeNodesInTwoLines(graph, canvas, val1, 100)
  drawGraph(graph, canvas)
});

$('#g-ladder-btn').on('click', function (event) {
  event.preventDefault();
  let val = parseInt($("#g-ladder").val())
  const graph = ladder(Graph, val);
  organizeNodesInTwoLines(graph, canvas, val)
  drawGraph(graph, canvas)
});

$('#g-path-btn').on('click', function (event) {
  event.preventDefault();
  let val = parseInt($("#g-path").val())
  const graph = path(Graph, val);
  organizeNodesInLine(graph, canvas)
  drawGraph(graph, canvas)
});

$('#g-cycle-btn').on('click', function (event) {
  event.preventDefault();
  let val = parseInt($("#g-cycle").val())
  const graph = cycle(Graph, val);
  organizeNodesInCircle(graph, canvas)
  drawGraph(graph, canvas)
});

$('#g-caveman-btn').on('click', function (event) {
  event.preventDefault();
  let val1 = parseInt($("#g-caveman-1").val())
  let val2 = parseInt($("#g-caveman-2").val())

  const graph = connectedCaveman(Graph, val1, val2);
  organizeNodesInCircle(graph, canvas)
  drawGraph(graph, canvas)
});

$("a").on('click', function (event) {
  event.preventDefault(); // Prevent default behavior
  var url = $(this).attr("href");
  if (url) {
    window.open(url, '_blank'); // Open in a new tab
  }
});

export function completeBipartite(GraphClass, n1, n2) {
  const graph = empty(GraphClass, n1 + n2)

  for (let i = 0; i < n1; i++) {
    for (let j = n1; j < n1 + n2; j++) {
      graph.addEdge(i, j)
    }
  }
  return graph
}

export function cycle(GraphClass, n) {
  const graph = path(GraphClass, n)

  graph.addEdge(0, n - 1)
  return graph
}



