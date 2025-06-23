const d = document;

export class Menu {
  constructor(app, menuData, containerId = "menu-bar") {
    this.app = app;
    this.eventBus = app.eventBus;
    this.graphManager = app.graphManager;
    this.appSettings = app.appSettings;
    this.layout = app.layout;
    this.menuData = menuData;
    this.container = d.getElementById(containerId);
    if (!this.container) {
      console.error("Menu container not found!");
      return;
    }
    this.spaceEvent = new KeyboardEvent("keydown", {
      key: " ",
      code: "Space",
      keyCode: 32, // Deprecated but sometimes needed
      which: 32,
      bubbles: true,
    });
  }

  init() {
    this.renderMenu();
    this.attachEventListeners();
  }

  renderMenu() {
    this.container.innerHTML = ""; // Clear previous menu
    const menuBar = d.createElement("ul");

    this.menuData.forEach((item) => {
      const menuItem = this.createMenu(item);
      menuBar.appendChild(menuItem);
    });

    this.container.appendChild(menuBar);
  }

  createMenu(item) {
    const menuItem = d.createElement("li");
    if (item.id) menuItem.id = item.id;
    if (item.title) menuItem.textContent = item.title;

    if (item.submenu) {
      const submenu = this.createSubmenu(item.submenu);
      menuItem.appendChild(submenu);
    }

    return menuItem;
  }

