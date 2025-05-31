import { EventBus } from "./eventBus";
const d = document;

export class KeyHandler {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.rename = d.querySelector(".rename-panel");
    this.desc = d.querySelector(".desc-panel");
    this.shortcuts = {
      n: "new-btn",
      N: "new-digraph-btn",
      o: "import-graph",
      s: "export-graph",
      p: "export-png",
      u: "undo-btn",
      R: "redo-btn",
      d: "remove-selection-btn",
      c: "color-selection-btn",
      e: "add-edge-btn",
      E: "add-directed-edge-btn",
      O: "organize-circle",
      C: "complete-btn",
      r: "rename-btn",
      i: "desc-btn",
      q: "clear-info-panel-btn",
    };
  }

  init() {
    d.addEventListener("keydown", (event) => {
      EventBus.emit("key:pressed", { key: event.key });
      if (this.desc.style.display === "flex") {
        if (event.key === "Enter") {
          const input = document.getElementById("desc");
          const value = input.value;
          if (value) {
            input.value = "";
            this.desc.style.display = "none";
            d.querySelector(".modal").style.display = "none";
            this.app.menu.handleMenuAction("desc", value); // Trigger the corresponding menu item
          } else {
            this.app.graphManager.metric.addInfo("Write Somthing!");
            this.app.graphManager.metric.addLine();
          }
        }
      } else if (this.rename.style.display === "flex") {
        if (event.key === "Enter") {
          const input = document.getElementById("rename");
          const value = input.value;
          if (value) {
            input.value = "";
            this.rename.style.display = "none";
            d.querySelector(".modal").style.display = "none";
            this.app.menu.handleMenuAction("rename", value); // Trigger the corresponding menu item
          } else {
            this.app.graphManager.metric.addInfo("Write Somthing!");
            this.app.graphManager.metric.addLine();
          }
        }
      } else {
        if (this.shortcuts[event.key]) {
          this.app.menu.handleMenuAction(this.shortcuts[event.key]); // Trigger the corresponding menu item
        }
      }
    });

    d.addEventListener("keyup", (event) => {
      this.eventBus.emit("key:release", { key: event.key });
    });
  }
}
