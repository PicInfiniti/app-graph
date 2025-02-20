import $ from "jquery"
import Graph from 'graphology';
import { complete, empty, path, ladder } from 'graphology-generators/classic';
import { disjointUnion } from 'graphology-operators';
import { canvas, updateGraph, History } from '../init'
import { organizeNodesInCircle } from './edit'
import { organizeNodesInLine, organizeNodesInTwoLines } from "../utils";

import { deselectAll } from "../utils";
$('#g-empty-btn').on('click', function () {
  event.preventDefault();
  let val = parseInt($("#g-empty").val())
  const graph = empty(Graph, val);
  organizeNodesInCircle(graph, svg)
  History.push(graph)
  deselectAll()
  updateGraph(History.graph)
});

$('#g-complete-btn').on('click', function () {
  event.preventDefault();
  let val = parseInt($("#g-complete").val())
  const graph = complete(Graph, val);
  organizeNodesInCircle(graph, svg)
  History.push(graph)
  deselectAll()
  updateGraph(History.graph)
});

$('#g-complete-bipartite-btn').on('click', function () {
  event.preventDefault();
  let val1 = parseInt($("#g-complete-bipartite-1").val())
  let val2 = parseInt($("#g-complete-bipartite-2").val())

  const graph = completeBipartite(Graph, val1, val2);
  organizeNodesInTwoLines(graph, svg, val1, 100)
  History.push(graph)
  deselectAll()
  updateGraph(History.graph)
});

$('#g-ladder-btn').on('click', function () {
  event.preventDefault();
  let val = parseInt($("#g-ladder").val())
  const graph = ladder(Graph, val);
  organizeNodesInTwoLines(graph, svg, val)
  History.push(graph)
  deselectAll()
  updateGraph(History.graph)
});

$('#g-path-btn').on('click', function () {
  event.preventDefault();
  let val = parseInt($("#g-path").val())
  const graph = path(Graph, val);
  organizeNodesInLine(graph, svg)
  History.push(graph)
  deselectAll()
  updateGraph(History.graph)
});

$('#g-cycle-btn').on('click', function () {
  event.preventDefault();
  let val = parseInt($("#g-cycle").val())
  const graph = cycle(Graph, val);
  organizeNodesInCircle(graph, svg)
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



