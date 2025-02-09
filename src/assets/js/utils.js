export function getMinAvailableNumber(existingNumbers) {
  // Convert strings to numbers and create a Set for fast lookup
  const numberSet = new Set(existingNumbers.map(Number));

  // Start checking from 1
  let minNumber = 1;

  // Increment until we find a missing number
  while (numberSet.has(minNumber)) {
    minNumber++;
  }

  return minNumber;
}


export function getAvailableLabel(n, maxLength = 3) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const combinations = [];

  // Generate nth combination recursively
  function generateNthCombination(prefix, start, remaining) {
    if (remaining === 0) {
      combinations.push(prefix);
      return;
    }

    for (let i = start; i < alphabet.length; i++) {
      generateNthCombination(prefix + alphabet[i], i + 1, remaining - 1);
      if (combinations.length > n) {
        return; // Stop early if we found the nth combination
      }
    }
  }

  let currentLength = 1;
  while (combinations.length <= n && currentLength <= maxLength) {
    generateNthCombination('', 0, currentLength);
    currentLength++;
  }

  return combinations[n - 1] || null; // Return nth combination or null if out of bounds
}

export const includesById = (array, id) => array.filter(obj => obj.id === id).length > 0;
export function removeString(array, str) {
  return array.filter(item => item !== str);
}


export class LimitedArray {
  constructor(limit) {
    this.limit = limit;
    this.index = -1;
    this.data = [];
    this.graph = null;
  }

  push(value) {
    if (this.data.length >= this.limit) {
      this.data.shift(); // Remove the first element
    }
    this.data.push(value);
    this.index = this.data.length - 1
    this.graph = this.data[this.index]
  }

  getArray() {
    return this.data;
  }
  getIndex(index) {
    return this.data[index]
  }
  updateIndex(value) {
    this.index = value;
    this.graph = this.data[value]
  }
}
