import { isGraphConstructor } from "graphology-library/assertions";
import { mergeStar } from "graphology-library/utils";


var NODE_MAP_krackhardtKite = {
  'Andre': 0,
  'Beverley': 1,
  'Carol': 2,
  'Diane': 3,
  'Fernando': 4,
  'Ed': 5,
  'Garth': 6,
  'Heather': 7,
  'Ike': 8,
  'Jane': 9
};

/**
 * Convert adjacency list to numeric nodes
 */
var ADJACENCY_NUMERIC = [
  [0, 1, 2, 3, 4], // Andre -> [Beverley, Carol, Diane, Fernando]
  [1, 0, 5, 6],    // Beverley -> [Andre, Ed, Garth]
  [2, 0, 3, 4],    // Carol -> [Andre, Diane, Fernando]
  [3, 0, 1, 2, 5, 4, 6], // Diane -> [Andre, Beverley, Carol, Ed, Fernando, Garth]
  [5, 1, 3, 6],    // Ed -> [Beverley, Diane, Garth]
  [4, 0, 2, 3, 6, 7], // Fernando -> [Andre, Carol, Diane, Garth, Heather]
  [6, 1, 3, 5, 4, 7], // Garth -> [Beverley, Diane, Ed, Fernando, Heather]
  [7, 4, 6, 8],    // Heather -> [Fernando, Garth, Ike]
  [8, 7, 9],       // Ike -> [Heather, Jane]
  [9, 8]           // Jane -> [Ike]
];

export function krackhardtKite(GraphClass) {
  if (!isGraphConstructor(GraphClass))
    throw new Error(
      'graphology-generators/social/krackhardt-kite: invalid Graph constructor.'
    );

  var graph = new GraphClass(),
    i,
    l;

  for (i = 0, l = ADJACENCY_NUMERIC.length; i < l; i++) mergeStar(graph, ADJACENCY_NUMERIC[i]);

  return graph;
};


var NODE_MAP_florentineFamilies = {
  'Acciaiuoli': 0,
  'Medici': 1,
  'Castellani': 2,
  'Peruzzi': 3,
  'Strozzi': 4,
  'Barbadori': 5,
  'Ridolfi': 6,
  'Tornabuoni': 7,
  'Albizzi': 8,
  'Salviati': 9,
  'Pazzi': 10,
  'Bischeri': 11,
  'Guadagni': 12,
  'Ginori': 13,
  'Lamberteschi': 14
};

/**
 * Numeric edges based on NODE_MAP.
 */
var EDGES_NUMERIC = [
  [0, 1],   // Acciaiuoli - Medici
  [2, 3],   // Castellani - Peruzzi
  [2, 4],   // Castellani - Strozzi
  [2, 5],   // Castellani - Barbadori
  [1, 5],   // Medici - Barbadori
  [1, 6],   // Medici - Ridolfi
  [1, 7],   // Medici - Tornabuoni
  [1, 8],   // Medici - Albizzi
  [1, 9],   // Medici - Salviati
  [9, 10],  // Salviati - Pazzi
  [3, 4],   // Peruzzi - Strozzi
  [3, 11],  // Peruzzi - Bischeri
  [4, 6],   // Strozzi - Ridolfi
  [4, 11],  // Strozzi - Bischeri
  [6, 7],   // Ridolfi - Tornabuoni
  [7, 12],  // Tornabuoni - Guadagni
  [8, 13],  // Albizzi - Ginori
  [8, 12],  // Albizzi - Guadagni
  [11, 12], // Bischeri - Guadagni
  [12, 14]  // Guadagni - Lamberteschi
];

export function florentineFamilies(GraphClass) {
  if (!isGraphConstructor(GraphClass))
    throw new Error(
      'graphology-generators/social/florentine-families: invalid Graph constructor.'
    );

  var graph = new GraphClass(),
    i,
    l;

  for (i = 0, l = EDGES_NUMERIC.length; i < l; i++) {
    graph.mergeEdge(EDGES_NUMERIC[i][0], EDGES_NUMERIC[i][1]);
  }

  return graph;
};

var DATA = [
  '0111111110111100010101000000000100',
  '1011000100000100010101000000001000',
  '1101000111000100000000000001100010',
  '1110000100001100000000000000000000',
  '1000001000100000000000000000000000',
  '1000001000100000100000000000000000',
  '1000110000000000100000000000000000',
  '1111000000000000000000000000000000',
  '1010000000000000000000000000001011',
  '0010000000000000000000000000000001',
  '1000110000000000000000000000000000',
  '1000000000000000000000000000000000',
  '1001000000000000000000000000000000',
  '1111000000000000000000000000000001',
  '0000000000000000000000000000000011',
  '0000000000000000000000000000000011',
  '0000011000000000000000000000000000',
  '1100000000000000000000000000000000',
  '0000000000000000000000000000000011',
  '1100000000000000000000000000000001',
  '0000000000000000000000000000000011',
  '1100000000000000000000000000000000',
  '0000000000000000000000000000000011',
  '0000000000000000000000000101010011',
  '0000000000000000000000000101000100',
  '0000000000000000000000011000000100',
  '0000000000000000000000000000010001',
  '0010000000000000000000011000000001',
  '0010000000000000000000000000000101',
  '0000000000000000000000010010000011',
  '0100000010000000000000000000000011',
  '1000000000000000000000001100100011',
  '0010000010000011001010110000011101',
  '0000000011000111001110110011111110'
];

var CLUB1 = new Set([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 16, 17, 19, 21
]);

export function karateClub(GraphClass) {
  if (!isGraphConstructor(GraphClass))
    throw new Error(
      'graphology-generators/social/karate: invalid Graph constructor.'
    );

  var graph = new GraphClass(),
    club;

  for (var i = 0; i < 34; i++) {
    club = CLUB1.has(i) ? 'Mr. Hi' : 'Officer';

    graph.addNode(i, { club: club });
  }

  var line, entry, row, column, l, m;

  for (row = 0, l = DATA.length; row < l; row++) {
    line = DATA[row].split('');

    for (column = row + 1, m = line.length; column < m; column++) {
      entry = +line[column];

      if (entry) graph.addEdgeWithKey(row + '->' + column, row, column);
    }
  }

  return graph;
};

