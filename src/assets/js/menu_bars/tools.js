import $ from "jquery"
import interact from 'interactjs';
import { appSettings } from "./settings";
import { History } from "../init";
import { updateForce, updateSimulation } from "../dependency/mutation";
import { simulation, nodes, links } from "../force_simulation";
$('#drag-btn').on('click', function () {
  appSettings.dragComponent = !appSettings.dragComponent
  $('#drag-btn .check').toggleClass("hidden", appSettings)
});

$('#scale-btn').on('click', function () {
  console.log(appSettings.scale)
  appSettings.scale = !appSettings.scale
  $('#scale-btn .check').toggleClass("hidden", !appSettings.scale)
});

$('#force-btn').on('click', function () {
  appSettings.forceSimulation = !appSettings.forceSimulation
  if (appSettings.forceSimulation) {
    updateForce(History.graph, nodes, links)
    updateSimulation(simulation, nodes, links)
  } else {
    simulation.stop();
  }

  $('#force-btn .check').toggleClass("hidden", !appSettings.forceSimulation)
});


$('#panel-btn').on('click', function () {
  let panel = $('#floating-panel');

  appSettings.info_panel = !appSettings.info_panel
  $('#panel-btn .check').toggleClass('hidden', appSettings.info_panel)

  if (appSettings.info_panel) {
    panel.hide();
  } else {
    panel.show()
      .css({ transform: 'translate(0px, 0px)' }) // Reset position
      .attr({ 'data-x': 0, 'data-y': 0 });
  }
});

$('#floating-panel .close').on('click', function () {
  appSettings.info_panel = false
  $('#floating-panel').hide();
  $('#panel-btn .check').addClass("hidden");
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
