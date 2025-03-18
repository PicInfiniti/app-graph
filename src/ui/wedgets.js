const d = document;

export class Widget {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.settings = app.settings;

    this.panels = {
      info: d.getElementById('floating-panel'),
      tools: d.getElementById('tools-panel')
    };

    this.handels = {
      info: "#info",
      tools: "#tools"
    }

    this.addEventListeners();
    this.makePanelsDraggable();
    this.listeners();
    this.contexMenu();
  }

  init() {
    this.togglePanel('info', '#panel-btn .check', this.settings.info_panel);
    this.togglePanel('tools', '#tools-btn .check', this.settings.tools_panel);  // Add event listeners for button clicks
  }

  contexMenu() {
    const contextMenu = d.getElementById("custom-context-menu");
    d.addEventListener("contextmenu", (event) => {
      event.preventDefault();

      const menu = d.getElementById("custom-context-menu");
      const menuWidth = menu.offsetWidth;
      const menuHeight = menu.offsetHeight;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      let x = event.pageX;
      let y = event.pageY;

      // Adjust position if menu goes off the right edge
      if (x + menuWidth > screenWidth) {
        x -= menuWidth; // Move left
      }

      // Adjust position if menu goes off the bottom edge
      if (y + menuHeight > screenHeight) {
        y -= menuHeight; // Move up
      }

      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
      menu.style.display = "block";
    });

    // Hide menu when clicking elsewhere
    d.addEventListener("click", () => {
      d.getElementById("custom-context-menu").style.display = "none";
    });

  }

  togglePanel(panelKey, buttonSelector, isVisible) {
    const panel = this.panels[panelKey];
    const button = d.querySelector(buttonSelector);

    button.classList.toggle("hidden", !isVisible);
    panel.style.display = isVisible ? 'flex' : 'none';

    if (!isVisible) {
      panel.style.left = '';
      panel.style.top = '';
      panel.setAttribute('data-x', 0);
      panel.setAttribute('data-y', 0);
    }
  }

  addEventListeners() {
    const infoClose = d.querySelector('#floating-panel .close');
    const toolsClose = d.querySelector('#tools-panel .close');

    if (infoClose) {
      infoClose.addEventListener('click', () => {
        this.eventBus.emit("toggleSetting", { key: "info_panel" });
      });
    }

    if (toolsClose) {
      toolsClose.addEventListener('click', () => {
        this.eventBus.emit("toggleSetting", { key: "tools_panel" });
      });
    }

  }


  makePanelsDraggable() {
    Object.keys(this.panels).forEach(key => {
      if (this.panels[key] && this.handels[key]) {
        this.makeDraggable(this.panels[key], this.handels[key]);
      }
    });
  }

  makeDraggable(panel, handle) {
    let offsetX = 0, offsetY = 0, isDragging = false;

    const startDrag = (event) => {
      isDragging = true;

      let clientX, clientY;
      if (event.touches) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      const rect = panel.getBoundingClientRect();
      offsetX = clientX - rect.left;
      offsetY = clientY - rect.top;

      panel.style.position = 'absolute';
      panel.style.zIndex = '1000';

      d.addEventListener('mousemove', onDrag);
      d.addEventListener('mouseup', stopDrag);
      d.addEventListener('touchmove', onDrag, { passive: false });
      d.addEventListener('touchend', stopDrag);
    };

    const onDrag = (event) => {
      if (!isDragging) return;

      let clientX, clientY;
      if (event.touches) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
        event.preventDefault(); // Prevent scrolling while dragging
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      panel.style.left = `${clientX - offsetX}px`;
      panel.style.top = `${clientY - offsetY}px`;
    };

    const stopDrag = () => {
      isDragging = false;
      d.removeEventListener('mousemove', onDrag);
      d.removeEventListener('mouseup', stopDrag);
      d.removeEventListener('touchmove', onDrag);
      d.removeEventListener('touchend', stopDrag);
    };
    d.querySelector(handle).addEventListener('mousedown', startDrag);
    d.querySelector(handle).addEventListener('touchstart', startDrag, { passive: true });
  }

  listeners() {
    d.querySelector("widgets #tools-panel .scale").addEventListener("click", (event) => {
      this.eventBus.emit("toggleSetting", { key: "scale" })
    })

    d.querySelector("widgets #tools-panel .tree").addEventListener("click", (event) => {
      this.eventBus.emit("toggleSetting", { key: "tree" })
    })

    d.querySelector("widgets #tools-panel .force").addEventListener("click", (event) => {
      this.eventBus.emit("toggleSetting", { key: "forceSimulation" })
    })
  }
}

