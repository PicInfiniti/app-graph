
export function getMinAvailableNumber(existingNumbers) {
  const numberSet = new Set(existingNumbers.map(Number));
  let minNumber = 0;

  while (numberSet.has(minNumber)) {
    minNumber++;
  }

  return minNumber;
}

export function getAvailableLabel(n, maxLength = 3) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const combinations = [];

  function generateNthCombination(prefix, start, remaining) {
    if (remaining === 0) {
      combinations.push(prefix);
      return;
    }

    for (let i = start; i < alphabet.length; i++) {
      generateNthCombination(prefix + alphabet[i], i + 1, remaining - 1);
      if (combinations.length > n) return;
    }
  }

  let currentLength = 1;
  while (combinations.length <= n && currentLength <= maxLength) {
    generateNthCombination('', 0, currentLength);
    currentLength++;
  }

  return combinations[n] || null;
}



export function getTouchPosition(event, canvas) {
  const touch = event.changedTouches[0];
  const rect = canvas.node().getBoundingClientRect();
  return [touch.clientX - rect.left, touch.clientY - rect.top];
}


export function lineIntersectsRect(line, rect) {
  let [x1, y1, x2, y2] = line;  // Line segment coordinates
  let [a, b, c, d] = rect;  // Rectangle properties

  // Check if the line intersects any of the rectangle's edges
  if (lineIntersectsLine([x1, y1, x2, y2], [a, b, c, d])) {
    return true;  // Intersection found
  }
  if (lineIntersectsLine([x1, y1, x2, y2], [a, d, c, b])) {
    return true;  // Intersection found
  }
  return false;  // No intersection
}

// returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function lineIntersectsLine(line1, line2) {
  var det, gamma, lambda;
  const [a, b, c, d] = line1
  const [p, q, r, s] = line2
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};

export function pointInRect(a, b, x1, y1, x2, y2) {
  if (a >= x1 && a <= x2 && b >= y1 && b <= y2) {
    return true
  } else {
    return false
  }
}

// Helper function to calculate distance from a point to a line segment
export function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  let A = px - x1;
  let B = py - y1;
  let C = x2 - x1;
  let D = y2 - y1;

  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let param = len_sq !== 0 ? dot / len_sq : -1;

  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  let dx = px - xx;
  let dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}
