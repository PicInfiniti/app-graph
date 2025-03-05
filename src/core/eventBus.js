export const EventBus = {
  listeners: {},

  emit(event, detail = {}) {
    document.dispatchEvent(new CustomEvent(event, { detail }));
  },

  on(event, callback) {
    if (typeof callback !== "function") {
      console.warn(`EventBus: Tried to register a non-function listener for event: ${event}`);
      return;
    }
    document.addEventListener(event, callback);
    this.listeners[event] = this.listeners[event] || new Set();
    this.listeners[event].add(callback);
  },

  off(event, callback) {
    if (!this.listeners[event] || !this.listeners[event].has(callback)) {
      console.warn(`EventBus: Attempted to remove a non-existent listener from event: ${event}`);
      return;
    }
    document.removeEventListener(event, callback);
    this.listeners[event].delete(callback);
    if (this.listeners[event].size === 0) {
      delete this.listeners[event]; // Clean up empty event sets
    }
  },

  removeAll(event) {
    if (!this.listeners[event]) {
      console.warn(`EventBus: Attempted to remove all listeners from a non-existent event: ${event}`);
      return;
    }
    this.listeners[event].forEach((callback) => {
      document.removeEventListener(event, callback);
    });
    delete this.listeners[event];
  },
};

