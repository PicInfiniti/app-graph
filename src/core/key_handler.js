import { EventBus } from './EventBus.js';

export const KeyHandler = {
  init() {
    document.addEventListener('keydown', (event) => {
      EventBus.emit('key:pressed', { key: event.key });
    });
  },
};
