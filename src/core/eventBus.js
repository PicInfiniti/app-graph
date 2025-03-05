export const EventBus = {
  listeners: new Map(), // Using Map for better management

  emit(event, detail = {}) {
    document.dispatchEvent(new CustomEvent(event, { detail }));
  },

  on(event, callback) {
    if (typeof callback !== "function") {
      console.warn(`EventBus: Tried to register a non-function listener for event: ${event}`);
      return;
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const callbacks = this.listeners.get(event);
    if (callbacks.has(callback)) {
      console.warn(`EventBus: Listener for event "${event}" is already registered.`);
      return;
    }

    document.addEventListener(event, callback);
    callbacks.add(callback);
  },

  off(event, callback) {
    if (!this.listeners.has(event)) {
      console.warn(`EventBus: Attempted to remove a listener from a non-existent event: ${event}`);
      return;
    }

    const callbacks = this.listeners.get(event);
    if (!callbacks.has(callback)) {
      console.warn(`EventBus: Attempted to remove a non-existent listener from event: ${event}`);
      return;
    }

    document.removeEventListener(event, callback);
    callbacks.delete(callback);

    if (callbacks.size === 0) {
      this.listeners.delete(event); // Clean up empty event sets
    }
  },

  removeAll(event) {
    if (!this.listeners.has(event)) {
      console.warn(`EventBus: Attempted to remove all listeners from a non-existent event: ${event}`);
      return;
    }

    this.listeners.get(event).forEach((callback) => {
      document.removeEventListener(event, callback);
    });

    this.listeners.delete(event);
  },
};
