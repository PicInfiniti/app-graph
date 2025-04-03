import { Graph } from '../utils/classes';
import constellationData from './constellations.json';

export class Zodiac {
  constructor(graphManager) {
    this.graphManager = graphManager;
    this.layout = graphManager.layout;
  }

  load(name) {
    const data = constellationData[name.toLowerCase()];
    if (data) {
      const graph = createConstellation(name, data.stars, data.edges);
      this.graphManager.push(graph);
      this.layout.applyLayout('rotate180');
    } else {
      console.warn(`Constellation "${name}" not found.`);
    }
  }


  // Named convenience methods for each zodiac sign
  aries() {
    this.load('aries');
  }

  taurus() {
    this.load('taurus');
  }

  gemini() {
    this.load('gemini');
  }

  cancer() {
    this.load('cancer');
  }

  leo() {
    this.load('leo');
  }

  virgo() {
    this.load('virgo');
  }

  libra() {
    this.load('libra');
  }

  scorpius() {
    this.load('scorpius');
  }

  ophiuchus() {
    this.load('ophiuchus');
  }

  sagittarius() {
    this.load('sagittarius');
  }

  capricornus() {
    this.load('capricornus');
  }

  aquarius() {
    this.load('aquarius');
  }

  pisces() {
    this.load('pisces');
  }

  // Bonus: Orion, if you'd like to include non-zodiac constellations
  orion() {
    this.load('orion');
  }
}

// Helper
function size(magnitude = 3) {
  return Math.pow(0.8, magnitude);
}

function convertRAtoDecimal(raStr) {
  const [h, m, s] = raStr.split(" ").map(parseFloat);
  return (h + m / 60 + s / 3600) * 15;
}

function convertDECtoDecimal(decStr) {
  const sign = decStr.trim().startsWith("-") ? -1 : 1;
  const parts = decStr.trim().replace("+", "").replace("-", "").split(" ").map(parseFloat);
  const [d, m, s] = parts;
  return sign * (d + m / 60 + s / 3600);
}

function createConstellation(name, stars, edges) {
  const graph = new Graph();

  stars.forEach(star => {
    const ra = convertRAtoDecimal(star.ra);
    const dec = convertDECtoDecimal(star.dec);

    graph.addNode(star.id, {
      label: star.label,
      x: ra,
      y: dec,
      magnitude: star.magnitude,
      size: size(star.magnitude),
    });
  });

  edges.forEach(([source, target]) => {
    graph.mergeEdge(source, target);
  });

  return graph;
}
