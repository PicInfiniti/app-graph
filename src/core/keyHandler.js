import { EventBus } from "./eventBus";
import { ShortcutChord } from "./shortcutChord.js";
import shortcuts from "./shortcuts.json";

const d = document;

export class KeyHandler {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;

    this.eventKeyMap = {
      AltRight: "alt",
      ControlRight: "ctrl",
      ShiftRight: "shift",
      AltLeft: "alt",
      ControlLeft: "ctrl",
      ShiftLeft: "shift",
      Space: "space",
    };

    this.pressedKeys = new Set();

    this.lastChord = shortcuts.action.space.action;

    this.modalChord = d.querySelector(".modal-chord");
    this.inputModal = d.querySelector(".modal-input");
    this._input = false;

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

      const key = this.updatePressedKeys(event, "add");
      if (this._input) {
        if (key === "Escape") this.toggleInput("rename", false);
        if (key === "Enter") {
          const input = d.querySelector(".input-chord input");
          this.app.menu.handleMenuAction(this._input, input.value);
          this.toggleInput("rename", false);
        }
        this.pressedKeys.clear();
      } else {
        if (this.isChordVisible())
          this.eventBus.on("key:down", {
            key: this.pressedKeys,
          });

        const key = this.findKey();
        if (key) event.preventDefault();
        this.action(key);
      }
    });

    d.addEventListener("keyup", (event) => {
      if (event.repeat && !this.exceptionKey.includes(event.key)) return;
      const key = this.updatePressedKeys(event, "delete");
      if (!this._input) {
        event.preventDefault();
        if (
          this.lastChord[key] &&
          typeof this.lastChord[key].value === "boolean"
        ) {
          this.app.menu.handleMenuAction(
            this.lastChord[key].action,
            !this.lastChord[key].value,
          );
        }
      }
      this.eventBus.emit("key:up", {
        key: this.pressedKeys,
      });
    });

    const modals = d.querySelectorAll(".modal, .modal-chord, .modal-input");
    if (modals.length > 0) {
      modals.forEach((modal) => {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            modal.style.display = "none";
            this.lastChord = shortcuts.action;
            this._input = false;
          }
        });
      });
    }
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
        this.app.menu.handleMenuAction(chord.action, chord.value);
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

  toggleInput(_input = "rename", val = true) {
    const header = d.querySelector(".input-chord .header");
    const input = d.querySelector(".input-chord input");
    switch (_input) {
      case "rename":
        header.textContent = "Rename";
        input.name = "rename";
        input.placeholder = "Enter New Name ...";
        break;

      case "desc":
        header.textContent = "Description";
        input.name = "desc";
        input.placeholder = "Enter New Description ...";
        break;

      case "weight":
        header.textContent = "Weight";
        input.name = "weight";
        input.placeholder = "Enter New Weight ...";
        break;

      default:
        break;
    }

    if (val) {
      this.inputModal.style.display = "flex";
      input.focus();
      this._input = _input;
    } else {
      this.inputModal.style.display = "none";
      this._input = false;
    }
    setTimeout(() => {
      input.value = "";
    }, 1);
  }

  findKey() {
    console.log(this.lastChord);
    const keys = Object.keys(this.lastChord);
    console.log(keys);
    const found = keys.find((item) => {
      const comboKeys = item.split("+");
      console.log(comboKeys);
      return this.isCombo(...comboKeys);
    });
    console.log(found);
    return found;
  }

  isCombo(...keys) {
    console.log(this.pressedKeys);
    return (
      keys.every((key) => this.pressedKeys.has(key)) &&
      this.pressedKeys.size === keys.length
    );
  }

  updatePressedKeys(event, action = "add") {
    const key = this.eventKeyMap[event.code] || event.key;

    if (action === "add" && key !== "meta") {
      this.pressedKeys.add(key);
    } else {
      this.pressedKeys.delete(key);
    }

    return key;
  }

  isShiftHold() {
    return this.pressedKeys.has("shift");
  }

  isCtrlHold() {
    return this.pressedKeys.has("ctrl");
  }

  isChordVisible() {
    return this.modalChord.style.display !== "none";
  }
}
