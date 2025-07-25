const d = document;

export function applySettingsToUI(settings, canvas) {
  d.querySelector(".container").classList.toggle(
    "grid-hidden",
    settings.grid <= 2,
  );
  d.getElementById("grid-size-1").value = settings.grid;
  d.getElementById("vertex-size-1").value = settings.node_radius;
  d.getElementById("edge-size-1").value = settings.edge_size;
  d.getElementById("label-size-1").value = settings.label_size;
  d.getElementById("history-limit-1").value = settings.historyLimit;
  d.querySelector("#vertex-label .check").classList.toggle(
    "hidden",
    !settings.vertexLabel,
  );
  d.querySelector("#edge-label .check").classList.toggle(
    "hidden",
    !settings.edgeLabel,
  );
  d.querySelector("#face-label .check").classList.toggle(
    "hidden",
    !settings.faceLabel,
  );
  d.querySelector("#weight-label .check").classList.toggle(
    "hidden",
    !settings.weightLabel,
  );

  d.querySelector("#performance .check").classList.toggle(
    "hidden",
    !settings.performance,
  );

  d.querySelector("#save-history .check").classList.toggle(
    "hidden",
    !settings.saveHistory,
  );

  d.querySelector("#component").classList.toggle(
    "gray-background",
    !settings.component,
  );
  d.querySelector("#scale").classList.toggle(
    "gray-background",
    !settings.scale,
  );
  d.querySelector("#force-edge-btn .check").classList.toggle(
    "hidden",
    !settings.force_edge,
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
