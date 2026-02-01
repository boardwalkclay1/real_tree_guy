function drawTree(ctx) {
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(140, 80, 20, 100);

  ctx.beginPath();
  ctx.arc(150, 60, 40, 0, Math.PI * 2);
  ctx.fillStyle = "#228B22";
  ctx.fill();
}

function drawArrow(ctx) {
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(200, 100);
  ctx.lineTo(280, 100);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(280, 100);
  ctx.lineTo(260, 90);
  ctx.lineTo(260, 110);
  ctx.closePath();
  ctx.fillStyle = "yellow";
  ctx.fill();
}

function drawNotch(ctx, type) {
  ctx.fillStyle = "orange";
  if (type === "open") {
    ctx.beginPath();
    ctx.moveTo(140, 140);
    ctx.lineTo(110, 160);
    ctx.lineTo(140, 160);
    ctx.closePath();
    ctx.fill();
  }
  if (type === "humboldt") {
    ctx.beginPath();
    ctx.moveTo(140, 160);
    ctx.lineTo(110, 140);
    ctx.lineTo(140, 140);
    ctx.closePath();
    ctx.fill();
  }
}

function render(id, type) {
  const c = document.getElementById(id);
  const ctx = c.getContext("2d");
  drawTree(ctx);
  drawArrow(ctx);
  drawNotch(ctx, type);
}

render("openFace", "open");
render("humboldt", "humboldt");
render("wedges", "open");
