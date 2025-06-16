import Mixed from "./mixed.js";

export default class UndirectedGraph extends Mixed {
  constructor(options = {}) {
    // Merge defaults with provided options
    const finalOptions = Object.assign({ type: "undirected" }, options);

    // Validate no multi-graph
    if ("multi" in finalOptions && finalOptions.multi !== false) {
      throw new InvalidArgumentsGraphError(
        "UndirectedGraph.from: inconsistent indication that the graph should be multi in given options!",
      );
    }

    // Validate type is 'undirected'
    if (finalOptions.type !== "undirected") {
      throw new InvalidArgumentsGraphError(
        `UndirectedGraph.from: inconsistent "${finalOptions.type}" type in given options!`,
      );
    }

    // Call the parent class constructor
    super(finalOptions);
  }
}
