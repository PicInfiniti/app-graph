import Pickr from "@simonwep/pickr";
import "@simonwep/pickr/dist/themes/nano.min.css";

export class ColorPicker {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.settings = app.settings;

    this.pickrs = {};

    const colorFields = [
      "node",
      "stroke",
      "edge",
      "label",
      "background",
      "grid",
    ];

    colorFields.forEach((field) => {
      const elId = `#${field}-color`; // expects a div like <div id="node-color"></div>

      this.pickrs[field] = Pickr.create({
        el: elId,
        theme: "nano",
        default: this.settings[`${field}_color`],
        components: {
          preview: true,
          opacity: true,
          hue: true,
          interaction: {
            hex: true,
            rgba: true,
            input: true,
            save: true,
          },
        },
      });
    });
  }

  init() {
    for (const key in this.pickrs) {
      const pickr = this.pickrs[key];
      pickr.on("change", (color) => {
        const rgba = color.toRGBA().toString();
        pickr.setColor(rgba);
        this.eventBus.emit("updateSetting", {
          key: `${key}_color`,
          value: rgba,
        });
      });
    }
  }

  setColor(key, color) {
    const pickr = this.pickrs[key];
    if (pickr) {
      pickr.setColor(color);
      this.eventBus.emit("updateSetting", {
        key: `${key}_color`,
        value: color,
      });
    }
  }

  getColor(key) {
    const pickr = this.pickrs[key];
    return pickr ? pickr.getColor().toRGBA().toString() : null;
  }

  resetColors() {
    for (const key in this.pickrs) {
      this.setColor(key, this.settings[`${key}_color`]);
    }
  }
}
