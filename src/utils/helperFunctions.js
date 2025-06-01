export function getMinAvailableNumber(existingNumbers) {
  const numberSet = new Set(existingNumbers.map(Number));
  let minNumber = 0;

  while (numberSet.has(minNumber)) {
    minNumber++;
  }

  return minNumber;
}

export function getAvailableLabel(n, maxLength = 3) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
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
    generateNthCombination("", 0, currentLength);
    currentLength++;
  }

  return combinations[n] || null;
}

export function getTouchPosition(event, canvas) {
  const touch = event.changedTouches[0];
  const rect = canvas.node().getBoundingClientRect();
  return [touch.clientX - rect.left, touch.clientY - rect.top];
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

export function positiveModulus(a, b) {
  return ((a % b) + b) % b;
}
