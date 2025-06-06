import { EventBus } from "./eventBus";
import { ShortcutChord } from "./shortcutChord.js";

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
    this.shortcutChord = new ShortcutChord(app);

    this.shortcuts = {
      n: "new-btn",
      o: "import-graph",
      s: "export-graph",
      u: "undo-btn",
      d: "remove-selection-btn",
      c: "color-selection-btn",
      e: "add-edge-btn",
      a: "all-node-info-btn",
      q: "clear-info-panel-btn",
      y: "copy-subgraph",
      x: "cut-subgraph",
      p: "paste-subgraph",
      F5: "reload",
      ArrowUp: "select-all-node",
      ArrowDown: "deselect-all-node",
      ArrowRight: "select-next-node",
      ArrowLeft: "select-pervious-node",
    };

    this.AltKeys = {
      a: "all-edge-info-btn",
      ArrowUp: "select-all-edge",
      ArrowDown: "deselect-all-edge",
      ArrowRight: "select-next-edge",
      ArrowLeft: "select-pervious-edge",
      k: "select-all-edge",
      j: "deselect-all-edge",
      l: "select-next-edge",
      h: "select-pervious-edge",
    };

    this.CtrlKeys = {
      r: "redo-btn",
    };

    this.ShiftKeys = {
      C: "complete-btn",
      N: "new-digraph-btn",
      O: "organize-circle",
      E: "add-directed-edge-btn",
      P: "export-png",
      ArrowRight: "select-next-node",
      ArrowLeft: "select-pervious-node",
    };

    this.exceptionKey = ["ArrowUp", "ArrowDown", "arrowLeft", "ArrowRight"];
  }

  init() {
    this.shortcutChord.init();

    d.addEventListener("keydown", (event) => {
      if (event.repeat && !this.exceptionKey.includes(event.key)) return;
      if (event.target.tagName === "INPUT" && event.key != "Enter") return;
      event.preventDefault();
      this.eventBus.emit("key:pressed", { key: event.key });
      if (this.shortcutChord.handleKey(event)) {
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

          case "r":
            this.shortcutChord.toggleRename(true);

            break;
          case "i":
            this.shortcutChord.toggleInfo(true);
            break;

          default:
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

            break;
        }
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
