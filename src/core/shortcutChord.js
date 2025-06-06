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
      c: "toggle-color",
    };
  }

  init() {
    this.Chord("space");
  }

  Chord(chord) {
    if (chord === "c") {
      this.C = true;
    }

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

    // Remove existing <ul> if it exists
    const existingUlChord = this.chord.querySelector("ul");
    if (existingUlChord) this.chord.removeChild(existingUlChord);

    const existingUlFake = this.fakeChord.querySelector("ul");
    if (existingUlFake) this.fakeChord.removeChild(existingUlFake);

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
    this.C = false;

    this.Chord("space");
  }

  toggleRename(val = undefined) {
    if (val === undefined) {
      this.Rename = !this.Rename;
    } else {
      this.Rename = val;
    }

    if (this.Rename) {
      this.Space = true;
      this.modalChord.style.display = "flex";
      this.shortcutChord.style.display = "none";
      this.renameChord.style.display = "block";
      this.infoChord.style.display = "none";

      this.renameChord.querySelector("input").focus();

      this.Info = false;
    } else {
      this.toggleChord(false);
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
    } else {
      this.toggleChord(false);
    }
  }

  handleKey(event) {
    if (this.Space) {
      if (event.code == "Space") {
        if (this.C) {
          this.toggleChord(true);
          return;
        } else {
          this.toggleChord(false);
          return;
        }
      } else {
        if (this.C) {
          this.app.menu.handleMenuAction(this.CKeys[event.key]);
          this.toggleChord(false);
          return;
        } else {
          if (event.key === "c") {
            this.Chord("c");
            return;
          }
        }
        if (this.Rename) {
          if (event.key === "Enter") {
            const input = d.getElementById("rename");
            const value = input.value;
            input.value = "";
            this.toggleRename(false);
            this.app.menu.handleMenuAction("rename", value); // Trigger the corresponding menu item
            return;
          }
        }

        if (this.Info) {
          if (event.key === "Enter") {
            const input = document.getElementById("desc");
            const value = input.value;
            input.value = "";
            this.toggleInfo(false);
            this.app.menu.handleMenuAction("desc", value); // Trigger the corresponding menu item
            return;
          }
        }
      }
    } else {
      if (event.code == "Space") {
        this.toggleChord(true);
        return;
      }
    }
    this.toggleChord(false);
    return true;
  }
}
