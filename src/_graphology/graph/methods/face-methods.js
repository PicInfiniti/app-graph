// 📁 face-methods.js
export function attachFaceMethods(Mixed) {
  Mixed.prototype.addFace = function (nodes, attributes) {
    const face = nodes.join("_");
    attributes = {
      ...attributes,
      key: face,
      id: this._faces.size,
      nodes: nodes,
      color: this.colors.face_color,
    };

    var faceData = new FaceData(face, nodes, attributes);
    this._faces.set(face, faceData);
  };

  Mixed.prototype.faces = function () {
    return Array.from(this._faces.keys());
  };

  Mixed.prototype.findFace = function (nodes) {
    nodes.sort();
    return nodes.join("_");
  };

  Mixed.prototype.dropFace = function (face) {
    if (this._faces.has(face)) this._faces.delete(face);
  };

  Mixed.prototype.hasFace = function (face) {
    return this._faces.has(face);
  };

  Mixed.prototype.faceNodeNeighbors = function (node) {
    const faces = [];
    this.forEachFace((face, attrs) => {
      if (attrs.nodes.includes(node)) faces.push(face);
    });
    return faces;
  };

  Mixed.prototype.faceEdgeNeighbors = function (edge) {
    const { source, target } = this.getEdgeAttributes(edge);
    const faces = [];
    this.forEachFace((face, attrs) => {
      if (
        attrs.nodes.includes("" + source) &&
        attrs.nodes.includes("" + target)
      )
        faces.push(face);
    });
    return faces;
  };

  Mixed.prototype.forEachFace = function (callback) {
    for (const faceData of this._faces.values()) {
      callback(faceData.key, faceData.attributes);
    }
  };

  Mixed.prototype.setFaceAttribute = function (face, key, attr) {
    this._faces.get(face).attributes[key] = attr;
  };

  Mixed.prototype.getFaceAttribute = function (face, key) {
    return this._faces.get(face).attributes[key];
  };

  Mixed.prototype.getFaceAttributes = function (face) {
    return this._faces.get(face).attributes;
  };

  //----------
  Mixed.prototype.selectFace = function (face) {
    this.setFaceAttribute(face, "selected", true);
  };

  Mixed.prototype.deselectFace = function (face) {
    this.setFaceAttribute(face, "selected", false);
  };

  Mixed.prototype.toggleFaceSelection = function (face) {
    const current = this.getFaceAttribute(face, "selected") || 0;
    if (current > 0) {
      this.setFaceAttribute(face, "selected", 0);
    } else {
      let max = 0;
      this.forEachFace((_, attrs) => {
        if (attrs.selected > max) max = attrs.selected;
      });
      this.setFaceAttribute(face, "selected", max + 1);
    }
  };

  Mixed.prototype.getSelectedFaces = function () {
    return this.faces()
      .filter((face) => {
        const attrs = this.getFaceAttributes(face);
        return attrs.selected > 0;
      })
      .sort(
        (a, b) =>
          this.getFaceAttribute(a, "selected") -
          this.getFaceAttribute(b, "selected"),
      );
  };

  Mixed.prototype.updateSelectedFacesAttributes = function (updates) {
    this.getSelectedFaces().forEach((face) => {
      const attrs = this.getFaceAttributes(face);
      this._faces.get(face).attributes = {
        ...attrs,
        ...updates,
      };
    });
  };

  Mixed.prototype.updateSelectedFacesColor = function (color, labelColor) {
    const updates = {
      ...(color && { color }),
      ...(labelColor && { labelColor }),
    };
    this.updateSelectedFacesAttributes(updates);
  };

  Mixed.prototype.updateSelectedFacesName = function (label) {
    this.updateSelectedFacesAttributes({ label });
  };

  Mixed.prototype.updateSelectedFacesInfo = function (desc) {
    this.updateSelectedFacesAttributes({ desc });
  };

  Mixed.prototype.updateSelectedFacesWeight = function (weight) {
    this.updateSelectedFacesAttributes({ weight });
  };

  Mixed.prototype.deleteSelectedFaces = function () {
    this.getSelectedFaces().forEach((face) => this.dropFace(face));
  };

  //-----
}

//Helpers
class FaceData {
  constructor(key, nodes, attributes) {
    this.key = key;
    this.attributes = attributes;
    this.nodes = nodes;
  }
}
