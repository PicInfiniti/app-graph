export class EventHandlers {
  constructor(app, eventBus) {
    this.app = app;
    this.eventBus = eventBus
  }

  init() {
    // When layout changes (e.g., user selects new layout from UI)
    this.eventBus.on('keydown', (event) => {
      if (event.key === "Control") {
        this.app.ctrl = true;
      }
    })

    this.eventBus.on('keyup', (event) => {
      if (event.key === "Control") {
        this.app.ctrl = false;
      }
    })

    this.eventBus.on('layout:changed', (event) => {
      const { layoutType } = event.detail;
      this.app.graphManager.applyLayout(layoutType);
      EventBus.emit('graph:updated', { type: "layout" });
    });

    // When graph data updates, re-render visualization
    this.eventBus.on('graph:updated', (event) => {
      this.app.drawGraph();  // Visualize the graph
      const updateTypes = ["addNode", "undo", "redo", "clear", "import", "addNodeInEdge"];
      if (updateTypes.includes(event.detail.type)) {
        this.app.updateSimulation();
      }
    });

    // Toggle simulation based on UI interactions
    this.eventBus.on('simulation:toggled', (event) => {
    });

    // Example: Key event to toggle simulation
    this.eventBus.on('key:pressed', (event) => {

    });

    this.eventBus.on('settingToggled', (event) => {
      const { key, value } = event.detail
      if (key == 'forceSimulation') {
        if (value) {
          this.app.startSimulation()
        } else {
          this.app.stopSimulation()
        }
      }
    })

    this.eventBus.on("import", (event) => {
      document.getElementById("file-input").click(); // Open file dialog
    })

    this.eventBus.on("export", (event) => {
      if (event.detail.type === "json") {
        const graphJSON = this.app.graphManager.graph.export();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graphJSON, null, 2));

        const downloadAnchor = document.createElement("a");
        downloadAnchor.href = dataStr;
        downloadAnchor.download = "graph.json";

        document.body.appendChild(downloadAnchor); // Append to the document
        downloadAnchor.click(); // Trigger download
        document.body.removeChild(downloadAnchor); // Clean up
      }

      if (event.detail.type === "png") {
        this.app.canvas.toBlob(function (blob) {
          let link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "d3-canvas-export.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, "image/png");
      }
    });

    document.getElementById("file-input").addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const importedData = JSON.parse(e.target.result);
          console.log("Imported Data:", importedData); // Debugging

          const newGraph = this.app.graphManager.graph.copy();
          this.app.graphManager.push(newGraph); // Make sure `push` is defined
          newGraph.clear();
          this.app.graphManager.graph.import(importedData);

          EventBus.emit("graph:updated", { type: "import" });
        };
        reader.readAsText(file);
      }
    });

  }


}
