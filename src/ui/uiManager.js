const d = document;

export function applySettingsToUI(settings, canvas) {
  d.querySelector(".container").classList.toggle(
    "grid-hidden",
    settings.grid <= 2,
  );
  d.getElementById("grid-size-1").value = settings.node_radius;
  d.getElementById("vertex-size-1").value = settings.node_radius;
  d.getElementById("edge-size-1").value = settings.edge_size;
  d.getElementById("label-size-1").value = settings.label_size;
  d.querySelector("#vertex-label .check").classList.toggle(
    "hidden",
    !settings.vertexLabel,
  );
  d.querySelector("#edge-label .check").classList.toggle(
    "hidden",
    !settings.edgeLabel,
  );
  d.getElementById("node-color").value = settings.node_color;
  d.getElementById("edge-color").value = settings.edge_color;
  d.getElementById("label-color").value = settings.label_color;
  d.getElementById("grid-color").value = settings.grid_color;
  d.getElementById("background-color").value = settings.background_color;
  d.getElementById("stroke-color").value = settings.stroke_color;

  d.querySelector("#component").classList.toggle(
    "gray-background",
    !settings.component,
  );
  d.querySelector("#scale").classList.toggle(
    "gray-background",
    !settings.scale,
  );
  d.querySelector("#tree").classList.toggle("gray-background", !settings.tree);
  d.querySelector("#force").classList.toggle(
    "gray-background",
    !settings.forceSimulation,
  );
  d.querySelector("#colorPicker").classList.toggle(
    "gray-background",
    !settings.colorPicker,
  );
  d.querySelector("#panning").classList.toggle(
    "gray-background",
    !settings.panning,
  );
  d.querySelector("#select").classList.toggle(
    "gray-background",
    !settings.select,
  );

  canvas.style.cursor = settings.panning ? "move" : "default";

  const root = d.documentElement;
  d.querySelector(".container").classList.toggle(
    "grid-hidden",
    settings.grid <= 2,
  );
  root.style.setProperty("--grid-size", `${settings.grid}px`);
  root.style.setProperty("--grid-color", settings.grid_color);
  d.querySelector(".container").style.backgroundColor =
    settings.background_color;
}
