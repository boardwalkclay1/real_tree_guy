const PROFILE_KEY = "business_profile";
const FLYER_KEY = "tn_flyer";

let profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
let flyer = JSON.parse(localStorage.getItem(FLYER_KEY) || "{}");

const templateSelect = document.getElementById("templateSelect");
const headlineEl = document.getElementById("headline");
const bodyEl = document.getElementById("body");
const offerEl = document.getElementById("offer");
const photoInput = document.getElementById("photoInput");
const bgColorEl = document.getElementById("bgColor");
const textColorEl = document.getElementById("textColor");
const accentColorEl = document.getElementById("accentColor");
const fontSelect = document.getElementById("fontSelect");

const preview = document.getElementById("preview");
const previewBgImage = document.getElementById("previewBgImage");
const previewHeadline = document.getElementById("previewHeadline");
const previewBody = document.getElementById("previewBody");
const previewOffer = document.getElementById("previewOffer");
const previewContact = document.getElementById("previewContact");

// 10 fonts
const fonts = [
  "Inter, system-ui, sans-serif",
  "Poppins, system-ui, sans-serif",
  "Roboto, system-ui, sans-serif",
  "Montserrat, system-ui, sans-serif",
  "Lato, system-ui, sans-serif",
  "Playfair Display, serif",
  "Merriweather, serif",
  "Oswald, sans-serif",
  "Raleway, sans-serif",
  "Nunito, sans-serif"
];

fonts.forEach((f, i) => {
  const opt = document.createElement("option");
  opt.value = f;
  opt.textContent = `Style ${i + 1}`;
  fontSelect.appendChild(opt);
});

function applyTemplate(name) {
  if (name === "classic") {
    if (!headlineEl.value) headlineEl.value = "Professional Tree Service";
    if (!bodyEl.value) bodyEl.value = "Safe, insured, and reliable tree work.\nRemovals • Trimming • Storm Cleanup";
    if (!offerEl.value) offerEl.value = "Free Estimates • Same Week Scheduling";
  } else if (name === "bold") {
    if (!headlineEl.value) headlineEl.value = "NEED TREE WORK NOW?";
    if (!bodyEl.value) bodyEl.value = "Emergency response, hazardous removals, and precision trimming.";
    if (!offerEl.value) offerEl.value = "Call Today for Priority Service";
  } else if (name === "minimal") {
    if (!headlineEl.value) headlineEl.value = "Tree Care, Done Right.";
    if (!bodyEl.value) bodyEl.value = "Quiet, clean, and careful work on every property.";
    if (!offerEl.value) offerEl.value = "Licensed & Insured • Local Crew";
  }
  renderPreview();
}

templateSelect.onchange = () => applyTemplate(templateSelect.value);

photoInput.onchange = () => {
  const file = photoInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    flyer.bgImage = reader.result;
    previewBgImage.style.backgroundImage = `url(${reader.result})`;
  };
  reader.readAsDataURL(file);
};

function renderPreview() {
  const bg = bgColorEl.value;
  const text = textColorEl.value;
  const accent = accentColorEl.value;
  const font = fontSelect.value || fonts[0];

  preview.style.backgroundColor = bg;
  preview.style.color = text;
  previewHeadline.style.color = accent;
  previewOffer.style.color = accent;

  preview.style.fontFamily = font;

  previewHeadline.textContent = headlineEl.value || "";
  previewBody.textContent = bodyEl.value || "";
  previewOffer.textContent = offerEl.value || "";

  const contactLines = [];
  if (profile.name) contactLines.push(profile.name);
  if (profile.phone) contactLines.push(`Phone: ${profile.phone}`);
  if (profile.email) contactLines.push(`Email: ${profile.email}`);
  if (profile.address) contactLines.push(profile.address);

  previewContact.textContent = contactLines.join(" • ");
  if (flyer.bgImage) {
    previewBgImage.style.backgroundImage = `url(${flyer.bgImage})`;
  }
}

headlineEl.oninput = renderPreview;
bodyEl.oninput = renderPreview;
offerEl.oninput = renderPreview;
bgColorEl.oninput = renderPreview;
textColorEl.oninput = renderPreview;
accentColorEl.oninput = renderPreview;
fontSelect.onchange = renderPreview;

document.getElementById("save").onclick = () => {
  flyer = {
    template: templateSelect.value,
    headline: headlineEl.value,
    body: bodyEl.value,
    offer: offerEl.value,
    bgColor: bgColorEl.value,
    textColor: textColorEl.value,
    accentColor: accentColorEl.value,
    font: fontSelect.value,
    bgImage: flyer.bgImage || null
  };
  localStorage.setItem(FLYER_KEY, JSON.stringify(flyer));
  alert("Flyer saved.");
};

document.getElementById("printFlyer").onclick = () => {
  const w = window.open("", "_blank");
  w.document.write(`
    <html><head><title>Print Flyer</title></head>
    <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#f4f7fa;">
      ${preview.outerHTML}
    </body></html>
  `);
  w.document.close();
  w.focus();
  w.print();
};

document.getElementById("emailFlyer").onclick = () => {
  const subject = encodeURIComponent("Tree Service Flyer");
  const bodyText = encodeURIComponent(
`${headlineEl.value}

${bodyEl.value}

${offerEl.value}

${profile.name || ""} • ${profile.phone || ""} • ${profile.email || ""}`
  );
  window.location.href = `mailto:?subject=${subject}&body=${bodyText}`;
};

document.getElementById("fullscreenFlyer").onclick = () => {
  const w = window.open("", "_blank");
  w.document.write(`
    <html><head><title>Flyer</title></head>
    <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;">
      ${preview.outerHTML}
    </body></html>
  `);
  w.document.close();
};

// Load saved flyer + profile
function init() {
  if (flyer.template) templateSelect.value = flyer.template;
  if (flyer.headline) headlineEl.value = flyer.headline;
  if (flyer.body) bodyEl.value = flyer.body;
  if (flyer.offer) offerEl.value = flyer.offer;
  if (flyer.bgColor) bgColorEl.value = flyer.bgColor;
  if (flyer.textColor) textColorEl.value = flyer.textColor;
  if (flyer.accentColor) accentColorEl.value = flyer.accentColor;
  if (flyer.font) fontSelect.value = flyer.font;
  if (flyer.bgImage) previewBgImage.style.backgroundImage = `url(${flyer.bgImage})`;

  if (!fontSelect.value) fontSelect.value = fonts[0];

  if (!flyer.headline && !flyer.body && !flyer.offer) {
    applyTemplate("classic");
  } else {
    renderPreview();
  }
}

init();
