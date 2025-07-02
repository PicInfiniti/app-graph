const d = document;

export class FacePanel {
  constructor(graphManager) {
    this.app = graphManager.app;
    this.eventBus = this.app.eventBus;
    this.graphManager = graphManager;
    this.settings = graphManager.settings;

    this.panel = d.querySelector("widgets #face-panel");
    this.ul = this.panel.querySelector("ul");

    this.index = 0;
  }

  init() {
    this.listeners();
    this.events();
  }

  lis(type = "id") {
    const _lis = this.ul.querySelectorAll("li.select");
    if (type == "id") return [..._lis].map((item) => item.id.split("-")[1]);
    return _lis;
  }

  selectLis(val) {
    const graph = this.graphManager.graph;
    const face = val.split("-")[1];
    const attrs = graph.getFaceAttributes(face);
    this.selectLi(face);
    this.graphManager.selectAllFace(this.lis());
    let nodes = this.lis().map((face) => graph.getFaceAttribute(face, "nodes"));
    nodes = new Set(nodes.flat());
    this.graphManager.selectAllNode(nodes);
  }

  updateFacePanel() {
    this.ul.innerHTML = "";
    const graph = this.graphManager.graph;
    let i = 0;
    graph.forEachFace((face, attr) => {
      i++;
      if (graph.getFaceAttribute(face, "id") === undefined)
        graph.setFaceAttribute(face, "id", index);

      if (!graph.getFaceAttribute(face, "label"))
        graph.setFaceAttribute(face, "label", `face ${i}`);

      const li = d.createElement("li");
      li.id = `face-${face}`; // set the ID
      li.setAttribute("name", "faces");
      li.setAttribute("key", face);
      li.textContent = graph.getFaceAttribute(face, "label"); // set the display name
      this.ul.appendChild(li);
    });
  }

  listeners() {
    this.panel.addEventListener("click", (event) => {
      if (event.target.id == "face-panel") this.deselectLis();
    });
  }

  events() {
    this.eventBus.on("key:down", (event) => {
      const key = [...event.detail.key].join("");
      switch (key) {
        case "d":
          break;

        default:
          break;
      }
    });
  }

  selectLi(face) {
    const li = this.ul.querySelector(`#face-${face}`);
    if (li) {
      li.classList.toggle("select");
    }
    if (this.settings.colorPicker) {
      const faceColor = this.graphManager.graph.getFaceAttribute(face, "color");
      const labelColor = this.graphManager.graph.getFaceAttribute(
        face,
        "labelColor",
      );
      this.app.colorPicker.setColor("face", faceColor);
      this.app.colorPicker.setColor("label", labelColor);
    }
  }

  deselectLis() {
    this.lis("node").forEach((li) => li.classList.remove("select"));
    this.graphManager.deselectAll();
  }
}
