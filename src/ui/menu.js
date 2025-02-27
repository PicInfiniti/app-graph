const menuData = [
  {
    title: "File",
    submenu: [
      { title: "🆕 New", id: "new-btn", shortcut: "N" },
      { title: "📂 Import", id: "import-graph", shortcut: "O" },
      { title: "💾 Export", id: "export-graph", shortcut: "S" },
      { title: "🖼️ Export to PNG", id: "export-png", shortcut: "P" },
      { type: "input", id: "file-input", hidden: true },
      { type: "divider" },
      { title: "Default Setting", id: "default-settings-btn" },
    ],
  },
  {
    title: "Edit",
    submenu: [
      { title: "Organize Nodes", name: "organize-circle", shortcut: "O" },
      { title: "Complete Graph", name: "make-complete-btn", shortcut: "C" },
      { title: "Delete", name: "remove-selection-btn", shortcut: "D" },
      { title: "Assign Color", name: "color-selection-btn", shortcut: "C" },
      { title: "Add Edge", name: "add-edge-btn", shortcut: "E" },
      { type: "divider" },
      { title: "Undo", name: "undo-btn", shortcut: "U" },
      { title: "Redo", name: "redo-btn", shortcut: "Y" },
      { type: "divider" },
      {
        title: "Settings",
        submenu: [
          { type: "slider", label: "Grid", id: "grid-size", min: 0, max: 50, value: 20 },
          { type: "slider", label: "VSize", id: "vertex-size", min: 0, max: 50, value: 10 },
          { type: "slider", label: "ESize", id: "edge-size", min: 1, max: 20, value: 2 },
          { type: "slider", label: "LSize", id: "label-size", min: 0, max: 100, value: 15 },
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
      { title: "Force Simulation", id: "force-btn", check: false },
      { type: "divider" },
      {
        title: "Generator",
        submenu: [
          { type: "number", label: "Empty", id: "g-empty", min: 1, max: 500, value: 5 },
          { type: "number", label: "Kₙ", id: "g-complete", min: 1, max: 500, value: 5, link: "https://en.wikipedia.org/wiki/Complete_graph" },
          {
            type: "number-group",
            label: "Kₙ,ₙ",
            id: "g-complete-bipartite",
            min: 1,
            max: 500,
            values: [5, 5],
            link: "https://en.wikipedia.org/wiki/Complete_bipartite_graph"
          },
          { type: "number", label: "Pₙ", id: "g-path", min: 2, max: 500, value: 5, link: "https://en.wikipedia.org/wiki/Path_graph" },
          { type: "number", label: "Cₙ", id: "g-cycle", min: 3, max: 500, value: 5, link: "https://en.wikipedia.org/wiki/Cycle_graph" },
          { type: "number", label: "Lₙ", id: "g-ladder", min: 2, max: 500, value: 5, link: "https://en.wikipedia.org/wiki/Ladder_graph" },
          {
            type: "number-group",
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

export function createMenu() {
  const menuContainer = document.getElementById("menu-bar");
  if (!menuContainer) {
    console.error("Menu container not found!");
    return;
  }

  const menuBar = document.createElement("ul");

  menuData.forEach(item => {
    const menuItem = document.createElement("li");
    menuItem.textContent = item.title;

    if (item.submenu) {
      const submenu = document.createElement("ul");

      item.submenu.forEach(sub => {
        if (sub.type === "divider") {
          submenu.appendChild(document.createElement("hr"));
          return;
        }

        const subItem = document.createElement("li");

        // Create text span
        const textSpan = document.createElement("span");
        textSpan.textContent = sub.title;
        subItem.appendChild(textSpan);

        // Add shortcut key (if defined)
        if (sub.shortcut) {
          const shortcutSpan = document.createElement("span");
          shortcutSpan.classList.add("shortcut");
          shortcutSpan.textContent = `(${sub.shortcut})`;
          subItem.appendChild(shortcutSpan);
        }

        // Add checkmark (if applicable)
        if (sub.check !== undefined) {
          const checkSpan = document.createElement("span");
          checkSpan.classList.add("check");
          checkSpan.innerHTML = sub.check ? "&#10004;" : ""; // ✔️ if checked
          subItem.appendChild(checkSpan);

          // Toggle checkmark on click
          subItem.addEventListener("click", () => {
            sub.check = !sub.check;
            checkSpan.innerHTML = sub.check ? "&#10004;" : "";
          });
        }

        if (sub.id) subItem.id = sub.id;
        if (sub.name) subItem.setAttribute("name", sub.name);
        if (sub.action) subItem.addEventListener("click", sub.action);

        submenu.appendChild(subItem);
      });

      menuItem.appendChild(submenu);
    }

    menuBar.appendChild(menuItem);
  });

  menuContainer.innerHTML = ""; // Clear old menu before appending
  menuContainer.appendChild(menuBar);
}

// Load menu dynamically inside #menu-bar
document.addEventListener("DOMContentLoaded", () => {
  createMenu(menuData);
});

