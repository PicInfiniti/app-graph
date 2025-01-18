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



import "./assets/js/init"
import "./assets/js/menu_bars/file"
import "./assets/js/menu_bars/edit"
import "./assets/js/menu_bars/view"
import "./assets/js/menu_bars/manipulate"
import "./assets/js/menu_bars/analyze"
import "./assets/js/menu_bars/help"

