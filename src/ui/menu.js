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
      const menuItem = this.createMenu(item)
      menuBar.appendChild(menuItem);
    });

    this.container.appendChild(menuBar);
  }

  createMenu(item) {
    const menuItem = d.createElement("li");
    if (item.id) menuItem.id = item.id
    if (item.title) menuItem.textContent = item.title;

    if (item.submenu) {
      const submenu = this.createSubmenu(item.submenu);
      menuItem.appendChild(submenu);
    }

    return menuItem;
  }

  createSubmenu(submenuData) {
    const submenu = d.createElement("ul");

    submenuData.forEach(sub => {
      if (sub.type === "divider") {
        submenu.appendChild(d.createElement("hr"));
        return;
      }

      const subItem = d.createElement("li");
      if (sub.id) subItem.id = sub.id;

      if (sub.title) {
        const label = d.createElement("label");
        label.textContent = sub.title

        if (sub.link) {
          const a = d.createElement("a"); // Fix: Correct string inside createElement
          a.href = sub.link;
          a.target = "_blank";
          a.textContent = "?"; // Fix: Provide a visible clickable text
          label.insertBefore(a, label.firstChild);
        }
        subItem.appendChild(label);
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

      if (sub.input) {
        if (sub.id === "import-graph") {
          subItem.appendChild(this.createInput(sub.input[0]));
        } else {
          const div = d.createElement("div");
          sub.input.forEach(INPUT => {
            div.appendChild(this.createInput(INPUT));
          })
          subItem.appendChild(div);
        }
      }


      if (sub.name) subItem.setAttribute("name", sub.name);

      if (sub.submenu) {
        subItem.appendChild(this.createSubmenu(sub.submenu));
      }

      submenu.appendChild(subItem);
    });

    return submenu;
  }

  createInput(INPUT) {
    const input = d.createElement("input");
    input.type = INPUT.type || "text";
    input.id = INPUT.id;
    if ("hidden" in INPUT) input.hidden = INPUT.hidden;

    if (INPUT.name) input.name = INPUT.name; // Set name
    if (INPUT.placeholder) input.placeholder = INPUT.placeholder; // Set placeholder
    if (INPUT.required) input.required = true; // Mark as required

    // Apply min and max only to number, range, and date types
    if (["number", "range", "date"].includes(input.type)) {
      if (INPUT.min !== undefined) input.min = INPUT.min;
      if (INPUT.max !== undefined) input.max = INPUT.max;
      if (INPUT.step !== undefined) input.step = INPUT.step;
    }

    if (INPUT.value !== undefined) {
      if (INPUT.type === "checkbox" || INPUT.type === "radio") {
        input.checked = INPUT.value;
      } else {
        input.value = INPUT.value;
      }
    }
    return input
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
      "add-edge-btn": () => this.graphManager.connectSelectedNodes(),
      "remove-selection-btn": () => this.graphManager.dropSelectedNodesEdges(),
      "color-selection-btn": () => this.graphManager.updateSelectedNodesEdgesColor(),
      "organize-circle": () => this.layout.applyLayout("circle"),
      "complete-btn": () => this.graphManager.makeGraphComplete(),
      "color": () => this.eventBus.emit("updateSetting", { key: "color", value: val }),
      "redo-btn": () => this.eventBus.emit("redo"),
      "undo-btn": () => this.eventBus.emit("undo"),

      //View
      "panel-btn": () => this.eventBus.emit("toggleSetting", { key: "info_panel" }),
      "tools-btn": () => this.eventBus.emit("toggleSetting", { key: "tools_panel" }),

      //Tools
      "component-btn": () => this.eventBus.emit("toggleSetting", { key: "component" }),
      "scale-btn": () => this.eventBus.emit("toggleSetting", { key: "scale" }),
      "tree-btn": () => this.eventBus.emit("toggleSetting", { key: "tree" }),
      "force-btn": () => this.eventBus.emit("toggleSetting", { key: "forceSimulation" }),
      "panning-btn": () => this.eventBus.emit("toggleSetting", { key: "panning" }),
      "select-btn": () => this.eventBus.emit("toggleSetting", { key: "select" }),

      //Setting
      "vertex-label": () => this.eventBus.emit("toggleSetting", { key: "vertexLabel" }),
      "vertex-size-1": () => this.eventBus.emit("updateSetting", { key: "node_radius", value: val }),
      "edge-size-1": () => this.eventBus.emit("updateSetting", { key: "edge_size", value: val }),
      "label-size-1": () => this.eventBus.emit("updateSetting", { key: "label_size", value: val }),
      "grid-size-1": () => this.eventBus.emit("updateSetting", { key: "grid", value: val }),

      //Metrics
      "list-degrees-btn": () => this.graphManager.metric.appendAndListNodeDegrees(),
      "components-btn": () => this.graphManager.metric.countComponents(),

      //Generator
      "g-empty-1": () => this.graphManager.generator.empty(val),
      "g-cycle-1": () => this.graphManager.generator.cycle(val),
      "g-path-1": () => this.graphManager.generator.path(val),
      "g-ladder-1": () => this.graphManager.generator.ladder(val),
      "g-complete-1": () => this.graphManager.generator.complete(val),

      "g-complete-bipartite-1": () => this.graphManager.generator.completeBipartite(val, d.getElementById("g-complete-bipartite-2").value),
      "g-complete-bipartite-2": () => this.graphManager.generator.completeBipartite(d.getElementById("g-complete-bipartite-1").value, val),

      "g-caveman-1": () => this.graphManager.generator.caveman(val, d.getElementById("g-caveman-2").value),
      "g-caveman-2": () => this.graphManager.generator.caveman(d.getElementById("g-caveman-1").value, val),

      "g-connected-caveman-1": () => this.graphManager.generator.connectedCaveman(val, d.getElementById("g-connected-caveman-2").value),
      "g-connected-caveman-2": () => this.graphManager.generator.connectedCaveman(d.getElementById("g-connected-caveman-1").value, val),

      "g-clusters-1": () => this.graphManager.generator.clusters(val, d.getElementById("g-clusters-2").value, d.getElementById("g-clusters-3").value),
      "g-clusters-2": () => this.graphManager.generator.clusters(d.getElementById("g-clusters-1").value, val, d.getElementById("g-clusters-3").value),
      "g-clusters-3": () => this.graphManager.generator.clusters(d.getElementById("g-clusters-1").value, d.getElementById("g-clusters-2").value, val),

      "g-erdos-renyi-1": () => this.graphManager.generator.erdosRenyi(val, d.getElementById("g-erdos-renyi-2").value),
      "g-erdos-renyi-2": () => this.graphManager.generator.erdosRenyi(d.getElementById("g-erdos-renyi-1").value, val),

      "g-girvan-newman-1": () => this.graphManager.generator.girvanNewman(val),
      "krackhardt-kite": () => this.graphManager.generator.krackhardtkite(),
      "florentine-families": () => this.graphManager.generator.florentineFamilies(),
      "karate-club": () => this.graphManager.generator.karateClub(),

      //Help
      "how-to-use": () => window.open('https://www.youtube.com/playlist?list=PLaa8UNGS4QED9DUhAZt7O963qkScAWah3', '_blank'),
      "command": () => d.querySelector(".modal").style.display = "flex",
      "about": () => window.open('http://picinfiniti.net/', '_blank')

    };

    if (actions[menuId]) {
      actions[menuId]();
    } else {
      console.log(`No action defined for: ${menuId}`);
    }
    this.app.graphManager.graph.deselectAll()
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

