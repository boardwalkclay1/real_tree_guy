document.getElementById("calc").onclick = () => {
  const d = parseFloat(document.getElementById("dist").value);
  const a = parseFloat(document.getElementById("angle").value);
  const lean = parseFloat(document.getElementById("lean").value);

  const rad = (a + lean) * (Math.PI / 180);
  const height = Math.tan(rad) * d;

  document.getElementById("manualResult").textContent =
    `Estimated Height: ${height.toFixed(1)} ft`;
};
