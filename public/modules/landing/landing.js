const canvas = document.getElementById("zone");
const ctx = canvas.getContext("2d");

document.getElementById("calc").onclick = () => {
  const h = parseFloat(document.getElementById("height").value);
  const a = parseFloat(document.getElementById("angle").value);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw tree
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(190, 150, 20, 120);

  ctx.beginPath();
  ctx.arc(200, 130, 40, 0, Math.PI * 2);
  ctx.fillStyle = "#228B22";
  ctx.fill();

  // Landing zone ellipse
  const radius = h * 2;
  ctx.beginPath();
  ctx.ellipse(200 + radius * Math.cos(a * Math.PI/180),
              150 + radius * Math.sin(a * Math.PI/180),
              60, 30, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 3;
  ctx.stroke();
};
