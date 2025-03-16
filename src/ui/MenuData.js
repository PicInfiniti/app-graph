export const menuData = [
  {
    title: "File",
    submenu: [
      {
        title: "🆕 New", id: "new-btn", shortcut: "(n)"
      },
      {
        title: "📂 Import", id: "import-graph", shortcut: "(o)", input: {
          type: "file", id: "file-input", hidden: true
        }
      },
      { title: "💾 Export", id: "export-graph", shortcut: "(s)" },
      { title: "🖼️ Export to PNG", id: "export-png", shortcut: "(p)" },
      { type: "divider" },
      { title: "Default Setting", id: "default-settings-btn" },
    ],
  },
  {
    title: "Edit",
    submenu: [
      { title: "Organize Nodes", name: "organize-circle", shortcut: "(O)" },
      { title: "Complete Graph", name: "make-complete-btn", shortcut: "(c)" },
      { title: "Delete", name: "remove-selection-btn", shortcut: "(d)" },
      { title: "Assign Color", name: "color-selection-btn", shortcut: "(C)" },
      { title: "Add Edge", name: "add-edge-btn", shortcut: "(e)" },
      { type: "divider" },
      { title: "Undo", name: "undo-btn", shortcut: "(u)" },
      { title: "Redo", name: "redo-btn", shortcut: "(r)" },
      { type: "divider" },
      {
        title: "Settings",
        submenu: [
          { dec: "input", type: "range", label: "Grid", id: "grid-size", min: 0, max: 50, value: 20 },
          { dec: "input", type: "range", label: "VSize", id: "vertex-size", min: 0, max: 50, value: 10 },
          { dec: "input", type: "range", label: "ESize", id: "edge-size", min: 1, max: 20, value: 2 },
          { dec: "input", type: "range", label: "LSize", id: "label-size", min: 0, max: 100, value: 15 },
          { title: "Vertex Label", id: "vertex-label", check: true },
        ],
      },
    ],
  },
  {
    title: "Tools",
    submenu: [
      { title: "Info Panel", id: "panel-btn", check: true },
      { title: "Component", id: "drag-btn", check: false },
      { title: "Scale", id: "scale-btn", check: false },
      { title: "Tree", id: "tree-btn", check: true },
      { title: "Force Simulation", id: "force-btn", check: false },
      { type: "divider" },
      {
        title: "Generator",
        submenu: [
          { dec: "input", type: "number", label: "Empty", id: "g-empty", min: 1, max: 500, value: 5 },
          { dec: "input", type: "number", label: "Kₙ", id: "g-complete", min: 1, max: 500, value: 5, link: "https://en.wikipedia.org/wiki/Complete_graph" },
          {
            dec: "input",
            type: "number",
            label: "Kₙ,ₙ",
            id: "g-complete-bipartite",
            min: 1,
            max: 500,
            values: [5, 5],
            link: "https://en.wikipedia.org/wiki/Complete_bipartite_graph"
          },
          { dec: "input", type: "number", label: "Pₙ", id: "g-path", min: 2, max: 500, value: 5, link: "https://en.wikipedia.org/wiki/Path_graph" },
          { dec: "input", type: "number", label: "Cₙ", id: "g-cycle", min: 3, max: 500, value: 5, link: "https://en.wikipedia.org/wiki/Cycle_graph" },
          { dec: "input", type: "number", label: "Lₙ", id: "g-ladder", min: 2, max: 500, value: 5, link: "https://en.wikipedia.org/wiki/Ladder_graph" },
          {
            dec: "input",
            type: "number",
            label: "Cₙ,ₙ",
            id: "g-caveman",
            min: 1,
            max: 500,
            values: [5, 5],
            link: "https://mathworld.wolfram.com/CavemanGraph.html"
          },
        ],
      },
    ],
  },
  {
    title: "Metrics",
    submenu: [
      { title: "Degree Sequence", id: "list-degrees-btn" },
      { title: "Components", id: "components-btn" },
    ],
  },
  {
    title: "Help",
    submenu: [
      { title: "How to use", link: "https://www.youtube.com/playlist?list=PLaa8UNGS4QED9DUhAZt7O963qkScAWah3" },
      { title: "Commands", name: "command-btn" },
      { title: "About", link: "http://picinfiniti.net/" },
    ],
  },
];

