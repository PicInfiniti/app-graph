import $ from "jquery"
import { UndirectedGraph } from 'graphology';
import { complete, empty, path, ladder } from 'graphology-generators/classic';
import { canvas, updateGraph, History } from '../init'
import { organizeNodesInCircle } from './edit'
import { organizeNodesInLine, organizeNodesInTwoLines } from "../utils";
import { deselectAll } from "../utils";

$('#g-empty-btn').on('click', function (event) {
  event.preventDefault();
  let val = parseInt($("#g-empty").val())
  const graph = empty(UndirectedGraph, val);
  organizeNodesInCircle(graph, canvas)
  History.push(graph)
  deselectAll()
  updateGraph(History.graph)
});

$('#g-complete-btn').on('click', function (event) {
  event.preventDefault();
  let val = parseInt($("#g-complete").val())
  const graph = complete(UndirectedGraph, val);
  organizeNodesInCircle(graph, canvas)
  History.push(graph)
  deselectAll()
  updateGraph(History.graph)
});

$('#g-complete-bipartite-btn').on('click', function (event) {
  event.preventDefault();
  let val1 = parseInt($("#g-complete-bipartite-1").val())
  let val2 = parseInt($("#g-complete-bipartite-2").val())

  const graph = completeBipartite(UndirectedGraph, val1, val2);
  organizeNodesInTwoLines(graph, canvas, val1, 100)
  History.push(graph)
  deselectAll()
  updateGraph(History.graph)
});

$('#g-ladder-btn').on('click', function (event) {
  event.preventDefault();
  let val = parseInt($("#g-ladder").val())
  const graph = ladder(UndirectedGraph, val);
  organizeNodesInTwoLines(graph, canvas, val)
  History.push(graph)
  deselectAll()
  updateGraph(History.graph)
});

$('#g-path-btn').on('click', function (event) {
  event.preventDefault();
  let val = parseInt($("#g-path").val())
  const graph = path(UndirectedGraph, val);
  organizeNodesInLine(graph, canvas)
  History.push(graph)
  deselectAll()
  updateGraph(History.graph)
});

$('#g-cycle-btn').on('click', function (event) {
  event.preventDefault();
  let val = parseInt($("#g-cycle").val())
  const graph = cycle(UndirectedGraph, val);
  organizeNodesInCircle(graph, canvas)
  History.push(graph)
  deselectAll()
  updateGraph(History.graph)
});

$("a").on('click', function (event) {
  event.preventDefault(); // Prevent default behavior
  var url = $(this).attr("href");
  if (url) {
    window.open(url, '_blank'); // Open in a new tab
  }
});

function completeBipartite(GraphClass, n1, n2) {
  const graph = empty(GraphClass, n1 + n2)

  for (let i = 0; i < n1; i++) {
    for (let j = n1; j < n1 + n2; j++) {
      graph.addEdge(i, j)
    }
  }
  return graph

}

function cycle(GraphClass, n) {
  const graph = path(GraphClass, n)
  graph.addEdge(0, n - 1)
  return graph

}



