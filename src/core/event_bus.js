export const EventBus = {
  // Emit an event with optional data
  emit(event, detail = {}) {
    document.dispatchEvent(new CustomEvent(event, { detail }));
  },

  // Listen for a specific event
  on(event, callback) {
    document.addEventListener(event, callback);
  },

  // Stop listening to a specific event
  off(event, callback) {
    document.removeEventListener(event, callback);
  },
};
