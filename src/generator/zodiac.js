import { Graph } from "../utils/classes"

export class Zodiac {
  constructor(graphManager) {
    this.graphManager = graphManager;
    this.layout = graphManager.layout;
  }

  aries() {
    this.graphManager.push(aries());
    this.layout.applyLayout('keep');
  }

  taurus() {
    this.graphManager.push(taurus());
    this.layout.applyLayout('keep');
  }

  gemini() {
    this.graphManager.push(gemini());
    this.layout.applyLayout('keep');
  }

  cancer() {
    this.graphManager.push(cancer());
    this.layout.applyLayout('keep');
  }

  leo() {
    this.graphManager.push(leo());
    this.layout.applyLayout('keep');
  }

  virgo() {
    this.graphManager.push(virgo());
    this.layout.applyLayout('keep');
  }

  libra() {
    this.graphManager.push(libra());
    this.layout.applyLayout('keep');
  }

  scorpio() {
    this.graphManager.push(scorpio());
    this.layout.applyLayout('keep');
  }

  sagittarius() {
    this.graphManager.push(sagittarius());
    this.layout.applyLayout('keep');
  }

  capricorn() {
    this.graphManager.push(capricorn());
    this.layout.applyLayout('keep');
  }

  aquarius() {
    this.graphManager.push(aquarius());
    this.layout.applyLayout('keep');
  }

  pisces() {
    this.graphManager.push(pisces());
    this.layout.applyLayout('keep');
  }
}

function size(magnitude, baseSize = 40) {
  return baseSize * Math.pow(0.8, magnitude);
}

// -- ARIES --
function aries() {
  const graph = new Graph();

  const stars = [
    { id: 0, label: 'Botein', x: 100, y: 100, magnitude: 4.35 },
    { id: 1, label: 'Hamal', x: 180, y: 180, magnitude: 2.00 },
    { id: 2, label: 'Sheratan', x: 250, y: 200, magnitude: 2.64 },
    { id: 3, label: 'Mesarthim', x: 280, y: 250, magnitude: 3.86 }
  ];

  stars.forEach(star => {
    graph.addNode(star.id, {
      label: star.label,
      x: star.x,
      y: star.y,
      magnitude: star.magnitude,
      size: size(star.magnitude)
    });
  });

  const edges = [
    [0, 1], // Botein → Hamal
    [1, 2], // Hamal → Sheratan
    [2, 3]  // Sheratan → Mesarthim
  ];

  edges.forEach(([source, target]) => {
    graph.addEdge(source, target);
  });

  return graph;
}



// -- TAURUS --
export function taurus() {
  const graph = new Graph();
  const stars = [
    { id: 0, label: 'Aldebaran', x: 200, y: 100 },
    { id: 1, label: 'Epsilon Tauri', x: 170, y: 130 },
    { id: 2, label: 'Delta Tauri', x: 150, y: 160 },
    { id: 3, label: 'Gamma Tauri', x: 230, y: 130 },
    { id: 4, label: 'Theta Tauri', x: 250, y: 160 }
  ];
  stars.forEach(star => graph.addNode(star.id, { ...star }));
  [[1, 0], [2, 1], [0, 3], [3, 4]].forEach(([s, t]) => graph.addEdge(s, t));
  return graph;
}

// -- GEMINI --
export function gemini() {
  const graph = new Graph();
  const stars = [
    { id: 0, label: 'Pollux', x: 200, y: 100 },
    { id: 1, label: 'Wasat', x: 200, y: 160 },
    { id: 2, label: 'Mebsuta', x: 200, y: 220 },
    { id: 3, label: 'Castor', x: 300, y: 100 },
    { id: 4, label: 'Tejat', x: 300, y: 160 },
    { id: 5, label: 'Mekbuda', x: 300, y: 220 }
  ];
  stars.forEach(star => graph.addNode(star.id, { ...star }));
  [[0, 1], [1, 2], [3, 4], [4, 5]].forEach(([s, t]) => graph.addEdge(s, t));
  return graph;
}

// -- CANCER --
export function cancer() {
  const graph = new Graph();
  const stars = [
    { id: 0, label: 'Tarf', x: 200, y: 100 },
    { id: 1, label: 'Asellus Australis', x: 170, y: 160 },
    { id: 2, label: 'Asellus Borealis', x: 230, y: 160 },
    { id: 3, label: 'Acubens', x: 200, y: 220 }
  ];
  stars.forEach(star => graph.addNode(star.id, { ...star }));
  [[0, 1], [0, 2], [1, 3], [2, 3]].forEach(([s, t]) => graph.addEdge(s, t));
  return graph;
}

