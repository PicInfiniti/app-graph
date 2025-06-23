export const menuData = [
  {
    title: "File",
    id: "file",
    submenu: [
      {
        title: "🆕 New Graph",
        id: "new-mixed-btn",
        shortcut: "(n)",
      },
      {
        title: "📂 Import",
        id: "import-graph",
        shortcut: "(o)",
        input: [
          {
            type: "file",
            id: "file-input",
            hidden: true,
          },
        ],
      },
      { title: "💾 Export", id: "export-graph", shortcut: "(Ctrl+s)" },
      { title: "🖼️ Export to PNG", id: "export-png", shortcut: "(P)" },
      { type: "divider" },
      { title: "⚙️ Default Setting", id: "default-settings-btn" },
      { title: "🌙 Sky Night", id: "sky-night-theme-btn" },
      { type: "divider" },
      { title: "🔄 Reload", id: "reload", shortcut: "(F5)" },
    ],
  },
  {
    title: "Edit",
    id: "edit",
    submenu: [
      { title: "Organize Nodes", name: "organize-circle", shortcut: "(O)" },
      { title: "Complete Graph", name: "complete-btn", shortcut: "(alt-C)" },
      { title: "Delete", name: "remove-selection-btn", shortcut: "(d)" },
      { title: "Assign Color", name: "color-selection-btn", shortcut: "(c)" },
      { title: "Add Edge", name: "add-edge-btn", shortcut: "(alt-e)" },
      {
        title: "Add Directed Edge",
        name: "add-directed-edge-btn",
        shortcut: "(alt-E)",
      },
      { type: "divider" },
      { title: "Copy", name: "copy-subgraph", shortcut: "(y)" },
      { title: "Cut", name: "cut-subgraph", shortcut: "(x)" },
      { title: "Paste", name: "paste-subgraph", shortcut: "(p)" },
      { type: "divider" },
      { title: "Rename", name: "rename-btn", shortcut: "(r)" },
      { title: "Edit Info", name: "desc-btn", shortcut: "(i)" },
      { title: "Edit Weight", name: "weight-btn", shortcut: "(w)" },
      { type: "divider" },
      { title: "Undo", name: "undo-btn", shortcut: "(u)" },
      { title: "Redo", name: "redo-btn", shortcut: "(Ctrl+r)" },
    ],
  },
  {
    title: "Settings",
    id: "settings",
    submenu: [
      {
        title: "Graph",
        id: "graph-settings",
        shortcut: ">",
        submenu: [
          { title: "Vertex Label", id: "vertex-label", check: true },
          { title: "Edge Label", id: "edge-label", check: true },
          { title: "Weight Label", id: "weight-label", check: true },
          { type: "divider" },
          {
            title: "Grid",
            id: "gride-size",
            input: [
              {
                type: "range",
                id: "grid-size-1",
                min: 0,
                max: 100,
                value: 20,
              },
            ],
          },
          {
            title: "Node",
            id: "vertex-size",
            input: [
              {
                type: "range",
                id: "vertex-size-1",
                min: 0,
                max: 200,
                value: 10,
                step: 0.1,
              },
            ],
          },
          {
            title: "Edge",
            id: "edge-size",
            input: [
              {
                type: "range",
                id: "edge-size-1",
                min: 1,
                max: 100,
                value: 2,
              },
            ],
          },
          {
            title: "Label",
            id: "label-size",
            input: [
              {
                type: "range",
                id: "label-size-1",
                min: 0,
                max: 100,
                value: 15,
              },
            ],
          },
          {
            title: "Stroke",
            id: "stroke-size",
            input: [
              {
                type: "range",
                id: "stroke-size-1",
                min: 0,
                max: 50,
                value: 5,
                step: 0.1,
              },
            ],
          },
        ],
      },
      {
        title: "View",
        id: "view",
        shortcut: ">",
        submenu: [
          { title: "Info Panel", id: "panel-btn", check: true },
          { title: "Tools Panel", id: "tools-btn", check: false },
          { title: "Key Chord", id: "shortcut-chord-btn", shortcut: "⎵" },
        ],
      },

      { type: "divider" },
      {
        title: "History",
        id: "History",
        shortcut: ">",
        submenu: [
          {
            title: "History Limit",
            id: "history-limit",
            input: [
              {
                type: "number",
                id: "history-limit-1",
                min: 5,
                max: 10_000,
                value: 5,
              },
            ],
          },
          { title: "Save History", id: "save-history", check: true },
          { title: "Clear History", id: "clear-histoory-btn" },
        ],
      },
    ],
  },
  {
    title: "Tools",
    id: "tools",
    submenu: [
      { title: "Scale", id: "scale-btn", check: false, shortcut: "(s)" },
      { title: "Panning", id: "panning-btn", check: false, shortcut: "Ctrl" },
      { title: "Selecting", id: "select-btn", check: false, shortcut: "Shift" },
      {
        title: "Component",
        id: "component-btn",
        check: false,
        shortcut: "Alt",
      },
      { type: "divider" },
      { title: "Tree", id: "tree-btn", check: false, shortcut: "(t)" },
      {
        title: "Force Simulation",
        id: "force-btn",
        check: false,
        shortcut: "(f)",
      },
      { type: "divider" },
      {
        title: "Color Picker",
        id: "color-picker-btn",
        check: false,
        shortcut: "⎵ cc",
      },
    ],
  },
  {
    title: "Generator",
    id: "generator",
    submenu: [
      {
        title: "Classic",
        id: "classic",
        shortcut: ">",
        submenu: [
          {
            title: "Empty",
            id: "empty",
            input: [
              {
                type: "number",
                id: "g-empty-1",
                min: 1,
                max: 500,
                value: 5,
              },
            ],
          },
          {
            title: "Kₙ",
            id: "complete",
            link: "https://en.wikipedia.org/wiki/Complete_graph",
            input: [
              {
                type: "number",
                id: "g-complete-1",
                min: 1,
                max: 500,
                value: 5,
              },
            ],
          },
          {
            title: "Kₙ,ₙ",
            id: "complete-bipartite",
            link: "https://en.wikipedia.org/wiki/Complete_bipartite_graph",
            input: [
              {
                type: "number",
                id: "g-complete-bipartite-1",
                min: 1,
                max: 500,
                value: 5,
              },
              {
                type: "number",
                id: "g-complete-bipartite-2",
                min: 1,
                max: 500,
                value: 5,
              },
            ],
          },
          {
            title: "Pₙ",
            id: "path",
            link: "https://en.wikipedia.org/wiki/Path_graph",
            input: [
              {
                type: "number",
                id: "g-path-1",
                min: 2,
                max: 500,
                value: 5,
              },
            ],
          },
          {
            title: "Cₙ",
            id: "cycle",
            link: "https://en.wikipedia.org/wiki/Cycle_graph",
            input: [
              {
                type: "number",
                id: "g-cycle-1",
                min: 3,
                max: 500,
                value: 5,
              },
            ],
          },
          {
            title: "Lₙ",
            id: "ladder",
            link: "https://en.wikipedia.org/wiki/Ladder_graph",
            input: [
              {
                type: "number",
                id: "g-ladder-1",
                min: 2,
                max: 500,
                value: 5,
              },
            ],
          },
        ],
      },
      {
        title: "Community",
        id: "community",
        shortcut: ">",
        submenu: [
          {
            title: "Cₙ,ₙ",
            id: "caveman",
            link: "https://mathworld.wolfram.com/CavemanGraph.html",
            input: [
              {
                type: "number",
                id: "g-caveman-1",
                min: 1,
                max: 500,
                value: 5,
              },
              {
                type: "number",
                id: "g-caveman-2",
                min: 1,
                max: 500,
                value: 5,
              },
            ],
          },
          {
            title: "Qₙ,ₙ",
            id: "connected-caveman",
            link: "https://mathworld.wolfram.com/CavemanGraph.html",
            input: [
              {
                type: "number",
                id: "g-connected-caveman-1",
                min: 1,
                max: 500,
                value: 5,
              },
              {
                type: "number",
                id: "g-connected-caveman-2",
                min: 1,
                max: 500,
                value: 5,
              },
            ],
          },
        ],
      },
      {
        title: "Random",
        id: "random",
        shortcut: ">",
        submenu: [
          {
            title: "Clusters",
            id: "clusters",
            input: [
              {
                type: "number",
                id: "g-clusters-1",
                min: 2,
                max: 500,
                value: 20,
              },
              {
                type: "number",
                id: "g-clusters-2",
                min: 2,
                max: 500,
                value: 20,
              },
              {
                type: "number",
                id: "g-clusters-3",
                min: 2,
                max: 500,
                value: 10,
              },
            ],
          },
          {
            title: "erdos Renyi",
            id: "erdos-renyi",
            link: "https://en.wikipedia.org/wiki/Erd%C5%91s%E2%80%93R%C3%A9nyi_model",
            input: [
              {
                type: "number",
                id: "g-erdos-renyi-1",
                min: 1,
                max: 500,
                value: 10,
              },
              {
                type: "number",
                id: "g-erdos-renyi-2",
                min: 0,
                max: 1,
                step: 0.1,
                value: 0.5,
              },
            ],
          },
          {
            title: "Girvan Newman",
            id: "griven-newmn",
            link: "https://www.pnas.org/doi/pdf/10.1073/pnas.122653799",
            input: [
              {
                type: "number",
                id: "g-girvan-newman-1",
                min: 1,
                max: 500,
                value: 5,
              },
            ],
          },
        ],
      },
      {
        title: "Small",
        id: "small",
        shortcut: ">",
        submenu: [
          {
            title: "Krackhardt kite",
            id: "krackhardt-kite",
            link: "https://en.wikipedia.org/wiki/Krackhardt_kite_graph",
          },
        ],
      },
      {
        title: "Social",
        id: "social",
        shortcut: ">",
        submenu: [
          {
            title: "Florentine families",
            id: "florentine-families",
          },
          {
            title: "Zachary’s karate club",
            id: "karate-club",
            link: "https://en.wikipedia.org/wiki/Zachary%27s_karate_club",
          },
        ],
      },
      { type: "divider" },
      {
        title: "Zodiac",
        id: "zodiac",
        shortcut: ">",
        submenu: [
          {
            title: "Aries",
            id: "aries",
            label: "♈",
            link: "https://en.wikipedia.org/wiki/Aries_(astrology)",
          },
          {
            title: "Taurus",
            id: "taurus",
            label: "♉",
            link: "https://en.wikipedia.org/wiki/Taurus_(astrology)",
          },
          {
            title: "Gemini",
            id: "gemini",
            label: "♊",
            link: "https://en.wikipedia.org/wiki/Gemini_(astrology)",
          },
          {
            title: "Cancer",
            id: "cancer",
            label: "♋",
            link: "https://en.wikipedia.org/wiki/Cancer_(astrology)",
          },
          {
            title: "Leo",
            id: "leo",
            label: "♌",
            link: "https://en.wikipedia.org/wiki/Leo_(astrology)",
          },
          {
            title: "Virgo",
            id: "virgo",
            label: "♍",
            link: "https://en.wikipedia.org/wiki/Virgo_(astrology)",
          },
          {
            title: "Libra",
            id: "libra",
            label: "♎",
            link: "https://en.wikipedia.org/wiki/Libra_(astrology)",
          },
          {
            title: "Scorpius",
            id: "scorpius",
            label: "♏",
            link: "https://en.wikipedia.org/wiki/Scorpio_(astrology)",
          },
          {
            title: "Ophiuchus",
            id: "ophiuchus",
            label: "⛎",
            link: "https://en.wikipedia.org/wiki/Ophiuchus_(astrology)",
          },
          {
            title: "Sagittarius",
            id: "sagittarius",
            label: "♐",
            link: "https://en.wikipedia.org/wiki/Sagittarius_(astrology)",
          },
          {
            title: "Capricornus",
            id: "capricornus",
            label: "♑",
            link: "https://en.wikipedia.org/wiki/Capricorn_(astrology)",
          },
          {
            title: "Aquarius",
            id: "aquarius",
            label: "♒",
            link: "https://en.wikipedia.org/wiki/Aquarius_(astrology)",
          },
          {
            title: "Pisces",
            id: "pisces",
            label: "♓",
            link: "https://en.wikipedia.org/wiki/Pisces_(astrology)",
          },
        ],
      },
    ],
  },
  {
    title: "Metrics",
    id: "metrics",
    submenu: [
      {
        title: "Basic",
        id: "basic",
        submenu: [
          { title: "Basic Information", id: "basic-info-btn" },
          { title: "Components", id: "components-btn" },
          { title: "Degree Sequence", id: "list-degrees-btn" },
          { title: "Density", id: "density-btn" },
          { title: "Diameter", id: "diameter-btn" },
        ],
      },
      {
        title: "Centrality",
        id: "centrality",
        submenu: [
          { title: "Betweenness Centrality", id: "betweenness-centrality-btn" },
          { title: "Closeness Centrality", id: "closeness-centrality-btn" },
          { title: "Degree Centrality", id: "degree-centrality-btn" },
          { title: "Eccentricity", id: "eccentricity-btn" },
          { title: "Eigenvector Centrality", id: "eigenvector-centrality-btn" },
          { title: "PageRank", id: "pagerank-btn" },
        ],
      },
      {
        title: "Layout Quality",
        id: "layout-quality",
        submenu: [
          { title: "Edge Uniformity", id: "edge-uniformity-btn" },
          {
            title: "Neighborhood Preservation",
            id: "neighborhood-preservation-btn",
          },
          { title: "Stress", id: "stress-btn" },
        ],
      },
      {
        title: "Other",
        id: "other",
        submenu: [
          { title: "Simmelian Strength", id: "simmelian-strength-btn" },
          { title: "Disparity", id: "disparity-btn" },
        ],
      },

      { type: "divider" },
      { title: "Neighbors", id: "neighbors-btn" },
      { title: "Shortest Path", id: "shortest-path-btn" },
      {
        title: "Selected Nodes Info",
        id: "all-node-info-btn",
        shortcut: "(a)",
      },
      {
        title: "Selected Edges Info",
        id: "all-edge-info-btn",
        shortcut: "(Alt+a)",
      },
      { type: "divider" },
      { title: "Clear Panel", id: "clear-info-panel-btn", shortcut: "(q)" },
    ],
  },
  {
    title: "Operators",
    id: "help",
    submenu: [
      { title: "To Mixed", id: "to-mixed" },
      { title: "To Undirected", id: "to-undirected" },
      { title: "To Directed", id: "to-directed" },
      { title: "To Weighted", id: "to-weighted" },
      { title: "To Unweighted", id: "to-unweighted" },
      { type: "divider" },
      { title: "Reverse Direction", id: "reverse-direction" },
    ],
  },
  {
    title: "Help",
    id: "help",
    submenu: [
      { title: "Mouse Commnads", id: "command", name: "command-btn" },
      { title: "How to use", id: "how-to-use" },
      { title: "About", id: "about", shortcut: "version: 1.4.0" },
    ],
  },
];
