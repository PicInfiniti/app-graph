import { Graph } from "../utils/classes";

// Helper
function size(magnitude = 3) {
  return Math.pow(0.8, magnitude);
}

function createConstellation(name, stars, edges) {
  const graph = new Graph();

  stars.forEach(star => {
    const x = star.ra ?? star.x;
    const y = star.dec ?? star.y;

    graph.addNode(star.id, {
      label: star.label,
      x,
      y,
      magnitude: star.magnitude,
      size: size(star.magnitude),
    });
  });

  edges.forEach(([source, target]) => {
    graph.mergeEdge(source, target);
  });

  return graph;
}

// ---------------- Constellations ----------------
export function aries() {
  const stars = [
    { id: 0, label: 'Hamal', ra: 2.119 * 15, dec: 23.46, magnitude: 2.00 },
    { id: 1, label: 'Sheratan', ra: 1.887 * 15, dec: 20.81, magnitude: 2.64 },
    { id: 2, label: 'Mesarthim', ra: 1.911 * 15, dec: 19.73, magnitude: 3.86 },
    { id: 3, label: 'Boteinri)', ra: 2.666 * 15, dec: 20.74, magnitude: 4.35 },
    { id: 4, label: 'Epsilon', ra: 2.75 * 15, dec: 21.03, magnitude: 4.63 },
    { id: 5, label: 'Zeta', ra: 2.1 * 15, dec: 21.13, magnitude: 4.89 },
    { id: 6, label: 'Eta', ra: 2.3 * 15, dec: 22.84, magnitude: 5.23 },
    { id: 7, label: '41', ra: 2.721 * 15, dec: 27.26, magnitude: 3.61 },
    { id: 8, label: 'Pi', ra: 2.97 * 15, dec: 17.35, magnitude: 5.21 },
    { id: 9, label: 'Rho3', ra: 2.85 * 15, dec: 18.6, magnitude: 5.63 }
  ];

  const edges = [
    [0, 1],  // Hamal → Sheratan
    [1, 2],  // Sheratan → Mesarthim
    [0, 3],  // Hamal → Botein
    [0, 7],  // Hamal → 41 Ari
    [3, 4],  // Botein → Epsilon Ari
    [4, 8],  // Epsilon → Pi Ari
    [8, 9],  // Pi Ari → Rho3 Ari
    [0, 5],  // Hamal → Zeta Ari (not traditionally connected but close)
    [0, 6]   // Hamal → Eta Ari (optional for fuller star map)
  ];

  return createConstellation('Aries', stars, edges);
}

export function taurus() {
  const stars = [
    // Main stars
    { id: 0, label: 'Aldebaran', ra: 4.598 * 15, dec: 16.51, magnitude: 0.87 },
    { id: 1, label: 'Elnath)', ra: 5.438 * 15, dec: 28.61, magnitude: 1.65 },
    { id: 2, label: 'Zeta', ra: 5.627 * 15, dec: 21.14, magnitude: 3.00 },
    { id: 3, label: 'Theta1', ra: 4.476 * 15, dec: 15.63, magnitude: 3.84 },
    { id: 4, label: 'Theta2', ra: 4.483 * 15, dec: 15.87, magnitude: 3.41 },
    { id: 5, label: 'Gamma', ra: 4.349 * 15, dec: 15.97, magnitude: 3.65 },
    { id: 6, label: 'Delta1', ra: 4.43 * 15, dec: 17.93, magnitude: 3.77 },
    { id: 7, label: 'Delta2', ra: 4.457 * 15, dec: 17.88, magnitude: 4.80 },
    { id: 8, label: 'Epsilon', ra: 4.35 * 15, dec: 19.18, magnitude: 3.53 },
    { id: 9, label: 'Kappa1', ra: 4.491 * 15, dec: 22.28, magnitude: 4.22 },
    { id: 10, label: 'Lambda', ra: 4.697 * 15, dec: 12.01, magnitude: 3.47 },

    // Pleiades (M45) cluster
    { id: 11, label: 'Alcyone', ra: 3.792 * 15, dec: 24.11, magnitude: 2.87 },
    { id: 12, label: 'Atlas', ra: 3.633 * 15, dec: 24.05, magnitude: 3.62 },
    { id: 13, label: 'Electra', ra: 3.757 * 15, dec: 24.11, magnitude: 3.70 },
    { id: 14, label: 'Maia', ra: 3.720 * 15, dec: 24.37, magnitude: 3.87 },
    { id: 15, label: 'Merope', ra: 3.721 * 15, dec: 23.95, magnitude: 4.14 },
    { id: 16, label: 'Taygeta', ra: 3.721 * 15, dec: 24.47, magnitude: 4.30 },
    { id: 17, label: 'Pleione', ra: 3.767 * 15, dec: 24.13, magnitude: 5.05 },
    { id: 18, label: 'Celaeno', ra: 3.738 * 15, dec: 24.13, magnitude: 5.45 }
  ];

  const edges = [
    // Hyades "V" face
    [0, 3], [3, 4], [4, 5], [5, 6], [6, 7], [5, 8], [8, 9], [5, 0],

    // Horns
    [0, 2], [2, 1],

    // Lower jaw / neck
    [0, 10],

    // Pleiades cluster
    [11, 12], [11, 13], [11, 14], [11, 15], [11, 16], [11, 17], [11, 18]
  ];

  return createConstellation('Taurus', stars, edges);
}


