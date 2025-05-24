import { EventBus } from "./eventBus";
const d = document;
export class KeyHandler {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus
  }

  init() {
    d.addEventListener('keydown', (event) => {
      EventBus.emit('key:pressed', { key: event.key });

      const shortcuts = {
        "n": "new-btn",
        "o": "import-graph",
        "s": "export-graph",
        "p": "export-png",
        "u": "undo-btn",
        "r": "redo-btn",
        "d": "remove-selection-btn",
        "c": "color-selection-btn",
        "e": "add-edge-btn",
        "E": "add-directed-edge-btn",
        "O": "organize-circle",
        "C": "complete-btn"
      };

      if (shortcuts[event.key]) {
        this.app.menu.handleMenuAction(shortcuts[event.key]); // Trigger the corresponding menu item
      }
    });

    d.addEventListener('keyup', (event) => {
      this.eventBus.emit('key:release', { key: event.key });
    });
  }
};
