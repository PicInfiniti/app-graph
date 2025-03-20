const d = document;

export function applySettingsToUI(settings) {
  d.querySelector(".container").classList.toggle('grid-hidden', settings.grid <= 2);
  d.getElementById('grid-size').value = settings.node_radius;
  d.getElementById('vertex-size').value = settings.node_radius;
  d.getElementById('edge-size').value = settings.edge_size;
  d.getElementById('label-size').value = settings.label_size;
  d.querySelector('#vertex-label .check').classList.toggle("hidden", !settings.vertexLabel);
  d.getElementById('color').value = settings.color;
  d.querySelector('#drag-btn .check').classList.toggle("hidden", !settings.dragComponent);
  d.querySelector('#scale-btn .check').classList.toggle("hidden", !settings.scale);
  d.querySelector('#scale').classList.toggle("gray-background", !settings.scale);
  d.querySelector('#tree-btn .check').classList.toggle("hidden", !settings.tree);
  d.querySelector('#tree').classList.toggle("gray-background", !settings.tree);
  d.querySelector('#force-btn .check').classList.toggle("hidden", !settings.forceSimulation);
  d.querySelector('#force').classList.toggle("gray-background", !settings.forceSimulation);
  d.querySelector('#panning-btn .check').classList.toggle("hidden", !settings.panning);
  d.querySelector('#panning').classList.toggle("gray-background", !settings.panning);
  d.body.style.cursor = settings.panning ? "move" : "default";

  const root = d.documentElement;
  d.querySelector(".container").classList.toggle('grid-hidden', settings.grid <= 2);
  root.style.setProperty('--grid-size', `${settings.grid}px`);
}
