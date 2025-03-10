import { EventBus } from "./eventBus";
import { handleMenuAction } from "../ui/menu";

export const KeyHandler = {
  init() {
    document.addEventListener('keydown', (event) => {
      EventBus.emit('key:pressed', { key: event.key });

      const shortcuts = {
        "n": "new-btn",
        "o": "import-graph",
        "s": "export-graph",
        "p": "export-png",
        "u": "undo-btn",
        "y": "redo-btn"
      };

      if (shortcuts[event.key]) {
        handleMenuAction(shortcuts[event.key]); // Trigger the corresponding menu item
      }
    });
  },
};
