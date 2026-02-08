const input = document.getElementById("photoInput");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const result = document.getElementById("photoResult");

let img = new Image();
let points = [];

input.onchange = e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = ev => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
};

canvas.onclick = e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  points.push({ x, y });

  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  if (points.length === 2) {
    const dy = Math.abs(points[1].y - points[0].y);
    const ref = parseFloat(document.getElementById("refHeight").value);
    const height = (dy / 100) * ref * 10;

    result.textContent = `Estimated Height: ${height.toFixed(1)} ft`;
    points = [];
  }
};
