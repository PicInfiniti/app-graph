import { EventBus } from "./eventBus";

export class KeyHandler {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus
  }

  init() {
    document.addEventListener('keydown', (event) => {
      EventBus.emit('key:pressed', { key: event.key });

      const shortcuts = {
        "n": "new-btn",
        "o": "import-graph",
        "s": "export-graph",
        "p": "export-png",
        "u": "undo-btn",
        "r": "redo-btn"
      };

      if (shortcuts[event.key]) {
        this.app.menu.handleMenuAction(shortcuts[event.key]); // Trigger the corresponding menu item
      }
    });

    document.addEventListener('keyup', (event) => {
      this.eventBus.emit('key:release', { key: event.key });
    });
  }
};
