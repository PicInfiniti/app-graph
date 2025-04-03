import { Graph } from '../utils/classes';
import constellationData from './constellations.json';

export class ConstellationData {
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
      desc: {
        name: star.label,
        magnitude: star.magnitude,
        RA: wrapTimeString(star.ra),
        DEC: star.dec
      }
    });
  });

  edges.forEach(([source, target]) => {
    graph.mergeEdge(source, target);
  });

  return graph;
}

function wrapTimeString(timeStr) {
  let [h = 0, m = 0, s = 0] = timeStr.split(" ").map(Number);
  s = s % 60;
  m = m % 60;
  h = h % 24;

  // Format with leading zeros
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const ss = s.toFixed(1).padStart(4, '0'); // e.g., "04.3"

  return [hh, mm, ss].join(' ');
}

