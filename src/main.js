// Import global styles
import './assets/sass/style.sass';

// Import and initialize the main App controller
import { App } from './core/App.js';

// Bootstrap the application
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();  // Create the app instance
  app.init();             // Initialize the app
  // Redraw on window resize
  window.addEventListener("resize", () => {
    app.canvas.width = window.innerWidth;
    app.canvas.height = window.innerHeight;
  });
});


