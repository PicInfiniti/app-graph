import $ from 'jquery'
import { Application, Graphics, Container } from 'pixi.js';
import Graph from 'graphology'; // Import Graphology
import { LimitedArray } from './utils';
import { appSettings } from './menu_bars/settings';
import { updateGraph, updateHistory } from './init';
import { common } from './init';
import { getMinAvailableNumber, getAvailableLabel } from './utils';

export const History = new LimitedArray(50);
History.push(new Graph());

(async () => {

  const app = new Application();

  // Initialize the application
  await app.init({
    backgroundAlpha: 0,
    resizeTo: window,
    antialias: true
  });

  // Append the application canvas to the document body
  document.getElementById("webgl-container").appendChild(app.canvas);
  // Create a container to pan
  const nodeGroup = new Container();
  const edgeGroup = new Container();

  app.stage.addChild(nodeGroup);
  app.stage.addChild(edgeGroup)
  // Create a Graphics object and draw a circle


  // edgeGroup.moveTo(0, 0);
  // edgeGroup.lineTo(window.innerWidth, window.innerHeight);
  // edgeGroup.stroke({ width: 2, color: 0x00FF00 });

  // Add a double-click listener to the canvas
  app.canvas.addEventListener('dblclick', function (event) {
    addNodeAtEvent(event, app)
  });


  // app.canvas.addEventListener('mousedown', (event) => {
  //   // ✅ Start dragging only if Ctrl is held
  //   if (event.ctrlKey) {
  //     dragging = true;
  //     previousPosition = { x: event.clientX, y: event.clientY };
  //   }
  // });
  //
  // app.canvas.addEventListener('mousemove', (event) => {
  //   if (dragging) {
  //     const deltaX = event.clientX - previousPosition.x;
  //     const deltaY = event.clientY - previousPosition.y;
  //     container.x += deltaX;
  //     container.y += deltaY;
  //     previousPosition = { x: event.clientX, y: event.clientY };
  //   }
  // });
  //
  // app.canvas.addEventListener('mouseup', () => dragging = false);
  // app.canvas.addEventListener('mouseleave', () => dragging = false);
  //
  // // 🎯 Optional: Add cursor feedback when Ctrl is held
  // window.addEventListener('keydown', (event) => {
  //   if (event.key === 'Control') {
  //     app.canvas.style.cursor = 'grab';
  //   }
  // });
  // window.addEventListener('keyup', (event) => {
  //   if (event.key === 'Control') {
  //     app.canvas.style.cursor = 'default';
  //   }
  // });
  //
  //
  // Function to add a new node at event position
  function addNodeAtEvent(event, app) {
    console.log(56)
    event.preventDefault();
    const color = $("#color").val();

    const rect = app.canvas.getBoundingClientRect();
    const [x, y] = [event.clientX - rect.left, event.clientX - rect.top]
    const newID = getMinAvailableNumber(History.graph.nodes());
    const newLabel = getAvailableLabel(newID);

    updateHistory(History, "add");
    History.graph.addNode(newID, { x, y, color, label: newLabel });
    updateGraph_W(History.graph, common, app);
  }


  function updateGraph_W(graph, settings) {
    const color = $("#color").val();
    const nodes = graph.nodes().map(id => ({ id, ...graph.getNodeAttributes(id) }));
    const edges = graph.edges();

    nodeGroup.circle(mouse.x, mouse.y, appSettings.node_radius);
    nodeGroup.fill(0xc34288, 1);
    nodeGroup.stroke({ width: 3, color: 0xffbd01 });

    History.push(new Graph())
  }
})();





