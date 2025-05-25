import { EventBus } from "./eventBus";
const d = document;

export class KeyHandler {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus
    this.rename = d.querySelector(".rename-panel");
    this.shortcuts = {
        "n": "new-btn",
        "o": "import-graph",
        "s": "export-graph",
        "p": "export-png",
        "u": "undo-btn",
        "R": "redo-btn",
        "d": "remove-selection-btn",
        "c": "color-selection-btn",
        "e": "add-edge-btn",
        "E": "add-directed-edge-btn",
        "O": "organize-circle",
        "C": "complete-btn",
        "r": "rename-btn",
        "Enter": "rename"
      };
  }

  init() {
    d.addEventListener('keydown', (event) => {
        EventBus.emit('key:pressed', { key: event.key });

        if (this.rename.style.display === "flex") {
          if(event.key==="Enter"){
            const input = document.getElementById("rename");
            const value = input.value;
            input.value = "";
            this.rename.style.display = "none"
            d.querySelector(".modal").style.display = "none"
            if (this.shortcuts[event.key]) {
              this.app.menu.handleMenuAction(this.shortcuts[event.key], value); // Trigger the corresponding menu item
            }
          }
        } else {
          if (this.shortcuts[event.key]) {
            this.app.menu.handleMenuAction(this.shortcuts[event.key]); // Trigger the corresponding menu item
          }
        }
    });

    d.addEventListener('keyup', (event) => {
      this.eventBus.emit('key:release', { key: event.key });
    });
  }
};
