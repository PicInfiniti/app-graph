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
    this.settings = graphManager.settings;
    this.layout = graphManager.layout;
    this.zodiac = new Zodiac(graphManager);
  }

  empty(n) {
    this.graphManager.graph = empty(
      this.graphManager.graphClass[this.settings.type],
      +n,
    );

    this.syncColor();
    this.layout.applyLayout("circle");
  }

  complete(n) {
    this.graphManager.graph = complete(
      this.graphManager.graphClass[this.settings.type],
      +n,
    );
    this.syncColor();
    this.layout.applyLayout("circle");
  }

  ladder(n) {
    this.graphManager.graph = ladder(
      this.graphManager.graphClass[this.settings.type],
      +n,
    );
    this.syncColor();
    this.layout.applyLayout("twoLine", { line1Count: +n, Y: 50 });
  }

  completeBipartite(n1, n2) {
    this.graphManager.graph = empty(
      this.graphManager.graphClass[this.settings.type],
      +n1 + +n2,
    );
    for (let i = 0; i < +n1; i++) {
      for (let j = +n1; j < Number(n1) + +n2; j++) {
        this.graphManager.graph.addEdge(i, j);
      }
    }

    this.syncColor();
    this.layout.applyLayout("twoLine", { line1Count: +n1, Y: 50 });
  }

  cycle(n) {
    this.graphManager.graph = path(
      this.graphManager.graphClass[this.settings.type],
      +n,
    );
    this.graphManager.graph.addEdge(0, +n - 1);

    this.syncColor();
    this.layout.applyLayout("circle");
  }

  path(n) {
    this.graphManager.graph = path(
      this.graphManager.graphClass[this.settings.type],
      +n,
    );
    this.syncColor();
    this.layout.applyLayout("oneLine");
  }

  caveman(n1, n2) {
    this.graphManager.graph = caveman(
      this.graphManager.graphClass[this.settings.type],
      +n1,
      +n2,
    );
    this.syncColor();
    this.layout.applyLayout("circle");
  }

  connectedCaveman(n1, n2) {
    this.graphManager.graph = connectedCaveman(
      this.graphManager.graphClass[this.settings.type],
      +n1,
      +n2,
    );
    this.syncColor();
    this.layout.applyLayout("circle");
  }

  clusters(o, s, c) {
    this.graphManager.graph = clusters(
      this.graphManager.graphClass[this.settings.type],
      {
        order: +o < 2 ? 2 : +o,
        size: +s < 2 ? 2 : +s,
        clusters: +c < 2 ? 2 : +c,
      },
    );
    this.syncColor();
    this.layout.applyLayout("random");
  }

  erdosRenyi(o, p) {
    this.graphManager.graph = erdosRenyi(
      this.graphManager.graphClass[this.settings.type],
      {
        order: +o,
        probability: +p > 1 ? 1 : +p,
      },
    );
    this.syncColor();
    this.layout.applyLayout("circle");
  }

  girvanNewman(n) {
    this.graphManager.graph = girvanNewman(
      this.graphManager.graphClass[this.settings.type],
      {
        zOut: 4,
      },
    );
    this.syncColor();
    this.layout.applyLayout("circle");
  }

  krackhardtkite() {
    this.graphManager.graph = krackhardtKite(
      this.graphManager.graphClass[this.settings.type],
    );
    this.syncColor();
    this.layout.applyLayout("oneLine");
  }

  florentineFamilies() {
    this.graphManager.graph = florentineFamilies(
      this.graphManager.graphClass[this.settings.type],
    );
    this.syncColor();
    this.layout.applyLayout("circle");
  }

  karateClub() {
    this.graphManager.graph = karateClub(
      this.graphManager.graphClass[this.settings.type],
    );
    this.syncColor();
    this.layout.applyLayout("circle");
  }

  syncColor() {
    this.graphManager.graph.updateEachNodeAttributes((node, attr) => {
      return {
        ...attr,
        color: this.settings.node_color,
        labelColor: this.settings.label_color,
        stroke: this.settings.stroke_color,
      };
    });

    this.graphManager.graph.updateEachEdgeAttributes((edge, attr) => {
      return {
        ...attr,
        color: this.settings.edge_color,
        labelColor: this.settings.label_color,
      };
    });
  }
}
