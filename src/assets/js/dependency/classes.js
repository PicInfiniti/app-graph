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
