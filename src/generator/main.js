import {
  complete,
  empty,
  path,
  ladder,
} from "../_graphology/generators/classic/";
import { caveman, connectedCaveman } from "graphology-generators/community";
import {
  clusters,
  erdosRenyi,
  girvanNewman,
} from "graphology-generators/random";
import {
  florentineFamilies,
  karateClub,
} from "../_graphology/generators/random/";
import { krackhardtKite } from "../_graphology/generators/small";
import { Zodiac } from "./zodiac";
import {
  reverse,
  toDirected,
  toUndirected,
  toMixed,
} from "graphology-operators";

export class Generator {
  constructor(graphManager) {
    this.graphManager = graphManager;
    this.settings = graphManager.settings;
    this.layout = graphManager.layout;
    this.zodiac = new Zodiac(graphManager);
  }

  generateAndLayout(createFn, layoutName, layoutParams = {}) {
    const graph = createFn(this.settings.type);
    this.graphManager.push(graph);
    this.layout.applyLayout(layoutName, layoutParams);
  }

  empty(n) {
    this.generateAndLayout(
      (type) => empty(this.graphManager.graphClass, Number(n), type),
      "circle",
    );
  }

  complete(n) {
    this.generateAndLayout(
      (type) => complete(this.graphManager.graphClass, Number(n), type),
      "circle",
    );
  }

  ladder(n) {
    this.generateAndLayout(
      (type) => ladder(this.graphManager.graphClass, Number(n), type),
      "twoLine",
      { line1Count: Number(n), Y: 50 },
    );
  }

  completeBipartite(n1, n2) {
    this.generateAndLayout(
      (type) => {
        const graph = empty(
          this.graphManager.graphClass,
          Number(n1) + Number(n2),
          type,
        );
        for (let i = 0; i < Number(n1); i++) {
          for (let j = Number(n1); j < Number(n1) + Number(n2); j++) {
            graph.addEdge(i, j);
          }
        }
        return graph;
      },
      "twoLine",
      { line1Count: Number(n1), Y: 50 },
    );
  }

  cycle(n) {
    this.generateAndLayout((type) => {
      const graph = path(this.graphManager.graphClass, Number(n), type);
      graph.addEdge(0, Number(n) - 1);
      return graph;
    }, "circle");
  }

  path(n) {
    this.generateAndLayout(
      (type) => path(this.graphManager.graphClass, Number(n), type),
      "oneLine",
    );
  }

  caveman(n1, n2) {
    this.generateAndLayout(
      (type) =>
        caveman(this.graphManager.graphClass, Number(n1), Number(n2), type),
      "circle",
    );
  }

  connectedCaveman(n1, n2) {
    this.generateAndLayout(
      (type) =>
        connectedCaveman(
          this.graphManager.graphClass,
          Number(n1),
          Number(n2),
          type,
        ),
      "circle",
    );
  }

  clusters(o, s, c) {
    this.generateAndLayout(
      (type) =>
        clusters(this.graphManager.graphClass, {
          order: Number(o),
          size: Number(s),
          clusters: Number(c),
          type,
        }),
      "circle",
    );
  }

  erdosRenyi(o, p) {
    this.generateAndLayout(
      (type) =>
        erdosRenyi(this.graphManager.graphClass, {
          order: Number(o),
          probability: Number(p),
          type,
        }),
      "circle",
    );
  }

  girvanNewman() {
    this.generateAndLayout(
      (type) => girvanNewman(this.graphManager.graphClass, { zOut: 4, type }),
      "circle",
    );
  }

  krackhardtkite() {
    this.generateAndLayout(
      (type) => krackhardtKite(this.graphManager.graphClass, type),
      "oneLine",
    );
  }

  florentineFamilies() {
    this.generateAndLayout(
      (type) => florentineFamilies(this.graphManager.graphClass, type),
      "circle",
    );
  }

  karateClub() {
    this.generateAndLayout(
      (type) => karateClub(this.graphManager.graphClass, type),
      "circle",
    );
  }
}
