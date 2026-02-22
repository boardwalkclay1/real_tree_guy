const canvas = document.getElementById("fallCanvas");
const ctx = canvas.getContext("2d");

document.getElementById("predict").onclick = () => {
  const lean = parseFloat(document.getElementById("lean").value);
  const wind = parseFloat(document.getElementById("wind").value);

  const finalAngle = lean + wind * 0.3;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Tree
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(190, 150, 20, 120);

  ctx.beginPath();
  ctx.arc(200, 130, 40, 0, Math.PI * 2);
  ctx.fillStyle = "#228B22";
  ctx.fill();

  // Fall line
  ctx.beginPath();
  ctx.moveTo(200, 150);
  ctx.lineTo(
    200 + 200 * Math.cos(finalAngle * Math.PI/180),
    150 + 200 * Math.sin(finalAngle * Math.PI/180)
  );
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 4;
  ctx.stroke();
};
