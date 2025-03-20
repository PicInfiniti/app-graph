const d = document;

export class Menu {
  constructor(app, menuData, containerId = "menu-bar") {
    this.app = app;
    this.eventBus = app.eventBus
    this.graphManager = app.graphManager
    this.layout = app.layout
    this.menuData = menuData;
    this.container = d.getElementById(containerId);
    if (!this.container) {
      console.error("Menu container not found!");
      return;
    }
  }

  init() {
    this.renderMenu();
    this.attachEventListeners();
  }

  renderMenu() {
    this.container.innerHTML = ""; // Clear previous menu
    const menuBar = d.createElement("ul");

    this.menuData.forEach(item => {
      const menuItem = d.createElement("li");
      menuItem.textContent = item.title;

      if (item.submenu) {
        const submenu = this.createSubmenu(item.submenu);
        menuItem.appendChild(submenu);
      }

      menuBar.appendChild(menuItem);
    });

    this.container.appendChild(menuBar);
  }

  createSubmenu(submenuData) {
    const submenu = d.createElement("ul");

    submenuData.forEach(sub => {
      if (sub.type === "divider") {
        submenu.appendChild(d.createElement("hr"));
        return;
      }
      const subItem = d.createElement("li");

      if (sub.title) {
        const span = d.createElement("span");
        span.textContent = sub.title;
        subItem.appendChild(span);

      }

      if (sub.shortcut) {
        const shortcutSpan = d.createElement("span");
        shortcutSpan.textContent = sub.shortcut;
        subItem.appendChild(shortcutSpan);
      }

      if ("check" in sub) {
        const checkSpan = d.createElement("span");
        checkSpan.innerHTML = "&#10004;";
        checkSpan.classList.add("check");
        if (!sub.check) checkSpan.classList.add("hidden");
        subItem.appendChild(checkSpan);
      }

      if (sub.label) {
        const label = d.createElement("label");
        const span = d.createElement("span");
        span.innerHTML = sub.label; // Allows HTML inside <span>
        label.appendChild(span);

        if (sub.link) {
          const a = d.createElement("a"); // Fix: Correct string inside createElement
          a.href = sub.link;
          a.target = "_blank";
          a.textContent = "?"; // Fix: Provide a visible clickable text
          label.appendChild(a);
        }
        subItem.appendChild(label);
      }

      if (sub.input) {
        const input = d.createElement("input");
        input.type = sub.input.type || "text";
        input.id = sub.input.id;
        if ("hidden" in sub.input) input.hidden = sub.input.hidden;
        subItem.appendChild(input);
      }

      if (sub.dec === "input") {
        const div = d.createElement("div");

        // Function to create an input field
        const createInput = (idSuffix = "", value = 3) => {
          const input = d.createElement("input");
          input.type = sub.type || "text"; // Default to "text" if missing

          if (sub.id) input.id = sub.id + idSuffix; // Ensure unique ID
          if (sub.name) input.name = sub.name; // Set name
          if (sub.placeholder) input.placeholder = sub.placeholder; // Set placeholder
          if (sub.required) input.required = true; // Mark as required

          // Apply min and max only to number, range, and date types
          if (["number", "range", "date"].includes(input.type)) {
            if (sub.min !== undefined) input.min = sub.min;
            if (sub.max !== undefined) input.max = sub.max;
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

        // If `sub.values` exists, create two inputs; otherwise, create one
        if (sub.values) {
          sub.values.forEach((item, index) => {
            div.appendChild(createInput(`-${index + 1}`, item));
          });
        } else {
          div.appendChild(createInput("", sub.value));
        }

        subItem.appendChild(div);
      }

      if (sub.dec != "input" && sub.id) subItem.id = sub.id;
      if (sub.name) subItem.setAttribute("name", sub.name);

      if (sub.submenu) {
        subItem.appendChild(this.createSubmenu(sub.submenu));
      }

      submenu.appendChild(subItem);
    });

    return submenu;
  }

  handleMenuAction(menuId, val) {
    const actions = {
      // File 
      "new-btn": () => this.graphManager.clear(),
      "import-graph": () => this.eventBus.emit("import"),
      "export-graph": () => this.eventBus.emit("export", { type: "json" }),
      "export-png": () => this.eventBus.emit("export", { type: "png" }),
      "default-settings-btn": () => this.eventBus.emit("resetSettings"),

      // Edit
      "add-edge-btn": () => this.graphManager.addEdges(this.app.selectedNodes),
      "remove-selection-btn": () => this.graphManager.dropNodesEdges(this.app.selectedNodes, this.app.selectedEdges),
      "color-selection-btn": () => this.graphManager.updateNodesEdgesColor(this.app.selectedNodes, this.app.selectedEdges),
      "organize-circle": () => this.layout.applyLayout("circle"),
      "complete-btn": () => this.graphManager.makeGraphComplete(),
      "color": () => this.eventBus.emit("updateSetting", { key: "color", value: val }),
      "redo-btn": () => this.eventBus.emit("redo"),
      "undo-btn": () => this.eventBus.emit("undo"),

      //View
      "panel-btn": () => this.eventBus.emit("toggleSetting", { key: "info_panel" }),
      "tools-btn": () => this.eventBus.emit("toggleSetting", { key: "tools_panel" }),

      //Tools
      "components-btn": () => this.graphManager.metric.countComponents(),
      "drag-btn": () => this.eventBus.emit("toggleSetting", { key: "dragComponent" }),
      "scale-btn": () => this.eventBus.emit("toggleSetting", { key: "scale" }),
      "tree-btn": () => this.eventBus.emit("toggleSetting", { key: "tree" }),
      "force-btn": () => this.eventBus.emit("toggleSetting", { key: "forceSimulation" }),
      "panning-btn": () => this.eventBus.emit("toggleSetting", { key: "panning" }),

      //Setting
      "vertex-label": () => this.eventBus.emit("toggleSetting", { key: "vertexLabel" }),
      "vertex-size": () => this.eventBus.emit("updateSetting", { key: "node_radius", value: val }),
      "edge-size": () => this.eventBus.emit("updateSetting", { key: "edge_size", value: val }),
      "label-size": () => this.eventBus.emit("updateSetting", { key: "label_size", value: val }),
      "grid-size": () => this.eventBus.emit("updateSetting", { key: "grid", value: val }),

      //Metrics
      "list-degrees-btn": () => this.graphManager.metric.appendAndListNodeDegrees(),
      "command-btn": () => d.querySelector(".modal").style.display = "flex",

      //Generator
      "g-empty": () => this.graphManager.generator.empty(val),
      "g-complete": () => this.graphManager.generator.complete(val),
      "g-cycle": () => this.graphManager.generator.cycle(val),
      "g-path": () => this.graphManager.generator.path(val),
      "g-ladder": () => this.graphManager.generator.ladder(val),
      "g-complete-bipartite-1": () => this.graphManager.generator.completeBipartite(val, d.getElementById("g-complete-bipartite-2").value),
      "g-complete-bipartite-2": () => this.graphManager.generator.completeBipartite(d.getElementById("g-complete-bipartite-1").value, val),
      "g-caveman-1": () => this.graphManager.generator.caveman(val, d.getElementById("g-caveman-2").value),
      "g-caveman-2": () => this.graphManager.generator.caveman(d.getElementById("g-caveman-1").value, val),
      "g-connected-caveman-1": () => this.graphManager.generator.connectedCaveman(val, d.getElementById("g-connected-caveman-2").value),
      "g-connected-caveman-2": () => this.graphManager.generator.connectedCaveman(d.getElementById("g-connected-caveman-1").value, val),

      "clusters-btn-1": () => this.graphManager.generator.clusters(val, d.getElementById("clusters-btn-2").value, d.getElementById("clusters-btn-3").value),
      "clusters-btn-2": () => this.graphManager.generator.clusters(d.getElementById("clusters-btn-1").value, val, d.getElementById("clusters-btn-3").value),
      "clusters-btn-3": () => this.graphManager.generator.clusters(d.getElementById("clusters-btn-1").value, d.getElementById("clusters-btn-2").value, val),

      "erdosRenyi-1": () => this.graphManager.generator.erdosRenyi(val, d.getElementById("erdosRenyi-2").value),
      "erdosRenyi-2": () => this.graphManager.generator.erdosRenyi(d.getElementById("erdosRenyi-1").value, val),
      "girvanNewman": () => this.graphManager.generator.girvanNewman(val),
      "krackhardtkite": () => this.graphManager.generator.krackhardtkite(),
      "florentineFamilies": () => this.graphManager.generator.florentineFamilies(),
      "karateClub": () => this.graphManager.generator.karateClub()
    };

    if (actions[menuId]) {
      actions[menuId]();
    } else {
      console.log(`No action defined for: ${menuId}`);
    }
    this.app.selectedNodes.clear()
    this.app.selectedEdges.clear()

  }

  attachEventListeners() {
    d.addEventListener("click", (event) => {
      if (event.target.tagName === "INPUT") return;
      const target = event.target.closest("li");
      if (!target) return;

      const menuId = target.id || target.getAttribute("name");
      if (menuId) {
        this.handleMenuAction(menuId);
      }
    });

    d.addEventListener("input", (event) => {
      const target = event.target;
      if (!target) return;
      const menuId = target.id || target.getAttribute("name");
      if (menuId) {
        this.handleMenuAction(menuId, target.value);
      }
    });
  }
}

