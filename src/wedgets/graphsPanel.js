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
    this.index = val.split("-")[1];
    this.selectLi(this.index);

    if (this.app.keyHandler.isCtrlHold())
      this.graphManager.graphIndex = this.index;
    else {
      let nodes = this.lis().map((index) =>
        this.graphManager.graphs[index].nodes(),
      );
      nodes = new Set(nodes.flat());
      this.graphManager.selectAllNode(nodes);
    }
  }

  updateGraphsPanel() {
    this.ul.innerHTML = "";
    this.graphManager.graphs.forEach((graph, index) => {
      if (graph.getAttribute("label") === "Graph") {
        graph.setAttribute("id", 0);
      } else {
        graph.setAttribute("id", index);
      }

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
      if (event.target.id == "graphs-panel") this.deselectLis();
    });
  }

  selectLi(id) {
    if (this.app.keyHandler.isCtrlHold()) this.deselectLis();
    const li = this.ul.querySelector(`#graphs-${id}`);
    if (li) {
      li.classList.toggle("select");
    }
  }

  deselectLis() {
    this.lis("node").forEach((li) => li.classList.remove("select"));
    this.graphManager.deselectAll();
  }
}