export function gemini() {
  const stars = [
    { id: 0, label: 'Pollux', ra: 7.755 * 15, dec: 28.03, magnitude: 1.14 },
    { id: 1, label: 'Castor', ra: 7.576 * 15, dec: 31.89, magnitude: 1.58 },
    { id: 2, label: 'Alhena', ra: 6.628 * 15, dec: 16.39, magnitude: 1.93 },
    { id: 3, label: 'Wasat', ra: 7.336 * 15, dec: 21.98, magnitude: 3.53 },
    { id: 4, label: 'Mebsuta', ra: 6.753 * 15, dec: 25.13, magnitude: 3.06 },
    { id: 5, label: 'Zetam', ra: 7.034 * 15, dec: 20.57, magnitude: 3.93 },
    { id: 6, label: 'Kappam', ra: 7.739 * 15, dec: 24.4, magnitude: 3.57 },
    { id: 7, label: 'Mum', ra: 6.377 * 15, dec: 22.51, magnitude: 2.88 },
    { id: 8, label: 'Etam', ra: 6.482 * 15, dec: 22.51, magnitude: 3.28 },
    { id: 9, label: 'Num', ra: 6.23 * 15, dec: 20.42, magnitude: 4.14 },
    { id: 10, label: 'Xim', ra: 6.94 * 15, dec: 12.57, magnitude: 3.35 },
    { id: 11, label: 'Taum', ra: 7.185 * 15, dec: 30.24, magnitude: 4.42 },
    { id: 12, label: '1m', ra: 6.364 * 15, dec: 25.13, magnitude: 4.15 },
    { id: 13, label: 'Thetam', ra: 6.523 * 15, dec: 33.96, magnitude: 3.59 }
  ];

  const edges = [
    // Twin lines from heads to feet
    [1, 4], [4, 5], [5, 3], [3, 2], [2, 10], [4, 12], [12, 7], [7, 8], [8, 9],
    [0, 6], [6, 3], [0, 11], [1, 13],

    // Cross-links between twins
    [1, 0], [3, 6], [2, 3]
  ];

  return createConstellation('Gemini', stars, edges);
}


export function cancer() {
  const stars = [
    { id: 0, label: 'Tarf', ra: 8.775 * 15, dec: 9.19, magnitude: 3.53 },
    { id: 1, label: 'Asellus Australis', ra: 8.744 * 15, dec: 18.15, magnitude: 3.94 },
    { id: 2, label: 'Asellus Borealis', ra: 8.634 * 15, dec: 21.47, magnitude: 4.67 },
    { id: 3, label: 'Iota', ra: 8.988 * 15, dec: 28.76, magnitude: 4.02 },
    { id: 4, label: 'Theta', ra: 8.932 * 15, dec: 18.15, magnitude: 5.33 },
    { id: 5, label: 'Eta', ra: 8.846 * 15, dec: 20.07, magnitude: 5.33 },

    // Beehive Cluster (Praesepe, M44)
    { id: 6, label: 'M44 A', ra: 8.666 * 15, dec: 19.6, magnitude: 6.0 },
    { id: 7, label: 'M44 B', ra: 8.666 * 15, dec: 19.9, magnitude: 6.0 },
    { id: 8, label: 'M44 C', ra: 8.663 * 15, dec: 19.8, magnitude: 6.0 },
    { id: 9, label: 'M44 D', ra: 8.667 * 15, dec: 19.7, magnitude: 6.0 }
  ];

  const edges = [
    [0, 1],  // Tarf → Asellus Australis
    [1, 2],  // Asellus Australis → Asellus Borealis
    [2, 5],  // Asellus Borealis → Eta Cnc
    [5, 4],  // Eta Cnc → Theta Cnc
    [4, 3],  // Theta Cnc → Iota Cnc

    // Beehive cluster connections (visual cluster only)
    [6, 7], [7, 8], [8, 9], [9, 6]
  ];

  return createConstellation('Cancer', stars, edges);
}

