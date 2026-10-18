import Pickr from "@simonwep/pickr";
import "@simonwep/pickr/dist/themes/nano.min.css";
const d = document;

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
      "face",
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
        const hexa = color.toHEXA().toString().toLowerCase();
        pickr.setColor(hexa);
        this.eventBus.emit("updateSetting", {
          key: `${key}_color`,
          value: hexa,
        });
      });
    }
  }

  setColor(key, color) {
    const pickr = this.pickrs[key];
    const hexa = this.ToHex(color);
    if (pickr && hexa) {
      pickr.setColor(hexa);
      this.eventBus.emit("updateSetting", {
        key: `${key}_color`,
        value: hexa,
      });
    }
  }

  getColor(key) {
    const pickr = this.pickrs[key];
    return pickr ? pickr.getColor().toHEXA().toString().toLowerCase() : null;
  }

  resetColors() {
    for (const key in this.pickrs)
      this.setColor(key, this.settings[`${key}_color`]);
  }

  ToHex(colorStr) {
    if (typeof colorStr !== "string") return null;

    const trimmed = colorStr.trim().toLowerCase();

    // The browser normalizes CSS colors to hex or rgba, depending on opacity.
    const ctx = d.createElement("canvas").getContext("2d");
    ctx.fillStyle = "#010203";
    ctx.fillStyle = trimmed;
    const normalized = ctx.fillStyle;

    // Invalid assignments retain the previous fillStyle. A second sentinel
    // distinguishes invalid input from the valid color #010203.
    ctx.fillStyle = "#040506";
    ctx.fillStyle = trimmed;
    if (ctx.fillStyle !== normalized) return null;

    if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(normalized)) {
      return normalized.toLowerCase();
    }

    const rgba = normalized.match(/^rgba?\(([^)]+)\)$/i);
    if (!rgba) return null;

    const [r, g, b, a = 1] = rgba[1].split(",").map(Number);
    const toHex = (v) => Math.round(v).toString(16).padStart(2, "0");
    const alpha = Math.round(a * 255)
      .toString(16)
      .padStart(2, "0");

    return "#" + toHex(r) + toHex(g) + toHex(b) + (a < 1 ? alpha : "");
  }
}
