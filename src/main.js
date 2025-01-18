// libraries +++++++++++++++++++++++++++++++++++++
import $ from "jquery";
// libraries -------------------------------------

// sass ++++++++++++++++++++++++++++++++++++++++++
import './assets/sass/style.sass';
// sass ------------------------------------------


const $gridSizeInput = $('#grid-size'); // Select the input element
const $root = $(':root'); // Select the root element

$gridSizeInput.on('input', function () {
  const gridSize = $(this).val(); // Get the current value of the input
  $root.css('--grid-size', `${gridSize}px`); // Set the CSS variable
});

export const keyDown = [false, '']

// Track "Ctrl" key state
document.addEventListener("keydown", (event) => {
  keyDown[0] = true
  keyDown[1] = event.key
});

document.addEventListener("keyup", (event) => {
  keyDown[0] = false
  keyDown[1] = ''
});


import "./assets/js/init"
import "./assets/js/menu_bars/file"
import "./assets/js/menu_bars/edit"
import "./assets/js/menu_bars/view"
import "./assets/js/menu_bars/manipulate"
import "./assets/js/menu_bars/analyze"
import "./assets/js/menu_bars/help"

