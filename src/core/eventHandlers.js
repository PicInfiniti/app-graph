import { db } from "./db";
const d = document;

export class EventHandlers {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
  }

  init() {
    this.eventBus.on("import", (event) => {
      d.getElementById("file-input").click(); // Open file dialog
    });

    this.eventBus.on("export", async (event) => {
      const d = document;

      if (event.detail.type === "json") {
        try {
          const chunks = [];
          chunks.push("["); // Start of JSON array

          let isFirst = true;
          await db.history.orderBy("id").each((item) => {
            if (!isFirst) chunks.push(",\n");
            chunks.push(JSON.stringify(item, null, 2));
            isFirst = false;
          });

          chunks.push("]"); // End of JSON array

          const blob = new Blob(chunks, { type: "application/json" });
          const url = URL.createObjectURL(blob);

          const link = d.createElement("a");
          link.href = url;
          link.download = "graph-history.json";
          d.body.appendChild(link);
          link.click();
          d.body.removeChild(link);

          URL.revokeObjectURL(url);
          console.log("Efficient history export completed.");
        } catch (err) {
          console.error("Failed to stream-export history:", err);
        }
      }

      if (event.detail.type === "png") {
        this.exportGraphAsImage();
      }
    });

    d.getElementById("file-input").addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            const importedData = JSON.parse(e.target.result);

            if (!Array.isArray(importedData)) {
              alert("Invalid file format. Expected an array of snapshots.");
              return;
            }

            if (importedData.length === 0) {
              alert("The file contains no history snapshots.");
              return;
            }

            const confirmClear = confirm(
              "Importing will erase your current history. Continue?",
            );
            if (!confirmClear) return;

            // Optional: sort snapshots by ID if not guaranteed
            importedData.sort((a, b) => a.id - b.id);

            // Clear and import
            await db.history.clear();
            await db.history.bulkAdd(importedData);

            const lastSnapshot = await this.app.graphManager.getLastSnapshot();
            if (lastSnapshot) {
              this.app.graphManager.loadSnapshot(lastSnapshot);
              this.app.graphManager.refresh();
              console.log(
                `Imported ${importedData.length} snapshots into history.`,
              );
            } else {
              alert("Import succeeded, but no usable snapshot was found.");
            }
          } catch (parseErr) {
            console.error("Failed to import history:", parseErr);
            alert(
              "Import failed. The file may be corrupted or not valid JSON.",
            );
          }
        };

        reader.readAsText(file);
      } catch (err) {
        console.error("File reading error:", err);
        alert("Failed to read the selected file.");
      }

      // Allow re-uploading the same file later
      event.target.value = "";
    });
  }

  exportGraphAsImage() {
    // Create a temporary canvas with full size
    const width = this.app.canvas.width;
    const height = this.app.canvas.height;
    const exportCanvas = d.createElement("canvas");
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext("2d");

    // Draw each layer in order: edges → faces → nodes (or your actual order)
    ctx.drawImage(this.app._canvas._canvas.face.canvas, 0, 0);
    ctx.drawImage(this.app._canvas._canvas.edge.canvas, 0, 0);
    ctx.drawImage(this.app._canvas._canvas.node.canvas, 0, 0);

    // Optionally add interaction or label layer if you want to export UI overlays
    // ctx.drawImage(this.app.interactionCanvas, 0, 0);

    // Export as PNG
    exportCanvas.toBlob((blob) => {
      if (!blob) {
        console.error("Export failed: canvas may be empty or tainted.");
        return;
      }
      const link = d.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "graph-studio-export.png";
      d.body.appendChild(link);
      link.click();
      d.body.removeChild(link);
    }, "image/png");
  }
}
