import { EventBus } from "./eventBus";
import { ShortcutChord } from "./shortcutChord.js";
import shortcuts from "./shortcuts.json";

const d = document;

export class KeyHandler {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;

    this.eventKeyMap = {
      Alt: "alt",
      Control: "ctrl",
      Shift: "shift",
      " ": "space",
    };

    this.lastChord = shortcuts.action.space.action;

    this.modalChord = d.querySelector(".modal-chord");
    this.inputChord = d.querySelector(".modal-chord .input-chord");

    this.header = d.querySelector(".modal-chord .shortcut-chord .header");
    this.fakeHeader = d.querySelector(
      ".modal-chord  .shortcut-chord-fake .header",
    );
    this._Chord = d.querySelector(".shortcut-chord");
    this.fakeChord = d.querySelector(".shortcut-chord-fake");

    this.exceptionKey = ["ArrowUp", "ArrowDown", "arrowLeft", "ArrowRight"];
  }

  init() {
    this.chordGenerator(this.lastChord);
    d.addEventListener("keydown", (event) => {
      if (event.repeat && !this.exceptionKey.includes(event.key)) return;
      const key = this.eventKeyMap[event.key] || event.key;
      this.action(key);

      // if (
      //   event.target.tagName === "INPUT" &&
      //   event.key != "Enter" &&
      //   event.key != "Escape"
      // )
      //   return;
      // event.preventDefault();
      // this.eventBus.emit("key:pressed", { key: event.key });
      // if (this.shortcutChord.handleKey(event)) {
      //   switch (event.key) {
      //     case "Control":
      //       this.Ctrl = true;
      //       break;
      //
      //     case "Shift":
      //       this.Shift = true;
      //       break;
      //
      //     case "Alt":
      //       this.Alt = true;
      //       break;
      //
      //     default:
      //       if (this.Alt) {
      //         if (this.AltKeys[event.key]) {
      //           this.app.menu.handleMenuAction(this.AltKeys[event.key]); // Trigger the corresponding menu item
      //         }
      //       } else if (this.Ctrl) {
      //         if (this.CtrlKeys[event.key]) {
      //           this.app.menu.handleMenuAction(this.CtrlKeys[event.key]); // Trigger the corresponding menu item
      //         }
      //       } else if (this.Shift) {
      //         if (this.ShiftKeys[event.key]) {
      //           this.app.menu.handleMenuAction(this.ShiftKeys[event.key]); // Trigger the corresponding menu item
      //         }
      //       } else if (event.key == "r") {
      //         this.shortcutChord.toggleRename(true);
      //       } else if (event.key == "i") {
      //         this.shortcutChord.toggleInfo(true);
      //       } else if (event.key == "w") {
      //         this.shortcutChord.toggleWeight(true);
      //       } else {
      //         if (this.shortcuts[event.key]) {
      //           this.app.menu.handleMenuAction(this.shortcuts[event.key]); // Trigger the corresponding menu item
      //         }
      //       }
      //
      //       break;
      // }
      // }
    });

    d.addEventListener("keyup", (event) => {
      switch (event.key) {
        case "Control":
          this.Ctrl = false;
          break;
        case "Shift":
          this.Shift = false;
          break;

        case "Alt":
          this.Alt = false;
          break;

        default:
          this.eventBus.emit("key:release", { key: event.key });
          break;
      }
    });
  }

  chordGenerator(chord) {
    const ul = d.createElement("ul");
    for (const key in chord) {
      const desc = chord[key].desc;
      const li = d.createElement("li");
      li.innerHTML = `
      <span class="title">${key}</span>
      <span class="arrow">→</span>
      <span class="desc">${desc}</span>
    `;
      ul.appendChild(li);
    }

    // Remove existing <ul> if it exists
    const existingUlChord = this._Chord.querySelector("ul");
    if (existingUlChord) this._Chord.removeChild(existingUlChord);

    const existingUlFake = this.fakeChord.querySelector("ul");
    if (existingUlFake) this.fakeChord.removeChild(existingUlFake);

    this._Chord.appendChild(ul);
    this.fakeChord.appendChild(ul.cloneNode(true));
  }

  action(key) {
    const chord = this.lastChord[key];
    if (chord) {
      if (typeof chord.action === "string") {
        this.app.menu.handleMenuAction(chord.action);
        this.lastChord = shortcuts.action;
        this.toggleChord(false);
      } else {
        this.lastChord = chord.action;
        this.chordGenerator(this.lastChord);
        this.toggleChord(true);
      }
    } else {
      this.toggleChord(false);
      this.lastChord = shortcuts.action;
    }
  }

  toggleChord(val = true) {
    if (val) {
      this.modalChord.style.display = "flex";
    } else {
      this.modalChord.style.display = "none";
    }
  }
}
