const angleDistanceInput = document.getElementById("angleDistance");
const angleDisplay = document.getElementById("angleDisplay");
const horizonDisplay = document.getElementById("horizonDisplay");
const stabilityDisplay = document.getElementById("stabilityDisplay");
const angleHeightOut = document.getElementById("angleHeightOut");

const calibrateBtn = document.getElementById("calibrateBtn");
const lockAngleBtn = document.getElementById("lockAngleBtn");
const resetAngleBtn = document.getElementById("resetAngleBtn");
const cameraPreview = document.getElementById("cameraPreview");

let currentAngleDeg = 0;
let horizonOffset = 0;
let lastAngles = [];

// Camera
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

// Orientation
window.addEventListener("deviceorientation", (e) => {
  const beta = e.beta;
  if (typeof beta !== "number") return;

  currentAngleDeg = beta;
  angleDisplay.textContent = currentAngleDeg.toFixed(1);

  lastAngles.push(currentAngleDeg);
  if (lastAngles.length > 20) lastAngles.shift();

  const spread = Math.max(...lastAngles) - Math.min(...lastAngles);
  stabilityDisplay.textContent =
    spread < 1 ? "Stable" :
    spread < 3 ? "OK" : "Unsteady";
});

// Calibrate
calibrateBtn.onclick = () => {
  horizonOffset = currentAngleDeg;
  horizonDisplay.textContent = horizonOffset.toFixed(1);
};

// Lock
lockAngleBtn.onclick = () => {
  const dist = parseFloat(angleDistanceInput.value);
  if (!dist || dist <= 0) return alert("Enter distance.");

  const effectiveAngle = currentAngleDeg - horizonOffset;
  const rad = effectiveAngle * Math.PI / 180;
  const height = dist * Math.tan(rad);

  angleHeightOut.textContent = `${height.toFixed(2)} m`;
};

// Reset
resetAngleBtn.onclick = () => {
  horizonOffset = 0;
  horizonDisplay.textContent = "0.0";
  angleHeightOut.textContent = "–";
  lastAngles = [];
  stabilityDisplay.textContent = "–";
};
