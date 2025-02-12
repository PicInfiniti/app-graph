import { connectedComponents } from "graphology-components";

export function getMinAvailableNumber(existingNumbers) {
  const numberSet = new Set(existingNumbers.map(Number));
  let minNumber = 1;

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

  return combinations[n - 1] || null;
}

export const includesById = (array, id) => array.some(obj => obj.id === id);

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
      this.data.shift();
    }
    this.data.push(value);
    this.index = this.data.length - 1;
    this.graph = this.data[this.index];
  }

  getArray() {
    return this.data;
  }

  getIndex(index) {
    return this.data[index] ?? null;
  }

  updateIndex(value) {
    if (value >= 0 && value < this.data.length) {
      this.index = value;
      this.graph = this.data[value];
    }
  }
}

export function getTouchPosition(event, svg) {
  const touch = event.changedTouches[0];
  const rect = svg.node().getBoundingClientRect();
  return [touch.clientX - rect.left, touch.clientY - rect.top];
}


export function getComponent(graph, node) {
  // Get all connected components
  const components = connectedComponents(graph);

  // Find the component that contains the given node
  for (let component of components) {
    if (component.includes(node)) {
      return component;
    }
  }

  return null; // If node is not found in any component
}



