export function applySettingsToUI(appSettings) {
  const d = document;
  d.querySelector(".container").classList.toggle('grid-hidden', appSettings.grid <= 2);

  d.getElementById('vertex-size').value = appSettings.node_radius;
  d.getElementById('edge-size').value = appSettings.edge_size;
  d.getElementById('label-size').value = appSettings.label_size;
  d.querySelector('#vertex-label .check').classList.toggle("hidden", !appSettings.vertexLabel);
  d.getElementById('color').value = appSettings.color;
  d.querySelector('#panel-btn .check').classList.toggle('hidden', appSettings.info_panel);
  d.querySelector('#drag-btn .check').classList.toggle("hidden", !appSettings.dragComponent);
  d.querySelector('#scale-btn .check').classList.toggle("hidden", !appSettings.scale);
  d.querySelector('#tree-btn .check').classList.toggle("hidden", !appSettings.tree);
  d.querySelector('#force-btn .check').classList.toggle("hidden", !appSettings.forceSimulation);

  const floatingPanel = d.getElementById('floating-panel');
  if (appSettings.info_panel) {
    floatingPanel.style.display = 'flex';
    d.querySelector('#panel-btn .check').classList.toggle("hidden", !appSettings.info_panel);
  } else {
    d.querySelector('#panel-btn .check').classList.toggle("hidden", !appSettings.info_panel);
    floatingPanel.style.display = 'none';
    floatingPanel.style.transform = 'translate(0px, 0px)';
    floatingPanel.setAttribute('data-x', 0);
    floatingPanel.setAttribute('data-y', 0);
  }
}
