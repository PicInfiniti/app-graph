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
    if (pickr) {
      pickr.setColor(this.ToHex(color));
      this.eventBus.emit("updateSetting", {
        key: `${key}_color`,
        value: this.ToHex(color),
      });
    }
  }

  getColor(key) {
    const pickr = this.pickrs[key];
    return pickr ? pickr.getColor().toHEXA().toString().toLowerCase() : null;
  }

  resetColors() {
    for (const key in this.pickrs) {
      this.setColor(key, this.settings[`${key}_color`]);
    }
  }

  ToHex(colorStr) {
    if (typeof colorStr !== "string") return null;

    const trimmed = colorStr.trim().toLowerCase();

    // Already a hex code (#fff, #ffffff, or #ffffffff)
    if (/^#([0-9a-f]{3,8})$/i.test(trimmed)) {
      return trimmed.length === 4 // e.g. "#f0f"
        ? "#" + [...trimmed.slice(1)].map((c) => c + c).join("") // expand to 6-digit
        : trimmed;
    }

    // Use a canvas to parse and convert to rgba
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = trimmed;

    // Now get rgba values
    const rgba = ctx.fillStyle.match(/\d+(\.\d+)?/g).map(Number); // [r, g, b, a?]

    const [r, g, b, a = 1] = rgba;
    const toHex = (v) => Math.round(v).toString(16).padStart(2, "0");
    const alpha = Math.round(a * 255)
      .toString(16)
      .padStart(2, "0");

    return "#" + toHex(r) + toHex(g) + toHex(b) + (a < 1 ? alpha : "");
  }
}
