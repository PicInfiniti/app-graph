// Importing necessary libraries
import $ from "jquery";

// Importing styles
import './assets/sass/style.sass';

// Track key states
export const keyDown = [false, ''];

// Event listeners for key tracking
document.addEventListener("keydown", (event) => {
  keyDown[0] = true;
  keyDown[1] = event.key;
});

document.addEventListener("keyup", () => {
  keyDown[0] = false;
  keyDown[1] = '';
});

// Importing other JS modules
import "./assets/js/init";
import "./assets/js/context_menu";
import "./assets/js/menu_bars/file";
import "./assets/js/menu_bars/edit";
import "./assets/js/menu_bars/tools";
import "./assets/js/menu_bars/analyze";
import "./assets/js/menu_bars/help";
