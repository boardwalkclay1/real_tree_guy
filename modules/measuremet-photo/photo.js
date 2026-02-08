const photoFile = document.getElementById("photoFile");
const canvas = document.getElementById("photoCanvas");
const ctx = canvas.getContext("2d");

const refHeightInput = document.getElementById("refHeight");
const photoClickMode = document.getElementById("photoClickMode");
const resetPhotoBtn = document.getElementById("resetPhotoBtn");

const pixelScaleOut = document.getElementById("pixelScaleOut");
const photoHeightOut = document.getElementById("photoHeightOut");
const photoThicknessOut = document.getElementById("photoThicknessOut");

let img = null;
let refPoints = [];
let treePoints = [];
let thicknessPoints = [];

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

photoFile.onchange = () => {
  const file = photoFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    img = new Image();
    img.onload = () => {
      const maxWidth = 900;
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      refPoints = [];
      treePoints = [];
      thicknessPoints = [];
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
};

canvas.onclick = (e) => {
  if (!img) return;

  const rect = canvas.getBoundingClientRect();
  const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };

  const mode = photoClickMode.value;

  if (mode === "ref") {
    refPoints.push(p);
    if (refPoints.length > 2) refPoints.shift();
  } else if (mode === "tree") {
    treePoints.push(p);
    if (treePoints.length > 2) treePoints.shift();
  } else {
    thicknessPoints.push(p);
    if (thicknessPoints.length > 2) thicknessPoints.shift();
  }

  redraw();
  compute();
};

resetPhotoBtn.onclick = () => {
  refPoints = [];
  treePoints = [];
  thicknessPoints = [];
  if (img) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  pixelScaleOut.textContent = "–";
  photoHeightOut.textContent = "–";
  photoThicknessOut.textContent = "–";
};

function redraw() {
  if (!img) return;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 3;

  if (refPoints.length === 2) {
    ctx.strokeStyle = "#4fbf5a";
    ctx.beginPath();
    ctx.moveTo(refPoints[0].x, refPoints[0].y);
    ctx.lineTo(refPoints[1].x, refPoints[1].y);
    ctx.stroke();
  }

  if (treePoints.length === 2) {
    ctx.strokeStyle = "#ffcc33";
    ctx.beginPath();
    ctx.moveTo(treePoints[0].x, treePoints[0].y);
    ctx.lineTo(treePoints[1].x, treePoints[1].y);
    ctx.stroke();
  }

  if (thicknessPoints.length === 2) {
    ctx.strokeStyle = "#ff6666";
    ctx.beginPath();
    ctx.moveTo(thicknessPoints[0].x, thicknessPoints[0].y);
    ctx.lineTo(thicknessPoints[1].x, thicknessPoints[1].y);
    ctx.stroke();
  }
}

function compute() {
  if (refPoints.length === 2) {
    const refPx = dist(refPoints[0], refPoints[1]);
    const refHeight = parseFloat(refHeightInput.value);

    if (refPx > 0 && refHeight > 0) {
      const scale = refHeight / refPx;
      pixelScaleOut.textContent = `${scale.toFixed(4)} m/pixel`;

      if (treePoints.length === 2) {
        const treePx = dist(treePoints[0], treePoints[1]);
        photoHeightOut.textContent = `${(treePx * scale).toFixed(2)} m`;
      }

      if (thicknessPoints.length === 2) {
        const thickPx = dist(thicknessPoints[0], thicknessPoints[1]);
        photoThicknessOut.textContent = `${(thickPx * scale).toFixed(2)} m`;
      }
    }
  }
}