export function leo() {
  const stars = [
    { id: 0, label: 'Regulus', ra: 10.139 * 15, dec: 11.97, magnitude: 1.35 },
    { id: 1, label: 'Eta', ra: 10.122 * 15, dec: 16.76, magnitude: 3.49 },
    { id: 2, label: 'Adhafera', ra: 10.278 * 15, dec: 23.42, magnitude: 3.44 },
    { id: 3, label: 'Algieba', ra: 10.332 * 15, dec: 19.84, magnitude: 2.28 },
    { id: 4, label: 'Mu', ra: 10.545 * 15, dec: 14.42, magnitude: 3.88 },
    { id: 5, label: 'Epsilon', ra: 10.893 * 15, dec: 18.47, magnitude: 2.98 },
    { id: 6, label: 'Zosma', ra: 11.236 * 15, dec: 20.52, magnitude: 2.56 },
    { id: 7, label: 'Chertan', ra: 11.237 * 15, dec: 15.43, magnitude: 3.34 },
    { id: 8, label: 'Denebola', ra: 11.817 * 15, dec: 14.57, magnitude: 2.14 },
    { id: 9, label: 'Rho', ra: 10.86 * 15, dec: 9.31, magnitude: 3.85 },
    { id: 10, label: 'Iota', ra: 10.34 * 15, dec: 8.44, magnitude: 4.00 },
    { id: 11, label: 'Lambda', ra: 10.67 * 15, dec: 6.37, magnitude: 4.32 }
  ];

  const edges = [
    // Sickle (Lion's head/mane)
    [0, 1], [1, 2], [2, 3], [3, 4], [3, 5],

    // Body
    [3, 6], [6, 7], [7, 8],

    // Additional outline
    [0, 10], [10, 11], [0, 9], [9, 5]
  ];

  return createConstellation('Leo', stars, edges);
}


export function virgo() {
  const stars = [
    { id: 0, label: 'Spica', ra: 13.42 * 15, dec: -11.16, magnitude: 0.98 },
    { id: 1, label: 'Zavijava', ra: 11.84 * 15, dec: 1.76, magnitude: 3.61 },
    { id: 2, label: 'Porrima', ra: 12.45 * 15, dec: -1.45, magnitude: 2.74 },
    { id: 3, label: 'Auva', ra: 12.25 * 15, dec: 3.31, magnitude: 3.38 },
    { id: 4, label: 'Vindemiatrix', ra: 13.03 * 15, dec: 10.96, magnitude: 2.83 },
    { id: 5, label: 'Zaniah', ra: 12.9 * 15, dec: -0.67, magnitude: 3.89 },
    { id: 6, label: 'Heze', ra: 13.58 * 15, dec: -0.6, magnitude: 3.38 },
    { id: 7, label: 'Theta', ra: 14.00 * 15, dec: -5.66, magnitude: 4.38 },
    { id: 8, label: 'Iota', ra: 14.36 * 15, dec: -6.00, magnitude: 4.07 },
    { id: 9, label: 'Syrma', ra: 15.32 * 15, dec: -6.29, magnitude: 4.07 }, // sometimes listed separately
    { id: 10, label: 'Psi', ra: 13.8 * 15, dec: -9.77, magnitude: 4.81 }
  ];

  const edges = [
    // Main spine
    [4, 3], [3, 2], [2, 1], [2, 5], [5, 6], [6, 0], [6, 7], [7, 8], [8, 9],

    // Extras
    [6, 10], [1, 4]
  ];

  return createConstellation('Virgo', stars, edges);
}

