export class Menu {
  constructor(app, menuData, containerId = "menu-bar") {
    this.app = app;
    this.eventBus = app.eventBus
    this.menuData = menuData;
    this.container = document.getElementById(containerId);
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
    const menuBar = document.createElement("ul");

    this.menuData.forEach(item => {
      const menuItem = document.createElement("li");
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
    const submenu = document.createElement("ul");

    submenuData.forEach(sub => {
      if (sub.type === "divider") {
        submenu.appendChild(document.createElement("hr"));
        return;
      }

      const subItem = document.createElement("li");
      if (sub.title) {
        const span = document.createElement("span");
        span.textContent = sub.title;
        subItem.appendChild(span);
      }

      if (sub.shortcut) {
        const shortcutSpan = document.createElement("span");
        shortcutSpan.textContent = sub.shortcut;
        subItem.appendChild(shortcutSpan);
      }

      if ("check" in sub) {
        const checkSpan = document.createElement("span");
        checkSpan.innerHTML = "&#10004;";
        checkSpan.classList.add("check");
        if (!sub.check) checkSpan.classList.add("hidden");
        subItem.appendChild(checkSpan);
      }

      if (sub.input) {
        const input = document.createElement("input");
        input.type = sub.input.type || "text";
        input.id = sub.input.id;
        if ("hidden" in sub.input) input.hidden = sub.input.hidden;
        subItem.appendChild(input);
      }

      if (sub.id) subItem.id = sub.id;
      if (sub.name) subItem.setAttribute("name", sub.name);

      if (sub.submenu) {
        subItem.appendChild(this.createSubmenu(sub.submenu));
      }

      submenu.appendChild(subItem);
    });

    return submenu;
  }

  handleMenuAction(menuId) {
    const actions = {
      "new-btn": () => this.eventBus.emit("clear"),
      "import-graph": () => this.eventBus.emit("import"),
      "export-graph": () => this.eventBus.emit("export", { type: "json" }),
      "export-png": () => this.eventBus.emit("export", { type: "png" }),
      "default-settings-btn": () => this.eventBus.emit("resetSettings"),
      "redo-btn": () => this.eventBus.emit("redo"),
      "undo-btn": () => this.eventBus.emit("undo"),
      "panel-btn": () => this.eventBus.emit("toggleSetting", { key: "info_panel" }),
      "drag-btn": () => this.eventBus.emit("toggleSetting", { key: "dragComponent" }),
      "scale-btn": () => this.eventBus.emit("toggleSetting", { key: "scale" }),
      "tree-btn": () => this.eventBus.emit("toggleSetting", { key: "tree" }),
      "force-btn": () => this.eventBus.emit("toggleSetting", { key: "forceSimulation" }),
      "list-degrees-btn": () => console.log("Calculating Degree Sequence..."),
      "components-btn": () => console.log("Analyzing Components..."),
      "command-btn": () => console.log("Opening Commands Menu..."),
      "organize-circle": () => console.log("Organizing Circle"),
    };

    if (actions[menuId]) {
      actions[menuId]();
      console.log(`Action triggered: ${menuId}`);
    } else {
      console.log(`No action defined for: ${menuId}`);
    }
  }

  attachEventListeners() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("li");
      if (!target) return;

      const menuId = target.id || target.getAttribute("name");
      if (menuId) {
        this.handleMenuAction(menuId);
      }
    });
  }
}

