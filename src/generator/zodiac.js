import * as constellations from './constellations'; // adjust path if needed

export class Zodiac {
  constructor(graphManager) {
    this.graphManager = graphManager;
    this.layout = graphManager.layout;
  }

  load(name) {
    const generator = constellations[name.toLowerCase()];
    if (generator) {
      const graph = generator();
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
