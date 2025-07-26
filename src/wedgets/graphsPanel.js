const d = document;

export class GraphsPanel {
  constructor(graphManager) {
    this.app = graphManager.app;
    this.eventBus = this.app.eventBus;
    this.graphManager = graphManager;

    this.panel = d.querySelector("widgets #graphs-panel");
    this.ul = this.panel.querySelector("ul");

    this.index = 0;
  }

  init() {
    this.listeners();
  }

  lis(type = "id") {
    const _lis = this.ul.querySelectorAll("li.select");
    if (type == "id") return [..._lis].map((item) => item.id.split("-")[1]);
    return _lis;
  }

  selectLis(val) {
    const graph = this.graphManager.graph;
    this.index = val.split("-")[1];
    const attrs = graph.getAttributes();
    this.selectLi(this.index);
    this.graphManager.metric.addNEFGInfo(attrs);
    this.graphManager.facePanel.updateFacePanel();
    if (this.app.keyHandler.isCtrlHold()) {
      let nodes = this.lis().map((index) =>
        this.graphManager.graphs.all[index].nodes(),
      );
      nodes = new Set(nodes.flat());
      this.graphManager.selectAllNode(nodes);
      this.graphManager.redraw({ node: true });
    }
  }

  selectLi(id) {
    if (!this.app.keyHandler.isCtrlHold()) {
      this.graphManager.graphs.index = this.index;
      this.deselectLis();
    }
    this.graphManager.graph.updateAttribute("selected", (x) => true);

    const li = this.ul.querySelector(`#graphs-${id}`);
    if (li) {
      li.classList.toggle("select");
    }
  }

  updateGraphsPanel() {
    this.ul.innerHTML = "";
    this.graphManager.graphs.all.forEach((graph, index) => {
      if (graph.getAttribute("id") === undefined)
        graph.setAttribute("id", index);

      if (!graph.getAttribute("selected"))
        graph.setAttribute("selected", false);

      if (!graph.getAttribute("label"))
        graph.setAttribute("label", `graph ${index}`);

      const li = d.createElement("li");
      li.id = `graphs-${graph.getAttribute("id")}`; // set the ID
      li.setAttribute("name", "graphs");
      li.textContent = graph.getAttribute("label"); // set the display name
      this.ul.appendChild(li);
    });
  }

  listeners() {
    this.panel.addEventListener("click", (event) => {
      this.deselectLis(event.target.id);
    });
  }

  deselectLis(id) {
    if (id !== "graphs-panel") return;
    this.lis("node").forEach((li) => li.classList.remove("select"));
    for (const graph of this.graphManager.graphs.all)
      graph.updateAttribute("selected", (x) => false);
  }
}
