import { connectedComponents, countConnectedComponents, forEachConnectedComponent } from 'graphology-components';
import { bidirectional } from 'graphology-shortest-path';
const d = document;

export class Metric {
  constructor(graphManager) {
    this.graphManager = graphManager
    this.pannel = d.querySelector('#floating-panel .body-info')
  }

  addHeader(h) {
    const header = d.createElement("h4");
    header.textContent = h;
    this.pannel.appendChild(header);
    console.log(h)
  }

  addInfo(info) {
    const div = d.createElement("div");
    div.insertAdjacentHTML("beforeend", info);
    this.pannel.appendChild(div);
    console.log(info)
  }

  addLine() {
    const line = d.createElement("hr");
    this.pannel.appendChild(line);
  }


  getComponent(node) {
    const graph = this.graphManager.graph
    const components = connectedComponents(graph);
    for (let component of components) {
      if (component.includes(String(node))) {
        return component;
      }
    }
    return null;
  }


  basicInfo() {
    const graph = this.graphManager.graph
    this.addHeader("Basic Informattion")
    this.addInfo(`|V|: ${graph.order}`)
    this.addInfo(`|E|: ${graph.size}`)
    this.addInfo(`Type: ${graph.type}`)
    this.addLine();
  }

  degreeSequesnce() {
    this.addHeader("Degree Sequence")

    const graph = this.graphManager.graph
    const ds = graph.mapNodes((node, attr) => graph.degree(node))
    const degrees = `(${ds.join(', ')})`;

    this.addInfo(degrees)
    this.addLine();
  }


  countComponents() {
    const graph = this.graphManager.graph
    this.addHeader("Connected Components")

    forEachConnectedComponent(graph, component => {
      this.addInfo(component.map(node => graph.getNodeAttribute(node, "label")).join(', '))
    });

    this.addLine();
  }

  shortestPath() {
    this.addHeader("Shortest Path")

    const graph = this.graphManager.graph
    const selectedNodes = this.graphManager.graph.getSelectedNodes()
    if (selectedNodes.length !== 2) {
      this.addInfo("Select two nodes")
      this.addLine()
      return
    }
    const [source, target] = selectedNodes
    const path = bidirectional(graph, source, target);
    if (path) {
      this.addInfo(path.map(node => graph.getNodeAttribute(node, "label")).join(' -> '))
      this.addLine()
      graph.selectPath(path)
    } else {
      this.addInfo("They are not connected")
      this.addLine()
    }
  }
}


