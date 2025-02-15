import $ from "jquery"
import Graph from 'graphology';
import { complete } from 'graphology-generators/classic';
import { svg, updateGraph, History } from '../init'
import { organizeNodesInCircle } from './edit'

$('#g-complete-btn').on('click', function () {
  const graph = complete(Graph, $("#g-complete").val());
  console.log(graph.nodes())
  History.push(graph)
  organizeNodesInCircle(graph, svg)
  updateGraph(graph)
});


