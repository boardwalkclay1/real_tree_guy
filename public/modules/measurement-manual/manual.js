const distInput = document.getElementById("manualDistance");
const angleInput = document.getElementById("manualAngle");
const thickInput = document.getElementById("manualThickness");
const leanInput = document.getElementById("manualLean");
const bearingInput = document.getElementById("manualBearing");
const riskInput = document.getElementById("manualRisk");

const outH = document.getElementById("manualHeightOut");
const outR = document.getElementById("manualRadiusOut");
const outT = document.getElementById("manualThicknessOut");
const outLean = document.getElementById("manualLeanOut");
const outB = document.getElementById("manualBearingOut");
const outRisk = document.getElementById("manualRiskOut");

document.getElementById("manualCalcBtn").onclick = () => {
  const d = parseFloat(distInput.value);
  const a = parseFloat(angleInput.value);
  const t = parseFloat(thickInput.value);
  const lean = parseFloat(leanInput.value);
  const bearing = parseFloat(bearingInput.value);
  const risk = parseInt(riskInput.value);

  const rad = a * Math.PI / 180;
  const height = d * Math.tan(rad);

  outH.textContent = `${height.toFixed(2)} m`;
  outR.textContent = `${height.toFixed(2)} m`;
  outT.textContent = `${t.toFixed(2)} m`;
  outB.textContent = `${bearing.toFixed(0)}°`;

  let leanClass =
    Math.abs(lean) < 5 ? "Minimal" :
    Math.abs(lean) < 15 ? "Moderate" :
    "Significant";

  outLean.textContent = `${lean.toFixed(1)}° (${leanClass})`;

  let band =
    risk <= 2 && Math.abs(lean) < 10 ? "Lower" :
    risk <= 3 && Math.abs(lean) < 20 ? "Moderate" :
    "Higher
