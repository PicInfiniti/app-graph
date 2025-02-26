// src/ui/UIManager.js
export function applySettingsToUI(appSettings) {
  $(".container").toggleClass('grid-hidden', appSettings.grid <= 2);
  $root.css('--grid-size', `${appSettings.grid}px`);

  $('#vertex-size').val(appSettings.node_radius);
  $('#edge-size').val(appSettings.edge_size);
  $('#label-size').val(appSettings.label_size);
  $('#vertex-label .check').toggleClass("hidden", !appSettings.vertexLabel);

  $('#panel-btn .check').toggleClass('hidden', appSettings.info_panel);
  $('#drag-btn .check').toggleClass("hidden", !appSettings.dragComponent);
  $('#scale-btn .check').toggleClass("hidden", !appSettings.scale);
  $('#force-btn .check').toggleClass("hidden", !appSettings.forceSimulation);

  if (appSettings.info_panel) {
    $('#floating-panel').hide();
  } else {
    $('#floating-panel').show()
      .css({ transform: 'translate(0px, 0px)' })
      .attr({ 'data-x': 0, 'data-y': 0 });
  }
}
