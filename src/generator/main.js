import { complete, empty, path, ladder } from "graphology-generators/classic";
import { caveman, connectedCaveman } from "graphology-generators/community";
import {
  clusters,
  erdosRenyi,
  girvanNewman,
} from "graphology-generators/random";
import {
  florentineFamilies,
  karateClub,
} from "../_graphology/generators/social";
import { krackhardtKite } from "../_graphology/generators/small";
import { Zodiac } from "./zodiac";

export class Generator {
  constructor(graphManager) {
    this.graphManager = graphManager;
    this.layout = graphManager.layout;
    this.zodiac = new Zodiac(graphManager);
  }

  empty(n) {
    this.graphManager.graph = empty(this.graphManager.graphClass, Number(n));

    this.layout.applyLayout("circle");
  }

  complete(n) {
    this.graphManager.graph = complete(this.graphManager.graphClass, Number(n));

    this.layout.applyLayout("circle");
  }

  ladder(n) {
    this.graphManager.graph = ladder(this.graphManager.graphClass, Number(n));

    this.layout.applyLayout("twoLine", { line1Count: Number(n), Y: 50 });
  }

  completeBipartite(n1, n2) {
    this.graphManager.graph = empty(
      this.graphManager.graphClass,
      Number(n1) + Number(n2),
    );
    for (let i = 0; i < Number(n1); i++) {
      for (let j = Number(n1); j < Number(n1) + Number(n2); j++) {
        this.graphManager.graph.addEdge(i, j);
      }
    }

    this.layout.applyLayout("twoLine", { line1Count: Number(n1), Y: 50 });
  }

  cycle(n) {
    this.graphManager.graph = path(this.graphManager.graphClass, Number(n));
    this.graphManager.graph.addEdge(0, Number(n) - 1);

    this.layout.applyLayout("circle");
  }

  path(n) {
    this.graphManager.graph = path(this.graphManager.graphClass, Number(n));

    this.layout.applyLayout("oneLine");
  }

  caveman(n1, n2) {
    this.graphManager.graph = caveman(
      this.graphManager.graphClass,
      Number(n1),
      Number(n2),
    );

    this.layout.applyLayout("circle");
  }

  connectedCaveman(n1, n2) {
    this.graphManager.graph = connectedCaveman(
      this.graphManager.graphClass,
      Number(n1),
      Number(n2),
    );

    this.layout.applyLayout("circle");
  }

  clusters(o, s, c) {
    this.graphManager.graph = clusters(this.graphManager.graphClass, {
      order: Number(o),
      size: Number(s),
      clusters: Number(c),
    });

    this.layout.applyLayout("circle");
  }

  erdosRenyi(o, p) {
    this.graphManager.graph = erdosRenyi(this.graphManager.graphClass, {
      order: Number(o),
      probability: Number(p),
    });

    this.layout.applyLayout("circle");
  }

  girvanNewman(n) {
    this.graphManager.graph = girvanNewman(this.graphManager.graphClass, {
      zOut: 4,
    });

    this.layout.applyLayout("circle");
  }

  krackhardtkite() {
    this.graphManager.graph = krackhardtKite(this.graphManager.graphClass);

    this.layout.applyLayout("oneLine");
  }

  florentineFamilies() {
    this.graphManager.graph = florentineFamilies(this.graphManager.graphClass);

    this.layout.applyLayout("circle");
  }

  karateClub() {
    this.graphManager.graph = karateClub(this.graphManager.graphClass);

    this.layout.applyLayout("circle");
  }
}
