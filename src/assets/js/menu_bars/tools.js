import $ from "jquery"
import interact from 'interactjs';
import { common } from "../init";

$('#panel-btn').on('click', function () {
  let panel = $('#floating-panel');
  let check = $('#panel-btn .check');

  if (panel.is(':visible')) {
    panel.hide();
    check.hide();
  } else {
    // Reset Interact.js position
    panel.css({
      transform: 'translate(0px, 0px)' // Reset position
    });
    panel.attr('data-x', 0);
    panel.attr('data-y', 0);

    panel.show();
    check.show();
  }
});

$('#floating-panel .close').on('click', function () {
  $('#floating-panel').hide(); // Correctly hide the panel
  $('#panel-btn .check').hide();
});

// Make floating panel draggable
interact('#floating-panel')
  .draggable({
    allowFrom: "#info",
    listeners: {
      move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      }
    }
  });


$('#drag-btn').on('click', function () {
  let check = $('#drag-btn .check');
  if (check.is(':visible')) {
    check.hide();
    common.dragComponent = false
  } else {
    common.dragComponent = true
    check.show();
  }
});
