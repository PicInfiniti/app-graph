const contextMenu = document.getElementById("custom-context-menu");

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();

  const menu = document.getElementById("custom-context-menu");
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
document.addEventListener("click", () => {
  document.getElementById("custom-context-menu").style.display = "none";
});

