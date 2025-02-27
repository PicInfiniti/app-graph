import { EventBus } from "./event_bus";

export const KeyHandler = {
  init() {
    document.addEventListener('keydown', (event) => {
      EventBus.emit('key:pressed', { key: event.key });
    });
  },
};
