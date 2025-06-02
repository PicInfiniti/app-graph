import { EventBus } from "./eventBus";
const d = document;

export class KeyHandler {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.rename = d.querySelector(".rename-panel");
    this.desc = d.querySelector(".desc-panel");
    this.Shift = false;
    this.Ctrl = false;
    this.Alt = false;
    this.shortcuts = {
      n: "new-btn",
      N: "new-digraph-btn",
      o: "import-graph",
      s: "export-graph",
      p: "export-png",
      u: "undo-btn",
      d: "remove-selection-btn",
      c: "color-selection-btn",
      e: "add-edge-btn",
      E: "add-directed-edge-btn",
      O: "organize-circle",
      C: "complete-btn",
      r: "rename-btn",
      i: "desc-btn",
      a: "all-node-info-btn",
      q: "clear-info-panel-btn",
      F5: "reload",
    };

    this.AltKeys = {
      a: "all-edge-info-btn",
    };

    this.CtrlKeys = {
      r: "redo-btn",
    };

    this.ShiftKeys = {};
  }

  init() {
    d.addEventListener("keydown", (event) => {
      if (event.target.tagName === "INPUT" && event.key != "Enter") return;
      event.preventDefault();

      EventBus.emit("key:pressed", { key: event.key });

      switch (event.key) {
        case "Control":
          this.Ctrl = true;
          break;
        case "Shift":
          this.Shift = true;
          break;

        case "Alt":
          this.Alt = true;
          break;

        default:
          if (this.desc.style.display === "flex") {
            if (event.key === "Enter") {
              const input = document.getElementById("desc");
              const value = input.value;
              input.value = "";
              this.desc.style.display = "none";
              d.querySelector(".modal").style.display = "none";
              this.app.menu.handleMenuAction("desc", value); // Trigger the corresponding menu item
            }
          } else if (this.rename.style.display === "flex") {
            if (event.key === "Enter") {
              const input = document.getElementById("rename");
              const value = input.value;
              input.value = "";
              this.rename.style.display = "none";
              d.querySelector(".modal").style.display = "none";
              this.app.menu.handleMenuAction("rename", value); // Trigger the corresponding menu item
            }
          } else {
            if (this.Alt) {
              if (this.AltKeys[event.key]) {
                this.app.menu.handleMenuAction(this.AltKeys[event.key]); // Trigger the corresponding menu item
              }
            } else if (this.Ctrl) {
              if (this.CtrlKeys[event.key]) {
                this.app.menu.handleMenuAction(this.CtrlKeys[event.key]); // Trigger the corresponding menu item
              }
            } else if (this.Shift) {
              if (this.ShiftKeys[event.key]) {
                this.app.menu.handleMenuAction(this.ShiftKeys[event.key]); // Trigger the corresponding menu item
              }
            } else {
              if (this.shortcuts[event.key]) {
                this.app.menu.handleMenuAction(this.shortcuts[event.key]); // Trigger the corresponding menu item
              }
            }
          }
          break;
      }
    });

    d.addEventListener("keyup", (event) => {
      switch (event.key) {
        case "Control":
          this.Ctrl = false;
          break;
        case "Shift":
          this.Shift = false;
          break;

        case "Alt":
          this.Alt = false;
          break;

        default:
          this.eventBus.emit("key:release", { key: event.key });
          break;
      }
    });
  }
}