export function libra() {
  const stars = [
    { id: 0, label: 'Zubenelgenubi', ra: 14.845 * 15, dec: -16.04, magnitude: 2.75 },
    { id: 1, label: 'Zubeneschamali', ra: 15.283 * 15, dec: -9.38, magnitude: 2.61 },
    { id: 2, label: 'Brachium', ra: 15.29 * 15, dec: -25.28, magnitude: 3.29 },
    { id: 3, label: 'Gamma', ra: 15.35 * 15, dec: -14.78, magnitude: 3.91 },
    { id: 4, label: 'Iota', ra: 15.59 * 15, dec: -19.8, magnitude: 4.54 },
    { id: 5, label: 'Upsilon', ra: 15.31 * 15, dec: -28.13, magnitude: 5.37 },
    { id: 6, label: 'Tau', ra: 15.67 * 15, dec: -29.78, magnitude: 3.66 }
  ];

  const edges = [
    // Main diamond shape
    [0, 1], [0, 2], [0, 3], [1, 3],

    // Lower scales / arms
    [2, 4], [2, 5], [5, 6]
  ];

  return createConstellation('Libra', stars, edges);
}

export function scorpius() {
  const stars = [
    { id: 0, label: 'Antares', ra: 16.49 * 15, dec: -26.43, magnitude: 1.06 },
    { id: 1, label: 'Graffias', ra: 16.09 * 15, dec: -19.80, magnitude: 2.62 },
    { id: 2, label: 'Dschubba', ra: 16.00 * 15, dec: -22.62, magnitude: 2.29 },
    { id: 3, label: 'Pi', ra: 16.37 * 15, dec: -26.71, magnitude: 2.89 },
    { id: 4, label: 'Rho', ra: 16.59 * 15, dec: -29.82, magnitude: 3.87 },
    { id: 5, label: 'Shaula', ra: 17.56 * 15, dec: -37.10, magnitude: 1.62 },
    { id: 6, label: 'Lesath', ra: 17.62 * 15, dec: -37.29, magnitude: 2.70 },
    { id: 7, label: 'Sargas', ra: 17.62 * 15, dec: -42.99, magnitude: 1.86 },
    { id: 8, label: 'Epsilon', ra: 16.84 * 15, dec: -34.30, magnitude: 2.29 },
    { id: 9, label: 'Zeta1', ra: 16.91 * 15, dec: -42.36, magnitude: 4.70 },
    { id: 10, label: 'Kappa', ra: 17.19 * 15, dec: -39.02, magnitude: 2.39 },
    { id: 11, label: 'Mu1', ra: 16.88 * 15, dec: -38.02, magnitude: 3.08 }
  ];

  const edges = [
    // Body and claws
    [1, 2], [2, 0], [0, 3], [3, 4], [4, 8], [8, 11], [11, 10], [10, 5], [5, 6], [6, 7],
    [8, 9], [9, 7]
  ];

  return createConstellation('Scorpius', stars, edges);
}

export function ophiuchus() {
  const stars = [
    { id: 0, label: 'Rasalhague)', ra: 17.583 * 15, dec: 12.56, magnitude: 2.08 },
    { id: 1, label: 'Sabik', ra: 17.173 * 15, dec: -15.73, magnitude: 2.43 },
    { id: 2, label: 'Yed Prior', ra: 16.615 * 15, dec: -3.69, magnitude: 2.73 },
    { id: 3, label: 'Yed Posterior', ra: 16.72 * 15, dec: -4.69, magnitude: 3.23 },
    { id: 4, label: 'Zeta', ra: 16.37 * 15, dec: -10.57, magnitude: 2.56 },
    { id: 5, label: 'Theta', ra: 17.24 * 15, dec: -24.29, magnitude: 3.26 },
    { id: 6, label: 'Kappah', ra: 17.23 * 15, dec: -19.12, magnitude: 3.22 },
    { id: 7, label: 'Beta', ra: 17.37 * 15, dec: 4.57, magnitude: 2.76 },
    { id: 8, label: 'Gamma', ra: 17.73 * 15, dec: 2.70, magnitude: 3.75 },
    { id: 9, label: 'Nu', ra: 16.89 * 15, dec: -9.77, magnitude: 3.33 },
    { id: 10, label: 'Mu', ra: 17.19 * 15, dec: -8.12, magnitude: 4.61 }
  ];

  const edges = [
    [0, 7], [7, 8], [8, 0], // Head triangle
    [0, 1], [1, 6], [6, 5], // Right arm
    [6, 10], [10, 9], [9, 4], [4, 2], [2, 3], // Left arm with serpent
    [2, 7] // Connect shoulder to torso
  ];

  return createConstellation('Ophiuchus', stars, edges);
}

