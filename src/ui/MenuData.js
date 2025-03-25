export const menuData = [
  {
    title: "File",
    id: "file",
    submenu: [
      {
        title: "🆕 New", id: "new-btn", shortcut: "(n)"
      },
      {
        title: "📂 Import", id: "import-graph", shortcut: "(o)", input: [
          {
            type: "file", id: "file-input", hidden: true
          }
        ]
      },
      { title: "💾 Export", id: "export-graph", shortcut: "(s)" },
      { title: "🖼️ Export to PNG", id: "export-png", shortcut: "(p)" },
      { type: "divider" },
      { title: "Default Setting", id: "default-settings-btn" },
    ],
  },
  {
    title: "Edit",
    id: "edit",
    submenu: [
      { title: "Organize Nodes", name: "organize-circle", shortcut: "(O)" },
      { title: "Complete Graph", name: "complete-btn", shortcut: "(C)" },
      { title: "Delete", name: "remove-selection-btn", shortcut: "(d)" },
      { title: "Assign Color", name: "color-selection-btn", shortcut: "(c)" },
      { title: "Add Edge", name: "add-edge-btn", shortcut: "(e)" },
      { type: "divider" },
      { title: "Undo", name: "undo-btn", shortcut: "(u)" },
      { title: "Redo", name: "redo-btn", shortcut: "(r)" },
      { type: "divider" },
      {
        title: "Settings",
        id: "settings",
        submenu: [
          { title: "Vertex Label", id: "vertex-label", check: true },
          {
            title: "Grid",
            id: "gride-size",
            input: [
              {
                type: "range",
                id: "grid-size-1",
                min: 0,
                max: 100,
                value: 20
              }
            ]
          },
          {
            title: "Node",
            id: "vertex-size",
            input: [
              {
                type: "range",
                id: "vertex-size-1",
                min: 0,
                max: 100,
                value: 10
              }
            ]
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
                value: 2
              }
            ]
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
                value: 15
              }
            ]
          },
        ],
      },
    ],
  },
  {
    title: "View",
    id: "view",
    submenu: [
      { title: "Info Panel", id: "panel-btn", check: true },
      { title: "Tools Panel", id: "tools-btn", check: false },
    ],
  },
  {
    title: "Tools",
    id: "tools",
    submenu: [
      { title: "Scale", id: "scale-btn", check: false },
      { title: "Panning", id: "panning-btn", check: false },
      { title: "Selecting", id: "select-btn", check: false },
      { title: "Component", id: "component-btn", check: false },
      { type: "divider" },
      { title: "Tree", id: "tree-btn", check: true },
      { title: "Force Simulation", id: "force-btn", check: false },
    ],
  },
  {
    title: "Generator",
    id: "generator",
    submenu: [
      {
        title: "Classic",
        id: "classic",
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
                value: 5
              }
            ]
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
                value: 5
              }
            ]
          },
          {
            title: "Kₙ,ₙ",
            id: "complete-bipartite",
            link: "https://en.wikipedia.org/wiki/Complete_bipartite_graph",
            input: [
              {
                type: "number",
                label: "",
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
              }
            ]
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
                value: 5
              }
            ]
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
                value: 5
              }
            ]
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
                value: 5
              }
            ]
          },
        ]
      },
      {
        title: "Community",
        id: "community",
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
              }
            ]
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
              }
            ]
          },
        ],
      }, {
        title: "Random",
        id: "random",
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
              }
            ]
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
                step: .1,
                value: .5,
              }
            ]
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
              }
            ]
          },
        ]
      },
      {
        title: "Small",
        id: "small",
        submenu: [
          {
            title: "Krackhardt kite",
            id: "krackhardt-kite",
            link: "https://en.wikipedia.org/wiki/Krackhardt_kite_graph"
          },
        ]
      },
      {
        title: "Social",
        id: "social",
        submenu: [
          {
            title: "Florentine families",
            id: "florentine-families",
          },
          {
            title: "Zachary’s karate club",
            id: "karate-club",
            link: "https://en.wikipedia.org/wiki/Zachary%27s_karate_club"
          },
        ]
      },
    ],
  },
  {
    title: "Metrics",
    id: "metrics",
    submenu: [
      { title: "Degree Sequence", id: "list-degrees-btn" },
      { title: "Components", id: "components-btn" },
      { title: "Shortest Path", id: "shortest-path-btn" },
      { title: "Basic Information", id: "basic-info-btn" },
    ],
  },
  {
    title: "Help",
    id: "help",
    submenu: [
      {
        title: "How to use",
        id: "how-to-use",
      },
      { title: "Commands", id: "command", name: "command-btn" },
      { title: "About", id: "about" },
    ],
  },
];

