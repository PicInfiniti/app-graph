import Mixed from "./mixed.js";

export default class DirectedGraph extends Mixed {
  constructor(options = {}) {
    // Merge defaults with provided options
    const finalOptions = Object.assign({ type: "directed" }, options);

    // Validate no multi-graph
    if ("multi" in finalOptions && finalOptions.multi !== false) {
      throw new InvalidArgumentsGraphError(
        "DirectedGraph.from: inconsistent indication that the graph should be multi in given options!",
      );
    }

    // Validate type is 'directed'
    if (finalOptions.type !== "directed") {
      throw new InvalidArgumentsGraphError(
        `DirectedGraph.from: inconsistent "${finalOptions.type}" type in given options!`,
      );
    }

    // Call the parent class constructor
    super(finalOptions);
  }
}