export function sagittarius() {
  const stars = [
    { id: 0, label: 'Kaus Australis', ra: 18.402 * 15, dec: -34.38, magnitude: 1.85 },
    { id: 1, label: 'Kaus Media', ra: 18.349 * 15, dec: -29.83, magnitude: 2.72 },
    { id: 2, label: 'Kaus Borealis', ra: 18.466 * 15, dec: -25.42, magnitude: 2.82 },
    { id: 3, label: 'Phi', ra: 18.444 * 15, dec: -26.99, magnitude: 3.17 },
    { id: 4, label: 'Ascella', ra: 18.59 * 15, dec: -29.83, magnitude: 2.60 },
    { id: 5, label: 'Tau', ra: 19.043 * 15, dec: -27.67, magnitude: 3.32 },
    { id: 6, label: 'Sigma', ra: 17.944 * 15, dec: -29.87, magnitude: 2.05 },
    { id: 7, label: 'Nunki', ra: 18.921 * 15, dec: -26.30, magnitude: 2.05 },
    { id: 8, label: 'Albaldah', ra: 18.096 * 15, dec: -21.06, magnitude: 2.88 },
    { id: 9, label: 'Alnasl', ra: 18.105 * 15, dec: -30.42, magnitude: 2.98 },
    { id: 10, label: 'Omega', ra: 18.78 * 15, dec: -26.99, magnitude: 4.70 },
    { id: 11, label: 'Eta', ra: 18.25 * 15, dec: -36.71, magnitude: 3.11 }
  ];

  const edges = [
    // Teapot outline
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], // Top arc
    [4, 5], [5, 7], [7, 3], // Handle and spout
    [3, 10], // Steam connection
    [1, 6], [6, 9], [9, 0], // Back handle and base
    [8, 2], // Albaldah to top
    [0, 11] // Kaus Australis to Eta (southern base)
  ];

  return createConstellation('Sagittarius', stars, edges);
}

export function capricornus() {
  const stars = [
    { id: 0, label: 'Deneb Algedi (Delta Cap)', ra: 21.73 * 15, dec: -16.13, magnitude: 2.85 },
    { id: 1, label: 'Dabih (Beta Cap)', ra: 20.77 * 15, dec: -14.78, magnitude: 3.05 },
    { id: 2, label: 'Nashira (Gamma Cap)', ra: 21.52 * 15, dec: -16.12, magnitude: 3.69 },
    { id: 3, label: 'Algedi (Alpha2 Cap)', ra: 20.52 * 15, dec: -12.54, magnitude: 3.57 },
    { id: 4, label: 'Zeta Cap', ra: 21.44 * 15, dec: -22.41, magnitude: 3.77 },
    { id: 5, label: 'Theta Cap', ra: 21.07 * 15, dec: -17.23, magnitude: 4.07 },
    { id: 6, label: 'Iota Cap', ra: 21.00 * 15, dec: -25.00, magnitude: 4.30 },
    { id: 7, label: 'Omega Cap', ra: 21.85 * 15, dec: -26.35, magnitude: 4.12 },
    { id: 8, label: 'Psi Cap', ra: 21.68 * 15, dec: -25.43, magnitude: 4.14 },
    { id: 9, label: 'Rho Cap', ra: 21.48 * 15, dec: -19.47, magnitude: 4.79 }
  ];

  const edges = [
    [0, 2], [2, 1], [1, 3], [3, 5], [5, 2],
    [2, 4], [4, 9], [9, 5],
    [4, 8], [8, 6], [6, 7]
  ];

  return createConstellation('Capricornus', stars, edges);
}

