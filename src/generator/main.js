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
