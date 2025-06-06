import { EventBus } from "./eventBus";
import shortcuts from "./shortcuts.json";

const d = document;

export class ShortcutChord {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;

    this.modalChord = d.querySelector(".modal-chord");
    this.infoChord = d.querySelector(".modal-chord .desc-chord");
    this.renameChord = d.querySelector(".modal-chord .rename-chord");
    this.shortcutChord = d.querySelector(".modal-chord #shortcut-chord");
    this.header = d.querySelector(".modal-chord .shortcut-chord .header");
    this.fakeHeader = d.querySelector(
      ".modal-chord  .shortcut-chord-fake .header",
    );
    this.chord = d.querySelector(".shortcut-chord");
    this.fakeChord = d.querySelector(".shortcut-chord-fake");

    this.Space = true;
    this.C = false;
    this.Rename = false;
    this.Info = false;

    this.CKeys = {
      c: "color-picker-btn",
      n: "update-node-color",
      s: "update-stroke-color",
      e: "update-edge-color",
      l: "update-label-color",
    };

    this.SpaceKeys = {
      k: "select-all-node",
      j: "deselect-all-node",
      l: "select-next-node",
      h: "select-pervious-node",
      y: "copy-subgraph",
      x: "cut-subgraph",
      p: "paste-subgraph",
      r: "rename",
      i: "edit-info",
    };
  }

  init() {
    this.Chord("space");
  }

  Chord(chord) {
    const ul = d.createElement("ul");

    shortcuts[chord].data.forEach(({ title, desc }) => {
      const li = d.createElement("li");
      li.innerHTML = `
      <span class="title">${title}</span>
      <span class="arrow">→</span>
      <span class="desc">${desc}</span>
    `;
      ul.appendChild(li);
    });

    this.chord.appendChild(ul);
    this.fakeChord.appendChild(ul.cloneNode(true));
  }

  toggleChord(val = undefined) {
    if (val === undefined) {
      this.Space = !this.Space;
    } else {
      this.Space = val;
    }
    this.modalChord.style.display = this.Space ? "flex" : "none";

    this.shortcutChord.style.display = "block";
    this.renameChord.style.display = "none";
    this.infoChord.style.display = "none";

    this.Rename = false;
    this.Info = false;
  }

  toggleRename(val = undefined) {
    if (val === undefined) {
      this.Rename = !this.Rename;
    } else {
      this.Rename = val;
    }
    this.Space = true;
    if (this.Rename) {
      this.modalChord.style.display = "flex";
      this.shortcutChord.style.display = "none";
      this.renameChord.style.display = "block";
      this.infoChord.style.display = "none";

      this.renameChord.querySelector("input").focus();

      this.Info = false;
    }
  }

  toggleInfo(val = undefined) {
    if (val === undefined) {
      this.Info = !this.Info;
    } else {
      this.Info = val;
    }

    this.Space = true;
    if (this.Info) {
      this.modalChord.style.display = "flex";
      this.shortcutChord.style.display = "none";
      this.renameChord.style.display = "none";
      this.infoChord.style.display = "block";

      this.infoChord.querySelector("input").focus();
      this.Rename = false;
    }
  }
}