export function aquarius() {
  const stars = [
    { id: 0, label: 'Sadalmelik (Alpha Aqr)', ra: 22.096 * 15, dec: -0.32, magnitude: 2.96 },
    { id: 1, label: 'Sadalsuud (Beta Aqr)', ra: 21.736 * 15, dec: -5.57, magnitude: 2.87 },
    { id: 2, label: 'Skat (Delta Aqr)', ra: 22.88 * 15, dec: -15.82, magnitude: 3.27 },
    { id: 3, label: 'Albali (Epsilon Aqr)', ra: 21.76 * 15, dec: -9.49, magnitude: 3.77 },
    { id: 4, label: 'Ancha (Theta Aqr)', ra: 22.31 * 15, dec: -7.58, magnitude: 4.16 },
    { id: 5, label: 'Zeta Aqr', ra: 22.28 * 15, dec: -0.01, magnitude: 4.42 },
    { id: 6, label: 'Eta Aqr', ra: 22.37 * 15, dec: -0.12, magnitude: 4.02 },
    { id: 7, label: 'Pi Aqr', ra: 22.58 * 15, dec: 1.37, magnitude: 4.65 },
    { id: 8, label: 'Lambda Aqr', ra: 22.88 * 15, dec: -4.57, magnitude: 3.73 },
    { id: 9, label: 'Phi Aqr', ra: 23.18 * 15, dec: -6.05, magnitude: 4.22 },
    { id: 10, label: 'Psi1 Aqr', ra: 23.17 * 15, dec: -9.09, magnitude: 4.21 },
    { id: 11, label: 'Psi2 Aqr', ra: 23.18 * 15, dec: -9.61, magnitude: 4.42 },
    { id: 12, label: 'Psi3 Aqr', ra: 23.19 * 15, dec: -10.37, magnitude: 4.98 }
  ];

  const edges = [
    // Core triangle / torso
    [1, 0], [0, 5], [0, 6], [6, 7],
    [1, 3], [3, 4], [4, 2],

    // Stream of water
    [8, 9], [9, 10], [10, 11], [11, 12]
  ];

  return createConstellation('Aquarius', stars, edges);
}

export function orion() {
  const stars = [
    { id: 0, label: 'Betelgeuse', ra: 5.919 * 15, dec: 7.41, magnitude: 0.42 },
    { id: 1, label: 'Bellatrix', ra: 5.418 * 15, dec: 6.35, magnitude: 1.64 },
    { id: 2, label: 'Alnitak', ra: 5.679 * 15, dec: -1.94, magnitude: 1.74 },
    { id: 3, label: 'Alnilam', ra: 5.603 * 15, dec: -1.20, magnitude: 1.69 },
    { id: 4, label: 'Mintaka', ra: 5.533 * 15, dec: -0.30, magnitude: 2.25 },
    { id: 5, label: 'Saiph', ra: 5.795 * 15, dec: -9.67, magnitude: 2.07 },
    { id: 6, label: 'Rigel', ra: 5.243 * 15, dec: -8.20, magnitude: 0.13 },
    { id: 7, label: 'Meissa', ra: 5.919 * 15, dec: 9.93, magnitude: 3.39 },
    { id: 8, label: 'Hatysa', ra: 5.919 * 15, dec: -5.91, magnitude: 2.75 },
    { id: 9, label: 'Thabit', ra: 5.679 * 15, dec: -7.82, magnitude: 4.62 }
  ];

  const edges = [
    // Shoulders and head
    [0, 1], [0, 7], [1, 7],

    // Belt
    [2, 3], [3, 4],

    // Body
    [0, 2], [1, 4], [2, 5], [4, 6], [5, 6],

    // Sword
    [3, 8], [8, 9]
  ];

  return createConstellation('Orion', stars, edges);
}

export function pisces() {
  const stars = [
    { id: 0, label: 'Alrescha', ra: 2.03 * 15, dec: 2.77, magnitude: 3.82 },
    { id: 1, label: 'Eta', ra: 1.43 * 15, dec: 15.35, magnitude: 3.62 },
    { id: 2, label: 'Gamma', ra: 0.87 * 15, dec: 27.71, magnitude: 3.69 },
    { id: 3, label: 'Kappa', ra: 0.82 * 15, dec: 20.17, magnitude: 4.94 },
    { id: 4, label: 'Iota', ra: 1.07 * 15, dec: 12.05, magnitude: 4.13 },
    { id: 5, label: 'Lambda', ra: 1.29 * 15, dec: 1.09, magnitude: 4.51 },
    { id: 6, label: 'Mu', ra: 1.59 * 15, dec: 6.00, magnitude: 4.84 },
    { id: 7, label: 'Nu', ra: 1.65 * 15, dec: 5.60, magnitude: 4.45 },
    { id: 8, label: 'Omicron', ra: 1.75 * 15, dec: 9.16, magnitude: 4.26 },
    { id: 9, label: 'TX', ra: 0.76 * 15, dec: 3.65, magnitude: 5.00 }
  ];

  const edges = [
    // Western fish and cord
    [2, 3], [3, 1], [1, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 0],

    // Eastern fish
    [0, 9]
  ];

  return createConstellation('Pisces', stars, edges);
}


