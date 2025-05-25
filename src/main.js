// Import global styles
import './assets/sass/main.sass';

// Import and initialize the main App controller
import { App } from './core/App.js';

// Bootstrap the application
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();  // Create the app instance
  window.addEventListener("resize", () => {
    app.canvas.width = window.innerWidth;
    app.canvas.height = window.innerHeight;
    app.drawGraph();
  });

  document.querySelectorAll('img').forEach(img => {
    img.setAttribute('draggable', 'false');
  });
});


