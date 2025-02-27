export const EventBus = {
  listeners: {}, // Track active listeners

  emit(event, detail = {}) {
    document.dispatchEvent(new CustomEvent(event, { detail }));
  },

  on(event, callback) {
    document.addEventListener(event, callback);
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event].add(callback);
  },

  off(event, callback) {
    document.removeEventListener(event, callback);
    if (this.listeners[event]) {
      this.listeners[event].delete(callback);
    }
  },

  removeAll(event) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        document.removeEventListener(event, callback);
      });
      delete this.listeners[event];
    }
  },
};

