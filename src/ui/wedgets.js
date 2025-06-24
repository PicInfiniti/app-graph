import interact from "interactjs";
import { Metric } from "../graph/metrics";

const d = document;

export class Widget {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.settings = app.settings;
    this.mettric = new Metric(app);

    this.panels = {
      info: d.getElementById("floating-panel"),
      tools: d.getElementById("tools-panel"),
      graphs: d.getElementById("graphs-panel"),
    };

    this.handels = {
      info: "#info",
      tools: "#tools",
      graphs: "#graphs",
    };

    this.addEventListeners();
    this.makePanelsDraggable();
    this.listeners();
    this.contexMenu();
  }

  init() {
    this.togglePanel("info", "#panel-btn .check", this.settings.info_panel);
    this.togglePanel("tools", "#tools-btn .check", this.settings.tools_panel); // Add event listeners for button clicks
    this.togglePanel(
      "graphs",
      "#graphs-btn .check",
      this.settings.graphs_panel,
    ); // Add event listeners for button clicks
  }

  contexMenu() {
    const contextMenu = d.getElementById("custom-context-menu");
    d.addEventListener("contextmenu", (event) => {
      event.preventDefault();

      const menu = d.getElementById("custom-context-menu");
      const menuWidth = menu.offsetWidth;
      const menuHeight = menu.offsetHeight;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      let x = event.pageX;
      let y = event.pageY;

      // Adjust position if menu goes off the right edge
      if (x + menuWidth > screenWidth) {
        x -= menuWidth; // Move left
      }

      // Adjust position if menu goes off the bottom edge
      if (y + menuHeight > screenHeight) {
        y -= menuHeight; // Move up
      }

      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
      menu.style.display = "block";
    });

    // Hide menu when clicking elsewhere
    d.addEventListener("click", () => {
      d.getElementById("custom-context-menu").style.display = "none";
    });
  }

  togglePanel(panelKey, buttonSelector, isVisible) {
    const panel = this.panels[panelKey];
    const button = d.querySelector(buttonSelector);

    button.classList.toggle("hidden", !isVisible);
    panel.style.display = isVisible ? "flex" : "none";

    if (!isVisible) {
      this.resetPanel(panel);
    }
  }

  resetPanel(panel) {
    panel.style.transform = "translate(0px, 0px)";
    panel.setAttribute("data-x", 0);
    panel.setAttribute("data-y", 0);
  }

  addEventListeners() {
    const infoClose = d.querySelector("#floating-panel .close");
    const infoMax = d.querySelector("#floating-panel .max");
    const toolsClose = d.querySelector("#tools-panel .close");
    const graphsClose = d.querySelector("#graphs-panel .close");

    if (infoClose) {
      infoClose.addEventListener("click", () => {
        this.eventBus.emit("toggleSetting", { key: "info_panel" });
      });
    }

    if (infoMax) {
      infoMax.addEventListener("click", () => {
        this.resetPanel(this.panels.info);
        d.querySelector("#floating-panel").classList.toggle("MAX");
      });
    }

    if (toolsClose) {
      toolsClose.addEventListener("click", () => {
        this.eventBus.emit("toggleSetting", { key: "tools_panel" });
      });
    }

    if (graphsClose) {
      graphsClose.addEventListener("click", () => {
        this.eventBus.emit("toggleSetting", { key: "graphs_panel" });
      });
    }
  }

  makePanelsDraggable() {
    Object.keys(this.panels).forEach((key) => {
      if (this.panels[key] && this.handels[key]) {
        this.makeDraggable(this.panels[key], this.handels[key]);
      }
    });
  }

  makeDraggable(panel, handleSelector) {
    // Initialize the panel as draggable with Interact.js
    interact(panel).draggable({
      // Only allow dragging from the specified handle (a CSS selector)
      allowFrom: handleSelector,
      listeners: {
        move(event) {
          const target = event.target;
          // Get current translation values or default to 0
          let x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
          let y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

          // Apply the translation using CSS transform
          target.style.transform = `translate(${x}px, ${y}px)`;

          // Store the new position in data attributes
          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);
        },
      },
    });
  }

  listeners() {
    d.querySelector("widgets #tools-panel .scale").addEventListener(
      "click",
      (event) => {
        this.eventBus.emit("toggleSetting", { key: "scale" });
      },
    );

    d.querySelector("widgets #tools-panel .tree").addEventListener(
      "click",
      (event) => {
        this.eventBus.emit("toggleSetting", { key: "tree" });
      },
    );

    d.querySelector("widgets #tools-panel .force").addEventListener(
      "click",
      (event) => {
        this.eventBus.emit("toggleSetting", { key: "forceSimulation" });
      },
    );

    d.querySelector("widgets #tools-panel .panning").addEventListener(
      "click",
      (event) => {
        this.eventBus.emit("toggleSetting", { key: "panning" });
      },
    );

    d.querySelector("widgets #tools-panel .select").addEventListener(
      "click",
      (event) => {
        this.eventBus.emit("toggleSetting", { key: "select" });
      },
    );

    d.querySelector("widgets #tools-panel .component").addEventListener(
      "click",
      (event) => {
        this.eventBus.emit("toggleSetting", { key: "component" });
      },
    );

    d.querySelector("widgets #tools-panel .color-picker").addEventListener(
      "click",
      (event) => {
        this.eventBus.emit("toggleSetting", { key: "colorPicker" });
      },
    );

    //Graphs
    const panel = d.querySelector("widgets #graphs-panel");
    const ul = panel.querySelector("ul");
    const lis = () => ul.querySelectorAll("li");

    panel.addEventListener("click", (event) => {
      const li = event.target.closest("li");
      const isCtrl = event.ctrlKey || event.metaKey;

      if (li) {
        if (isCtrl) {
          if (li.classList.contains("select")) {
            if (panel.querySelectorAll("li.select").length > 1) {
              li.classList.remove("select");
            }
          } else {
            li.classList.add("select");
          }
        } else {
          lis().forEach((el) => el.classList.remove("select"));
          li.classList.add("select");
        }
        printSelectedIds();
      } else if (event.target === panel) {
        const items = lis();
        const selectedItems = Array.from(items).filter((el) =>
          el.classList.contains("select"),
        );
        let keep = selectedItems[0] || items[0];

        items.forEach((el) => el.classList.remove("select"));
        if (keep) {
          keep.classList.add("select");
        }
        printSelectedIds();
      }
    });

    // Add keydown listener on the document (or panel if you prefer)
    d.addEventListener("keydown", (event) => {
      const isCtrl = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;
      const arrowDown = event.key === "ArrowDown";
      const arrowUp = event.key === "ArrowUp";

      if (!isCtrl || (!arrowDown && !arrowUp)) return;

      const items = Array.from(lis());
      const selected = panel.querySelector("li.select"); // get one selected
      let index = items.indexOf(selected);

      // Determine next index
      if (arrowDown) {
        index = (index + 1) % items.length;
      } else if (arrowUp) {
        index = (index - 1 + items.length) % items.length;
      }

      const nextLi = items[index];

      if (isShift) {
        // Multi-select add
        nextLi.classList.add("select");
      } else {
        // Single select, remove others
        items.forEach((el) => el.classList.remove("select"));
        nextLi.classList.add("select");
      }
      printSelectedIds(); // 💡 Add this to log the selection
      event.preventDefault(); // prevent page scroll
    });

    function printSelectedIds() {
      const selected = panel.querySelectorAll("li.select");
      const numbers = Array.from(selected)
        .map((li) => {
          const match = li.id.match(/\d+$/); // match number at end of id
          return match ? parseInt(match[0], 10) : null;
        })
        .filter((num) => num !== null);
      console.log("Selected numbers:", numbers);
    }
  }
}
