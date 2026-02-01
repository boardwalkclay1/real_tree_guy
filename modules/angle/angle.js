const video = document.getElementById("camera");
const result = document.getElementById("result");

let baseAngle = null;
let topAngle = null;

navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then(stream => video.srcObject = stream);

function getAngle() {
  return window.orientation || 0; // fallback
}

document.getElementById("baseBtn").onclick = () => {
  baseAngle = getAngle();
  result.textContent = "Base angle recorded.";
};

document.getElementById("topBtn").onclick = () => {
  topAngle = getAngle();
  if (baseAngle === null) return;

  const diff = Math.abs(topAngle - baseAngle);
  const radians = diff * (Math.PI / 180);

  const dist = parseFloat(document.getElementById("distance").value);
  const height = Math.tan(radians) * dist;

  result.textContent = `Estimated Height: ${height.toFixed(1)} ft`;
};