// -- LEO --
export function leo() {
  const graph = new Graph();
  const stars = [
    { id: 0, label: 'Regulus', x: 200, y: 100 },
    { id: 1, label: 'Algieba', x: 240, y: 140 },
    { id: 2, label: 'Zosma', x: 280, y: 180 },
    { id: 3, label: 'Denebola', x: 320, y: 220 },
    { id: 4, label: 'Chertan', x: 260, y: 220 }
  ];
  stars.forEach(star => graph.addNode(star.id, { ...star }));
  [[0, 1], [1, 2], [2, 3], [2, 4]].forEach(([s, t]) => graph.addEdge(s, t));
  return graph;
}

// -- VIRGO --
export function virgo() {
  const graph = new Graph();
  const stars = [
    { id: 0, label: 'Spica', x: 200, y: 100 },
    { id: 1, label: 'Zavijava', x: 240, y: 140 },
    { id: 2, label: 'Porrima', x: 220, y: 180 },
    { id: 3, label: 'Vindemiatrix', x: 180, y: 220 }
  ];
  stars.forEach(star => graph.addNode(star.id, { ...star }));
  [[0, 1], [1, 2], [2, 3]].forEach(([s, t]) => graph.addEdge(s, t));
  return graph;
}

// -- LIBRA --
export function libra() {
  const graph = new Graph();
  const stars = [
    { id: 0, label: 'Zubenelgenubi', x: 200, y: 100 },
    { id: 1, label: 'Zubeneschamali', x: 240, y: 140 },
    { id: 2, label: 'Brachium', x: 160, y: 140 }
  ];
  stars.forEach(star => graph.addNode(star.id, { ...star }));
  [[0, 1], [0, 2]].forEach(([s, t]) => graph.addEdge(s, t));
  return graph;
}

// -- SCORPIO --
export function scorpio() {
  const graph = new Graph();
  const stars = [
    { id: 0, label: 'Antares', x: 200, y: 100 },
    { id: 1, label: 'Shaula', x: 250, y: 140 },
    { id: 2, label: 'Sargas', x: 230, y: 180 },
    { id: 3, label: 'Dschubba', x: 170, y: 160 },
    { id: 4, label: 'Lesath', x: 270, y: 200 }
  ];
  stars.forEach(star => graph.addNode(star.id, { ...star }));
  [[0, 3], [3, 1], [1, 4], [0, 2]].forEach(([s, t]) => graph.addEdge(s, t));
  return graph;
}

// -- SAGITTARIUS --
export function sagittarius() {
  const graph = new Graph();
  const stars = [
    { id: 0, label: 'Kaus Australis', x: 200, y: 100 },
    { id: 1, label: 'Kaus Media', x: 240, y: 140 },
    { id: 2, label: 'Kaus Borealis', x: 200, y: 180 },
    { id: 3, label: 'Nunki', x: 160, y: 140 }
  ];
  stars.forEach(star => graph.addNode(star.id, { ...star }));
  [[0, 1], [1, 2], [2, 3]].forEach(([s, t]) => graph.addEdge(s, t));
  return graph;
}

// -- CAPRICORN --
export function capricorn() {
  const graph = new Graph();
  const stars = [
    { id: 0, label: 'Dabih', x: 200, y: 100 },
    { id: 1, label: 'Algedi', x: 240, y: 140 },
    { id: 2, label: 'Nashira', x: 200, y: 180 },
    { id: 3, label: 'Deneb Algedi', x: 160, y: 140 }
  ];
  stars.forEach(star => graph.addNode(star.id, { ...star }));
  [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(([s, t]) => graph.addEdge(s, t));
  return graph;
}

// -- AQUARIUS --
export function aquarius() {
  const graph = new Graph();
  const stars = [
    { id: 0, label: 'Sadalmelik', x: 200, y: 100 },
    { id: 1, label: 'Sadalsuud', x: 240, y: 140 },
    { id: 2, label: 'Skat', x: 200, y: 180 },
    { id: 3, label: 'Albali', x: 160, y: 140 }
  ];
  stars.forEach(star => graph.addNode(star.id, { ...star }));
  [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(([s, t]) => graph.addEdge(s, t));
  return graph;
}

// -- PISCES --
export function pisces() {
  const graph = new Graph();
  const stars = [
    { id: 0, label: 'Alrescha', x: 200, y: 100 },
    { id: 1, label: 'Fumalsamakah', x: 160, y: 140 },
    { id: 2, label: 'Torcularis Septentrionalis', x: 240, y: 140 },
    { id: 3, label: 'Revati', x: 200, y: 180 }
  ];
  stars.forEach(star => graph.addNode(star.id, { ...star }));
  [[0, 1], [0, 2], [1, 3], [2, 3]].forEach(([s, t]) => graph.addEdge(s, t));
  return graph;
}
