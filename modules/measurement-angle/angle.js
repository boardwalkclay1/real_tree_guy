/* --------------------------------------------------
   REAL TREE GUY — PRO ANGLE MODE ENGINE
   Auto-Calibrate • Smoothing • Drift Fix • Photo Annotate
-------------------------------------------------- */

const angleDistanceInput = document.getElementById("angleDistance");
const angleDisplay = document.getElementById("angleDisplay");
const horizonDisplay = document.getElementById("horizonDisplay");
const stabilityDisplay = document.getElementById("stabilityDisplay");
const angleHeightOut = document.getElementById("angleHeightOut");

const calibrateBtn = document.getElementById("calibrateBtn");
const lockAngleBtn = document.getElementById("lockAngleBtn");
const resetAngleBtn = document.getElementById("resetAngleBtn");
const snapBtn = document.getElementById("snapBtn");

const cameraPreview = document.getElementById("cameraPreview");
const canvas = document.getElementById("snapshotCanvas");
const ctx = canvas.getContext("2d");

let currentAngleDeg = 0;
let smoothAngle = 0;
let horizonOffset = 0;
let lastAngles = [];
let autoCalibrated = false;

const SMOOTHING = 0.15;
const EYE_HEIGHT = 1.65; // meters

/* --------------------------------------------------
   CAMERA INIT
-------------------------------------------------- */
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
    cameraPreview.srcObject = stream;
  } catch (err) {
    alert("Camera unavailable.");
  }
}
initCamera();

/* --------------------------------------------------
   ORIENTATION + SMOOTHING + STABILITY
-------------------------------------------------- */
window.addEventListener("deviceorientation", (e) => {
  const raw = e.beta;
  if (typeof raw !== "number") return;

  // Exponential smoothing
  smoothAngle = smoothAngle + SMOOTHING * (raw - smoothAngle);
  currentAngleDeg = smoothAngle;

  angleDisplay.textContent = currentAngleDeg.toFixed(1);

  // Stability tracking
  lastAngles.push(currentAngleDeg);
  if (lastAngles.length > 20) lastAngles.shift();

  const spread = Math.max(...lastAngles) - Math.min(...lastAngles);
  stabilityDisplay.textContent =
    spread < 1 ? "Stable" :
    spread < 3 ? "OK" : "Unsteady";

  // Auto-calibrate when level
  if (!autoCalibrated && Math.abs(currentAngleDeg) < 1) {
    horizonOffset = currentAngleDeg;
    horizonDisplay.textContent = horizonOffset.toFixed(1);
    autoCalibrated = true;
  }

  // Drift correction
  if (Math.abs(currentAngleDeg - horizonOffset) < 0.2) {
    currentAngleDeg = horizonOffset;
  }
});

/* --------------------------------------------------
   HEIGHT CALC
-------------------------------------------------- */
function calculateHeight() {
  const dist = parseFloat(angleDistanceInput.value);
  if (!dist || dist <= 0) return null;

  const effectiveAngle = currentAngleDeg - horizonOffset;
  const rad = effectiveAngle * Math.PI / 180;
  const height = EYE_HEIGHT + dist * Math.tan(rad);

  return height;
}

/* Live preview */
setInterval(() => {
  const h = calculateHeight();
  if (h !== null) angleHeightOut.textContent = h.toFixed(2) + " m";
}, 120);

/* Lock height */
lockAngleBtn.onclick = () => {
  const h = calculateHeight();
  if (h === null) return alert("Enter distance.");
  angleHeightOut.textContent = h.toFixed(2) + " m";
};

/* Reset */
resetAngleBtn.onclick = () => {
  horizonOffset = 0;
  autoCalibrated = false;
  lastAngles = [];
  horizonDisplay.textContent = "0.0";
  angleHeightOut.textContent = "–";
  stabilityDisplay.textContent = "–";
};

/* --------------------------------------------------
   SNAP PHOTO + ANNOTATE HEIGHT + WIDTH
-------------------------------------------------- */
snapBtn.onclick = () => {
  const h = calculateHeight();
  if (h === null) return alert("Enter distance first.");

  // Draw camera frame
  canvas.width = cameraPreview.videoWidth;
  canvas.height = cameraPreview.videoHeight;
  ctx.drawImage(cameraPreview, 0, 0);

  // Annotate text
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, canvas.height - 120, canvas.width, 120);

  ctx.fillStyle = "#00ff88";
  ctx.font = "40px Trebuchet MS";
  ctx.fillText(`Height: ${h.toFixed(2)} m`, 20, canvas.height - 60);

  // Width estimation (simple placeholder)
  ctx.fillText(`Width: Measure in Photo Mode`, 20, canvas.height - 20);

  // Save image
  const link = document.createElement("a");
  link.download = "tree-measurement.jpg";
  link.href = canvas.toDataURL("image/jpeg");
  link.click();
};
