import $ from "jquery"

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

