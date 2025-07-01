// Import global styles
import "./assets/sass/main.sass";

// Import and initialize the main App controller
import { App } from "./core/App.js";

// Bootstrap the application
document.addEventListener("DOMContentLoaded", () => {
  const app = new App(); // Create the app instance
  window.graphStudio = app;
  window.addEventListener("resize", () => {
    app._canvas.updateCanvasSize(window.innerWidth, window.innerHeight);
  });

  document.querySelectorAll("img").forEach((img) => {
    img.setAttribute("draggable", "false");
  });
});
