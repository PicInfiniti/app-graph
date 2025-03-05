export function applySettingsToUI(appSettings) {
  document.querySelector(".container").classList.toggle('grid-hidden', appSettings.grid <= 2);

  document.getElementById('vertex-size').value = appSettings.node_radius;
  document.getElementById('edge-size').value = appSettings.edge_size;
  document.getElementById('label-size').value = appSettings.label_size;
  document.querySelector('#vertex-label .check').classList.toggle("hidden", !appSettings.vertexLabel);
  document.getElementById('color').value = appSettings.color;
  document.querySelector('#panel-btn .check').classList.toggle('hidden', appSettings.info_panel);
  document.querySelector('#drag-btn .check').classList.toggle("hidden", !appSettings.dragComponent);
  document.querySelector('#scale-btn .check').classList.toggle("hidden", !appSettings.scale);
  document.querySelector('#force-btn .check').classList.toggle("hidden", !appSettings.forceSimulation);

  const floatingPanel = document.getElementById('floating-panel');
  if (appSettings.info_panel) {
    floatingPanel.style.display = 'flex';
    document.querySelector('#panel-btn .check').classList.toggle("hidden", !appSettings.info_panel);
  } else {
    document.querySelector('#panel-btn .check').classList.toggle("hidden", !appSettings.info_panel);
    floatingPanel.style.display = 'none';
    floatingPanel.style.transform = 'translate(0px, 0px)';
    floatingPanel.setAttribute('data-x', 0);
    floatingPanel.setAttribute('data-y', 0);
  }
}
