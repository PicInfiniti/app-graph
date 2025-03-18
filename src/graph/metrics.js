import { connectedComponents, countConnectedComponents, forEachConnectedComponent } from 'graphology-components';
const d = document;

export class Metric {
  constructor(graphManager) {
    this.graphManager = graphManager

  }

  init() {

  }

  getComponents(node) {
    const graph = this.graphManager.graph
    const components = connectedComponents(graph);
    for (let component of components) {
      if (component.includes(node)) {
        return component;
      }
    }

    return null;
  }


  getElementryMetrics() {
    const graph = this.graphManager.graph
    return {
      order: graph.order,
      size: graph.size,
      type: graph.type
    }
  }

  degreeSequesnce() {
    const graph = this.graphManager.graph
    return graph.mapNodes((node, attr) => graph.degree(node));
  }
  appendToInfoPanel() {

  }

  infoPanelTemplate(header, id) {
    return `
      <div id="${id}" class="info-body">
        <h4 class="title">${header}</h4>
        <div class="body"></div> 
      </div>
    `
  }

  appendAndListNodeDegrees() {
    const graph = this.graphManager.graph
    if (!d.getElementById('degree-list')) {
      d.querySelector('#floating-panel .body-info').insertAdjacentHTML(
        'beforeend',
        this.infoPanelTemplate("Degree Sequence", "degree-list")
      );
    }

    d.querySelector('#degree-list .body').innerHTML = '';

    const degrees = this.degreeSequesnce(graph).join(',');
    d.querySelector('#degree-list .body').innerHTML = `<div>(${degrees})</div>`;
  }

  countComponents() {
    const graph = this.graphManager.graph
    if (!d.getElementById('components-list')) {
      d.querySelector('#floating-panel .body-info').insertAdjacentHTML(
        'beforeend',
        this.infoPanelTemplate("Connected Components", "components-list")
      );
    }

    const componentBody = d.querySelector('#components-list .body');
    componentBody.innerHTML = '';
    componentBody.insertAdjacentHTML('beforeend', `<div>count: ${countConnectedComponents(graph)}</div><br>`);

    forEachConnectedComponent(graph, component => {
      let div = d.createElement("div");
      let hr = d.createElement("hr")
      div.textContent = component.map(node => graph.getNodeAttribute(node, "label")).join(', ');
      componentBody.appendChild(div);
    });
  }

}


