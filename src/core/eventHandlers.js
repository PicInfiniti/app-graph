const d = document;

export class EventHandlers {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
  }

  init() {
    this.app.eventBus.on("settingToggled", (event) => {
      const { key, value } = event.detail;
      if (key == "forceSimulation") {
        if (value) {
          this.app.startSimulation();
        } else {
          this.app.stopSimulation();
        }
      }
    });

    this.app.eventBus.on("import", (event) => {
      d.getElementById("file-input").click(); // Open file dialog
    });

    this.app.eventBus.on("export", (event) => {
      if (event.detail.type === "json") {
        const graphJSON = this.app.graphManager.history;
        const dataStr =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(graphJSON, null, 2));

        const downloadAnchor = d.createElement("a");
        downloadAnchor.href = dataStr;
        downloadAnchor.download = "graph.json";

        d.body.appendChild(downloadAnchor); // Append to the document
        downloadAnchor.click(); // Trigger download
        d.body.removeChild(downloadAnchor); // Clean up
      }

      if (event.detail.type === "png") {
        this.app.canvas.toBlob(function (blob) {
          let link = d.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "d3-canvas-export.png";
          d.body.appendChild(link);
          link.click();
          d.body.removeChild(link);
        }, "image/png");
      }
    });

    d.getElementById("file-input").addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const importedData = JSON.parse(e.target.result);
          console.log("Imported Data:", importedData); // Debugging
          this.app.graphManager.history.push(...importedData);
          this.app.graphManager.updateIndex(
            this.app.graphManager.history.length - 1,
          );
        };
        reader.readAsText(file);
      }
      event.target.value = "";
    });
    // Reset the input value to allow re-selecting the same file
  }
}
