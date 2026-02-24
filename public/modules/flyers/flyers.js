// ===============================
// REAL TREE GUY – FLYER ENGINE
// ===============================

// DOM
const headline = document.getElementById("headline");
const body = document.getElementById("body");
const offer = document.getElementById("offer");

const previewHeadline = document.getElementById("previewHeadline");
const previewBody = document.getElementById("previewBody");
const previewOffer = document.getElementById("previewOffer");
const previewBg = document.getElementById("previewBg");
const previewLogo = document.getElementById("previewLogo");
const previewContact = document.getElementById("previewContact");

// LIVE UPDATE
function updatePreview() {
  previewHeadline.textContent = headline.value;
  previewBody.textContent = body.value;
  previewOffer.textContent = offer.value;
}

headline.oninput = updatePreview;
body.oninput = updatePreview;
offer.oninput = updatePreview;

// BACKGROUND IMAGE
document.getElementById("bgUpload").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    previewBg.style.backgroundImage = `url(${reader.result})`;
  };
  reader.readAsDataURL(file);
};

// LOGO
document.getElementById("logoUpload").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    previewLogo.style.backgroundImage = `url(${reader.result})`;
  };
  reader.readAsDataURL(file);
};

// BACKGROUND STRENGTH
document.getElementById("bgStrength").oninput = (e) => {
  previewBg.style.opacity = e.target.value / 100;
};

// COLORS
document.getElementById("bgColor").oninput = (e) => {
  preview.style.background = e.target.value;
};

document.getElementById("textColor").oninput = (e) => {
  preview.style.color = e.target.value;
};

// CONTACT INFO (from profile later)
previewContact.textContent = "Chainsaw Clay's Tree Service • 678-683-0570";
