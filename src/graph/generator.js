import { complete, empty, path, ladder } from 'graphology-generators/classic';
import { connectedCaveman } from 'graphology-generators/community';

export class Generator {
  constructor() {

  }

  init() {

  }

  completeBipartite(GraphClass, n1, n2) {
    const graph = empty(GraphClass, n1 + n2)

    for (let i = 0; i < n1; i++) {
      for (let j = n1; j < n1 + n2; j++) {
        graph.addEdge(i, j)
      }
    }
    return graph
  }

  cycle(GraphClass, n) {
    const graph = path(GraphClass, n)

    graph.addEdge(0, n - 1)
    return graph
  }

}




