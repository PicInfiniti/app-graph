import $ from "jquery"
import Graph from 'graphology';
import { complete, empty, path, ladder } from 'graphology-generators/classic';
import { svg, updateGraph, History } from '../init'
import { organizeNodesInCircle } from './edit'
import { organizeNodesInLine, organizeNodesInTwoLines } from "../utils";


$('#g-empty-btn').on('click', function () {
  event.preventDefault();
  let val = parseInt($("#g-empty").val())
  const graph = empty(Graph, val);
  History.push(graph)
  organizeNodesInCircle(graph, svg)
  updateGraph(graph)
});

$('#g-complete-btn').on('click', function () {
  event.preventDefault();
  let val = parseInt($("#g-complete").val())
  const graph = complete(Graph, val);
  History.push(graph)
  organizeNodesInCircle(graph, svg)
  updateGraph(graph)
});


$('#g-ladder-btn').on('click', function () {
  event.preventDefault();
  let val = parseInt($("#g-ladder").val())
  const graph = ladder(Graph, val);
  History.push(graph)
  organizeNodesInTwoLines(graph, svg, val)
  updateGraph(graph)
});

$('#g-path-btn').on('click', function () {
  event.preventDefault();
  let val = parseInt($("#g-path").val())
  const graph = path(Graph, val);
  History.push(graph)
  organizeNodesInLine(graph, svg)
  updateGraph(graph)
});

$("a").on('click', function (event) {
  event.preventDefault(); // Prevent default behavior
  var url = $(this).attr("href");
  if (url) {
    window.open(url, '_blank'); // Open in a new tab
  }
});
