
$('#panel-btn').on('click', function () {
  let panel = $('#floating-panel');
  let check = $('#panel-btn .check');


  if (panel.is(':visible')) {
    panel.hide();
    check.hide();
  } else {
    panel.css({
      top: '20px',
      left: '',   // Clear left (browser may set this when moved)
      right: '20px' // Ensure right is reset
    });
    panel.show();
    check.show();
  }
});


$('#floating-panel .close').on('click', function () {
  $('#floating-panel').hide(); // Correctly hide the panel
  $('#panel-btn .check').hide();
});

