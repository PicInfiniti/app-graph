import { Graph } from '../utils/classes';
import { complete, empty, path, ladder } from 'graphology-generators/classic';
import { caveman, connectedCaveman } from 'graphology-generators/community';
import { clusters, erdosRenyi, girvanNewman } from 'graphology-generators/random';
import { florentineFamilies, krackhardtKite, karateClub } from '../utils/generatorFunctions';
import { Zodiac } from './zodiac';

export class Generator {
  constructor(graphManager) {
    this.graphManager = graphManager
    this.layout = graphManager.layout
    this.zodiac = new Zodiac(graphManager)
  }

  empty(n) {
    this.graphManager.push(empty(Graph, Number(n)))
    this.layout.applyLayout('circle')
  }

  complete(n) {
    this.graphManager.push(complete(Graph, Number(n)))
    this.layout.applyLayout('circle')
  }

  ladder(n) {
    this.graphManager.push(ladder(Graph, Number(n)))
    this.layout.applyLayout('twoLine', { line1Count: Number(n), Y: 50 })
  }

  completeBipartite(n1, n2) {
    const graph = empty(Graph, Number(n1) + Number(n2))
    for (let i = 0; i < Number(n1); i++) {
      for (let j = Number(n1); j < Number(n1) + Number(n2); j++) {
        graph.addEdge(i, j)
      }
    }

    this.graphManager.push(graph)
    this.layout.applyLayout('twoLine', { line1Count: Number(n1), Y: 50 })
  }

  cycle(n) {
    this.graphManager.push(path(Graph, Number(n)))
    this.graphManager.graph.addEdge(0, Number(n) - 1)
    this.layout.applyLayout('circle')
  }

  path(n) {
    this.graphManager.push(path(Graph, Number(n)))
    this.layout.applyLayout('oneLine')
  }
  caveman(n1, n2) {
    this.graphManager.push(caveman(Graph, Number(n1), Number(n2)))
    this.layout.applyLayout('circle')
  }
  connectedCaveman(n1, n2) {
    this.graphManager.push(connectedCaveman(Graph, Number(n1), Number(n2)))
    this.layout.applyLayout('circle')
  }

  clusters(o, s, c) {
    const graph = clusters(Graph, {
      order: Number(o),
      size: Number(s),
      clusters: Number(c)
    });
    this.graphManager.push(graph)
    this.layout.applyLayout('circle')
  }

  erdosRenyi(o, p) {
    const graph = erdosRenyi(Graph, {
      order: Number(o),
      probability: Number(p)
    });
    this.graphManager.push(graph)
    this.layout.applyLayout('circle')
  }

  girvanNewman(n) {
    const graph = girvanNewman(Graph, { zOut: 4 });
    this.graphManager.push(graph)
    this.layout.applyLayout('circle')
  }

  krackhardtkite() {
    const graph = krackhardtKite(Graph);
    this.graphManager.push(graph)
    this.layout.applyLayout('oneLine')
  }

  florentineFamilies() {
    const graph = florentineFamilies(Graph);
    this.graphManager.push(graph)
    this.layout.applyLayout('circle')
  }

  karateClub() {
    const graph = karateClub(Graph);
    this.graphManager.push(graph)
    this.layout.applyLayout('circle')
  }
}

export function aries() {
  const graph = new Graph();

  // Define nodes (stars) with id, label, and position
  const stars = [
    { id: 0, label: 'Hamal', x: 100, y: 100 },
    { id: 1, label: 'Sheratan', x: 150, y: 130 },
    { id: 2, label: 'Mesarthim', x: 180, y: 160 },
  ];

  // Add nodes to the graph
  stars.forEach(star => {
    graph.addNode(star.id, {
      label: star.label,
      x: star.x,
      y: star.y
    });
  });

  // Define edges (connections between stars by id)
  const edges = [
    [0, 1],
    [1, 2]
  ];

  edges.forEach(([source, target]) => {
    graph.addEdge(source, target);
  });

  return graph;
}


export function taurus() {
  const graph = new Graph();

  // Define main stars of Taurus (Hyades + Aldebaran)
  const stars = [
    { id: 0, label: 'Aldebaran', x: 200, y: 100 },
    { id: 1, label: 'Epsilon Tauri', x: 170, y: 130 },
    { id: 2, label: 'Delta Tauri', x: 150, y: 160 },
    { id: 3, label: 'Gamma Tauri', x: 230, y: 130 },
    { id: 4, label: 'Theta Tauri', x: 250, y: 160 }
  ];

  // Add nodes
  stars.forEach(star => {
    graph.addNode(star.id, {
      label: star.label,
      x: star.x,
      y: star.y
    });
  });

  // Define edges to form the V-shape
  const edges = [
    [1, 0],
    [2, 1],
    [0, 3],
    [3, 4]
  ];

  edges.forEach(([source, target]) => {
    graph.addEdge(source, target);
  });

  return graph;
}
