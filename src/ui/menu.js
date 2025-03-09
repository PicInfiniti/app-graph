import { EventBus } from "../core/eventBus";

const menuData = [
  {
    title: "File",
    submenu: [
      { title: "🆕 New", id: "new-btn", shortcut: "(N)" },
      { title: "📂 Import", id: "import-graph", shortcut: "(O)" },
      { title: "💾 Export", id: "export-graph", shortcut: "(S)" },
      { title: "🖼️ Export to PNG", id: "export-png", shortcut: "(P)" },
      { type: "input", id: "file-input", hidden: true },
      { type: "divider" },
      { title: "Default Setting", id: "default-settings-btn" },
    ],
  },
  {
    title: "Edit",
    submenu: [
      { title: "Organize Nodes", name: "organize-circle", shortcut: "(O)" },
      { title: "Complete Graph", name: "make-complete-btn", shortcut: "(C)" },
      { title: "Delete", name: "remove-selection-btn", shortcut: "(D)" },
      { title: "Assign Color", name: "color-selection-btn", shortcut: "(C)" },
      { title: "Add Edge", name: "add-edge-btn", shortcut: "(E)" },
      { type: "divider" },
      { title: "Undo", name: "undo-btn", shortcut: "(U)" },
      { title: "Redo", name: "redo-btn", shortcut: "(Y)" },
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

export function createMenu() {
  const menuContainer = document.getElementById("menu-bar");
  if (!menuContainer) {
    console.error("Menu container not found!");
    return;
  }

  const menuBar = document.createElement("ul");

  menuData.forEach(item => {
    // Edit example
    const menuItem = document.createElement("li");
    menuItem.textContent = item.title;

    if (item.submenu) {
      const submenu = document.createElement("ul");

      item.submenu.forEach(sub => {
        if (sub.type === "divider") {
          submenu.appendChild(document.createElement("hr"));
          return;
        }

        // Add Edge
        const subItem = document.createElement("li");
        if (sub.title) {
          const span = document.createElement("span")
          span.textContent = sub.title
          subItem.appendChild(span)
        }
        if (sub.shortcut) {
          const span = document.createElement("span")
          span.textContent = sub.shortcut
          subItem.appendChild(span)
        }

        if ("check" in sub) {
          const span = document.createElement("span");
          span.innerHTML = "&#10004;"
          span.classList.add("check"); // Correct way to add a class

          if (!sub.check) {
            span.classList.add("hidden"); // Correct way to add a class dynamically
          }

          subItem.appendChild(span);
        }

        if (sub.id) subItem.id = sub.id;
        if (sub.name) subItem.setAttribute("name", sub.name);


        // Handle nested submenu
        if (sub.submenu) {
          const nestedSubmenu = document.createElement("ul");

          sub.submenu.forEach(nestedSub => {
            const nestedItem = document.createElement("li");
            if (nestedSub.id) nestedItem.id = nestedSub.id;
            if (nestedSub.name) nestedItem.setAttribute("name", nestedSub.name);
            if (nestedSub.title) {
              const span = document.createElement("span")
              span.textContent = nestedSub.title
              nestedItem.appendChild(span)

              if ("check" in nestedSub) {
                const span = document.createElement("span");
                span.innerHTML = "&#10004;"
                span.classList.add("check"); // Correct way to add a class

                if (!nestedSub.check) {
                  span.classList.add("hidden"); // Correct way to add a class dynamically
                }

                nestedItem.appendChild(span);
              }
            }

            if (nestedSub.label) {
              const label = document.createElement("label");
              const span = document.createElement("span");
              span.innerHTML = nestedSub.label; // Allows HTML inside <span>
              label.appendChild(span);

              if (nestedSub.link) {
                const a = document.createElement("a"); // Fix: Correct string inside createElement
                a.href = nestedSub.link;
                a.target = "_blank";
                a.textContent = "?"; // Fix: Provide a visible clickable text
                label.appendChild(a);
              }
              nestedItem.appendChild(label);
            }

            if (nestedSub.dec === "input") {
              const div = document.createElement("div");

              // Function to create an input field
              const createInput = (idSuffix = "", value = 2) => {
                const input = document.createElement("input");
                input.type = nestedSub.type || "text"; // Default to "text" if missing

                if (nestedSub.id) input.id = nestedSub.id + idSuffix; // Ensure unique ID
                if (nestedSub.name) input.name = nestedSub.name; // Set name
                if (nestedSub.placeholder) input.placeholder = nestedSub.placeholder; // Set placeholder
                if (nestedSub.required) input.required = true; // Mark as required

                // Apply min and max only to number, range, and date types
                if (["number", "range", "date"].includes(input.type)) {
                  if (nestedSub.min !== undefined) input.min = nestedSub.min;
                  if (nestedSub.max !== undefined) input.max = nestedSub.max;
                }

                // Handle value assignment properly
                if (value !== undefined) {
                  if (input.type === "checkbox" || input.type === "radio") {
                    input.checked = value;
                  } else {
                    input.value = value;
                  }
                }

                return input;
              };

              // If `nestedSub.values` exists, create two inputs; otherwise, create one
              if (nestedSub.values) {
                div.appendChild(createInput("-1", nestedSub.values[0]));
                div.appendChild(createInput("-2", nestedSub.values[1]));
              } else {
                div.appendChild(createInput("", nestedSub.value));
              }

              nestedItem.appendChild(div);
            }

            nestedSubmenu.appendChild(nestedItem);

          });

          subItem.appendChild(nestedSubmenu);
        }

        submenu.appendChild(subItem);
      });

      menuItem.appendChild(submenu);
    }

    menuBar.appendChild(menuItem);
  });

  menuContainer.innerHTML = ""; // Clear old menu before appending
  menuContainer.appendChild(menuBar);
}

export function handleMenuAction(menuId) {
  switch (menuId) {
    // File 
    case "new-btn":
      EventBus.emit('clear');
      console.log("New file created!");
      break;
    case "import-graph":
      console.log("Importing graph...");
      break;
    case "export-graph":
      console.log("Exporting graph...");
      break;
    case "export-png":
      console.log("Exporting as PNG...");
      break;
    case "default-settings-btn":
      EventBus.emit("resetSettings");
      console.log("Resetting to default settings...");
      break;

    // Edit
    case "redo-btn":
      EventBus.emit('redo');
      console.log("Redo...");
      break;
    case "undo-btn":
      EventBus.emit('undo');
      console.log("Undo...");
      break;
    // Tools 
    case "panel-btn":
      EventBus.emit("toggleSetting", { key: "info_panel" });
      console.log("Toggling Info Panel...");
      break;
    case "drag-btn":
      EventBus.emit("toggleSetting", { key: "dragComponent" });
      console.log("Toggling Component...");
      break;
    case "scale-btn":
      EventBus.emit("toggleSetting", { key: "scale" });
      console.log("Scaling...");
      break;
    case "force-btn":
      EventBus.emit("toggleSetting", { key: "forceSimulation" });
      console.log("Starting Force Simulation...");
      break;

    // Metrics
    case "list-degrees-btn":
      console.log("Calculating Degree Sequence...");
      break;
    case "components-btn":
      console.log("Analyzing Components...");
      break;
    case "command-btn":
      console.log("Opening Commands Menu...");
      break;
    case "organize-circle":
      console.log("organize circle");
      break;
    default:
      console.log(`No action defined for: ${menuId}`);
  }
}


document.addEventListener("click", function (event) {
  const target = event.target.closest("li"); // Find closest <li> parent

  if (!target) return; // If not clicking on <li>, ignore

  const menuId = target.id || target.getAttribute("name"); // Get menu ID/name
  if (menuId) {
    handleMenuAction(menuId);
  }
});