  createSubmenu(submenuData) {
    const submenu = d.createElement("ul");

    submenuData.forEach((sub) => {
      if (sub.type === "divider") {
        submenu.appendChild(d.createElement("hr"));
        return;
      }

      const subItem = d.createElement("li");
      if (sub.id) subItem.id = sub.id;

      if (sub.title) {
        const label = d.createElement("label");
        label.textContent = sub.title;

        if (sub.link) {
          const a = d.createElement("a"); // Fix: Correct string inside createElement
          a.href = sub.link;
          a.target = "_blank";
          if (sub.label) {
            a.textContent = sub.label; // Fix: Provide a visible clickable text
          } else {
            a.textContent = "?"; // Fix: Provide a visible clickable text
            a.classList.add("border");
          }
          label.insertBefore(a, label.firstChild);
        }
        subItem.appendChild(label);
      }

      if (sub.shortcut) {
        const shortcutSpan = d.createElement("span");
        shortcutSpan.textContent = sub.shortcut;
        subItem.appendChild(shortcutSpan);
      }

      if ("check" in sub && !sub.shortcut) {
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
          sub.input.forEach((INPUT) => {
            div.appendChild(this.createInput(INPUT));
          });
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
    return input;
  }

  handleMenuAction(menuId, val) {
    const actions = {
      // File
      "new-mixed-btn": () => {
        this.graphManager.clearToMixed();
        this.eventBus.emit("updateSetting", { key: "type", value: "mixed" });
      },
      "new-digraph-btn": () => {
        this.graphManager.clearToDigraph();
        this.eventBus.emit("updateSetting", { key: "type", value: "directed" });
      },
      "new-undirected-graph-btn": () => {
        this.graphManager.clearToUndirectedGraph();
        this.eventBus.emit("updateSetting", {
          key: "type",
          value: "undirected",
        });
      },
      "import-graph": () => this.eventBus.emit("import"),
      "export-graph": () => this.eventBus.emit("export", { type: "json" }),
      "export-png": () => this.eventBus.emit("export", { type: "png" }),
      "default-settings-btn": () => this.appSettings.resetToDefault(),
      "sky-night-theme-btn": () => this.appSettings.loadNightSkyTheme(),
      reload: () => location.reload(),

      // Edit
      "add-edge-btn": () =>
        this.graphManager.connectSelectedNodes("undirected"),
      "add-edge-in-order-btn": () =>
        this.graphManager.connectSelectedNodesInOrder("undirected"),

      "add-directed-edge-btn": () =>
        this.graphManager.connectSelectedNodes("directed"),
      "add-directed-edge-in-order-btn": () =>
        this.graphManager.connectSelectedNodesInOrder("directed"),

      "remove-selection-btn": () => this.graphManager.dropSelectedNodesEdges(),
      "color-selection-btn": () =>
        this.graphManager.updateSelectedNodesEdgesColor(true, true, true, true),
      "organize-circle": () => this.layout.applyLayout("circle"),
      "complete-btn": () => this.graphManager.makeGraphComplete("undirected"),
      "complete-directed-btn": () =>
        this.graphManager.makeGraphComplete("directed"),
      "node-color": () =>
        this.eventBus.emit("updateSetting", { key: "node_color", value: val }),
      "edge-color": () =>
        this.eventBus.emit("updateSetting", { key: "edge_color", value: val }),
      "label-color": () =>
        this.eventBus.emit("updateSetting", { key: "label_color", value: val }),
      "stroke-color": () =>
        this.eventBus.emit("updateSetting", {
          key: "stroke_color",
          value: val,
        }),
      "background-color": () => {
        d.querySelector(".container").style.backgroundColor = val;
        this.eventBus.emit("updateSetting", {
          key: "background_color",
          value: val,
        });
      },
      "grid-color": () => {
        const root = d.documentElement;
        root.style.setProperty("--grid-color", val);
        this.eventBus.emit("updateSetting", { key: "grid_color", value: val });
      },
      rename: () => this.graphManager.updateSelectedName(val),
      "rename-btn": () => this.app.keyHandler.toggleInput("rename"),
      desc: () => this.graphManager.updateSelectedInfo(val),
      "desc-btn": () => this.app.keyHandler.toggleInput("desc"),
      weight: () => this.graphManager.updateSelectedWeight(val),
      "weight-btn": () => this.app.keyHandler.toggleInput("weight"),

      "redo-btn": () => this.eventBus.emit("redo"),
      "undo-btn": () => this.eventBus.emit("undo"),

      //View
      "panel-btn": () =>
        this.eventBus.emit("toggleSetting", { key: "info_panel" }),
      "tools-btn": () =>
        this.eventBus.emit("toggleSetting", { key: "tools_panel" }),
      "shortcut-chord-btn": () => d.dispatchEvent(this.spaceEvent),
      //Tools
      "component-btn": () =>
        this.eventBus.emit("toggleSetting", { key: "component" }),
      "scale-btn": () => this.eventBus.emit("toggleSetting", { key: "scale" }),
      "tree-btn": () => this.eventBus.emit("toggleSetting", { key: "tree" }),
      "force-btn": () =>
        this.eventBus.emit("toggleSetting", { key: "forceSimulation" }),
      "panning-btn": () =>
        this.eventBus.emit("toggleSetting", { key: "panning" }),
      "select-btn": () =>
        this.eventBus.emit("toggleSetting", { key: "select" }),

      "toggle-component-btn": () =>
        this.eventBus.emit("toggleSetting", { key: "component", value: val }),
      "toggle-scale-btn": () =>
        this.eventBus.emit("toggleSetting", { key: "scale", value: val }),
      "toggle-tree-btn": () =>
        this.eventBus.emit("toggleSetting", { key: "tree", value: val }),
      "toggle-force-btn": () =>
        this.eventBus.emit("toggleSetting", {
          key: "forceSimulation",
          value: val,
        }),
      "toggle-panning-btn": () =>
        this.eventBus.emit("toggleSetting", { key: "panning", value: val }),
      "toggle-select-btn": () =>
        this.eventBus.emit("toggleSetting", { key: "select", value: val }),

      "color-picker-btn": () =>
        this.eventBus.emit("toggleSetting", { key: "colorPicker" }),

      //Setting
      "vertex-label": () =>
        this.eventBus.emit("toggleSetting", { key: "vertexLabel" }),
      "edge-label": () =>
        this.eventBus.emit("toggleSetting", { key: "edgeLabel" }),
      "weight-label": () =>
        this.eventBus.emit("toggleSetting", { key: "weightLabel" }),

      "vertex-size-1": () =>
        this.eventBus.emit("updateSetting", { key: "node_radius", value: val }),
      "edge-size-1": () =>
        this.eventBus.emit("updateSetting", { key: "edge_size", value: val }),
      "label-size-1": () =>
        this.eventBus.emit("updateSetting", { key: "label_size", value: val }),
      "grid-size-1": () =>
        this.eventBus.emit("updateSetting", { key: "grid", value: val }),
      "stroke-size-1": () =>
        this.eventBus.emit("updateSetting", { key: "stroke_size", value: val }),
      "save-history": () =>
        this.eventBus.emit("toggleSetting", { key: "saveHistory" }),
      "clear-histoory-btn": () => this.graphManager.cleanLocalStorage(),

      //Metrics
      "basic-info-btn": () => this.graphManager.metric.basicInfo(),
      "list-degrees-btn": () => this.graphManager.metric.degreeSequesnce(),
      "components-btn": () => this.graphManager.metric.countComponents(),
      "neighbors-btn": () => this.graphManager.metric.neighbors(),
      "shortest-path-btn": () => this.graphManager.metric.shortestPath(),
      "density-btn": () => this.graphManager.metric.density(),
      "diameter-btn": () => this.graphManager.metric.diameter(),
      "eccentricity-btn": () => this.graphManager.metric.eccentricity(),
      "simmelian-strength-btn": () =>
        this.graphManager.metric.simmelianStrength(),
      "betweenness-centrality-btn": () =>
        this.graphManager.metric.betweennessCentrality(),
      "closeness-centrality-btn": () =>
        this.graphManager.metric.closenessCentrality(),
      "degree-centrality-btn": () =>
        this.graphManager.metric.degreeCentrality(),
      "eigenvector-centrality-btn": () =>
        this.graphManager.metric.eigenvectorCentrality(),
      "pagerank-btn": () => this.graphManager.metric.pagerank(),
      "edge-uniformity-btn": () => this.graphManager.metric.edgeUniformity(),
      "neighborhood-preservation-btn": () =>
        this.graphManager.metric.neighborhoodPreservation(),
      "stress-btn": () => this.graphManager.metric.stress(),
      "disparity-btn": () => this.graphManager.metric.disparity(),
      "clear-info-panel-btn": () =>
        (d.querySelector("#floating-panel .body-info").innerHTML = ""),

      "all-node-info-btn": () => this.graphManager.metric.allNodeInfo(),
      "all-edge-info-btn": () => this.graphManager.metric.allEdgeInfo(),
      //Generator
      //Classic
      empty: () =>
        this.graphManager.generator.empty(d.getElementById("g-empty-1").value),
      "g-empty-1": () => this.graphManager.generator.empty(val),

      cycle: () =>
        this.graphManager.generator.cycle(d.getElementById("g-cycle-1").value),
      "g-cycle-1": () => this.graphManager.generator.cycle(val),

      path: () =>
        this.graphManager.generator.path(d.getElementById("g-path-1").value),
      "g-path-1": () => this.graphManager.generator.path(val),

      ladder: () =>
        this.graphManager.generator.ladder(
          d.getElementById("g-ladder-1").value,
        ),
      "g-ladder-1": () => this.graphManager.generator.ladder(val),

      complete: () =>
        this.graphManager.generator.complete(
          d.getElementById("g-complete-1").value,
        ),
      "g-complete-1": () => this.graphManager.generator.complete(val),

      "complete-bipartite": () =>
        this.graphManager.generator.completeBipartite(
          d.getElementById("g-complete-bipartite-1").value,
          d.getElementById("g-complete-bipartite-2").value,
        ),
      "g-complete-bipartite-1": () =>
        this.graphManager.generator.completeBipartite(
          val,
          d.getElementById("g-complete-bipartite-2").value,
        ),
      "g-complete-bipartite-2": () =>
        this.graphManager.generator.completeBipartite(
          d.getElementById("g-complete-bipartite-1").value,
          val,
        ),

      //Cummunity
      caveman: () =>
        this.graphManager.generator.caveman(
          d.getElementById("g-caveman-1").value,
          d.getElementById("g-caveman-2").value,
        ),
      "g-caveman-1": () =>
        this.graphManager.generator.caveman(
          val,
          d.getElementById("g-caveman-2").value,
        ),
      "g-caveman-2": () =>
        this.graphManager.generator.caveman(
          d.getElementById("g-caveman-1").value,
          val,
        ),

      "connected-caveman": () =>
        this.graphManager.generator.connectedCaveman(
          d.getElementById("g-connected-caveman-1").value,
          d.getElementById("g-connected-caveman-2").value,
        ),
      "g-connected-caveman-1": () =>
        this.graphManager.generator.connectedCaveman(
          val,
          d.getElementById("g-connected-caveman-2").value,
        ),
      "g-connected-caveman-2": () =>
        this.graphManager.generator.connectedCaveman(
          d.getElementById("g-connected-caveman-1").value,
          val,
        ),

      //random
      clusters: () =>
        this.graphManager.generator.clusters(
          d.getElementById("g-clusters-1").value,
          d.getElementById("g-clusters-2").value,
          d.getElementById("g-clusters-3").value,
        ),
      "g-clusters-1": () =>
        this.graphManager.generator.clusters(
          val,
          d.getElementById("g-clusters-2").value,
          d.getElementById("g-clusters-3").value,
        ),
      "g-clusters-2": () =>
        this.graphManager.generator.clusters(
          d.getElementById("g-clusters-1").value,
          val,
          d.getElementById("g-clusters-3").value,
        ),
      "g-clusters-3": () =>
        this.graphManager.generator.clusters(
          d.getElementById("g-clusters-1").value,
          d.getElementById("g-clusters-2").value,
          val,
        ),

      "erdos-renyi": () =>
        this.graphManager.generator.erdosRenyi(
          d.getElementById("g-erdos-renyi-1").value,
          d.getElementById("g-erdos-renyi-2").value,
        ),
      "g-erdos-renyi-1": () =>
        this.graphManager.generator.erdosRenyi(
          val,
          d.getElementById("g-erdos-renyi-2").value,
        ),
      "g-erdos-renyi-2": () =>
        this.graphManager.generator.erdosRenyi(
          d.getElementById("g-erdos-renyi-1").value,
          val,
        ),

      "griven-newmn": () =>
        this.graphManager.generator.girvanNewman(
          d.getElementById("g-girvan-newman-1").value,
        ),
      "g-girvan-newman-1": () => this.graphManager.generator.girvanNewman(val),

      //small
      "krackhardt-kite": () => this.graphManager.generator.krackhardtkite(),

      //Social
      "florentine-families": () =>
        this.graphManager.generator.florentineFamilies(),
      "karate-club": () => this.graphManager.generator.karateClub(),

      //Constellation
      aries: () => this.graphManager.generator.zodiac.aries(),
      taurus: () => this.graphManager.generator.zodiac.taurus(),
      gemini: () => this.graphManager.generator.zodiac.gemini(),
      cancer: () => this.graphManager.generator.zodiac.cancer(),
      leo: () => this.graphManager.generator.zodiac.leo(),
      virgo: () => this.graphManager.generator.zodiac.virgo(),
      libra: () => this.graphManager.generator.zodiac.libra(),
      scorpius: () => this.graphManager.generator.zodiac.scorpius(),
      ophiuchus: () => this.graphManager.generator.zodiac.ophiuchus(),
      sagittarius: () => this.graphManager.generator.zodiac.sagittarius(),
      capricornus: () => this.graphManager.generator.zodiac.capricornus(),
      aquarius: () => this.graphManager.generator.zodiac.aquarius(),
      pisces: () => this.graphManager.generator.zodiac.pisces(),
      //Operators
      "reverse-direction": () => this.graphManager.reverseGraph(),
      "to-undirected": () => this.graphManager.toUndirectedGraph(),
      "to-directed": () => this.graphManager.toDirectedGraph(),
      "to-mixed": () => this.graphManager.toMixedGraph(),
      "to-weighted": () => this.graphManager.toWeighted(),
      "to-unweighted": () => this.graphManager.toUnweighted(),

      //Help
      "how-to-use": () =>
        window.open(
          "https://www.youtube.com/playlist?list=PLaa8UNGS4QED9DUhAZt7O963qkScAWah3",
          "_blank",
        ),
      command: () => {
        d.querySelector(".modal").style.display = "flex";
        d.querySelector(".modal .help-panel").style.display = "block";
      },
      about: () => window.open("http://picinfiniti.net/", "_blank"),

      // shortcuts
      "select-all-node": () => this.graphManager.selectAllNode(),
      "deselect-all-node": () => this.graphManager.deselectAllNode(),
      "select-next-node": () => this.graphManager.selectNextNode(),
      "select-pervious-node": () => this.graphManager.selectPerviousNode(),
      "select-all-edge": () => this.graphManager.selectAllEdge(),
      "deselect-all-edge": () => this.graphManager.deselectAllEdge(),
      "select-next-edge": () => this.graphManager.selectNextEdge(),
      "select-pervious-edge": () => this.graphManager.selectPerviousEdge(),

      //copy cut past
      "copy-subgraph": () => this.graphManager.copySubgraph(),
      "cut-subgraph": () => this.graphManager.cutSubgraph(),
      "paste-subgraph": () => this.graphManager.pasteSubgraph(),

      // color chord
      "update-node-color": () =>
        this.graphManager.updateSelectedNodesEdgesColor(
          true,
          false,
          false,
          false,
        ),
      "update-stroke-color": () =>
        this.graphManager.updateSelectedNodesEdgesColor(
          false,
          true,
          false,
          false,
        ),
      "update-edge-color": () =>
        this.graphManager.updateSelectedNodesEdgesColor(
          false,
          false,
          true,
          false,
        ),
      "update-label-color": () =>
        this.graphManager.updateSelectedNodesEdgesColor(
          false,
          false,
          false,
          true,
        ),
    };

    if (actions[menuId]) {
      actions[menuId]();
    } else {
      console.log(`No action defined for: ${menuId}`);
    }
    // this.app.graphManager.graph.deselectAll()
    // this.app.drawGraph()
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
      if (
        !target ||
        target.name == "rename" ||
        target.name == "desc" ||
        target.name == "weight"
      )
        return;
      const menuId = target.id || target.getAttribute("name");
      if (menuId) {
        this.handleMenuAction(menuId, target.value);
      }
    });
  }
}
