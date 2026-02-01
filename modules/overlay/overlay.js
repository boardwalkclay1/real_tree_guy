const video = document.getElementById("cam");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then(stream => video.srcObject = stream);

function drawOverlay() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Crosshair
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(200, 0);
  ctx.lineTo(200, 300);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 150);
  ctx.lineTo(400, 150);
  ctx.stroke();

  requestAnimationFrame(drawOverlay);
}

drawOverlay();
