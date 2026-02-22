// flyers.js
const PROFILE_KEY = "business_profile";
const FLYER_KEY = "tn_flyer";

let profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
let design = JSON.parse(localStorage.getItem(FLYER_KEY) || "{}");

const modeCardsBtn = document.getElementById("modeCards");
const modeFlyersBtn = document.getElementById("modeFlyers");
const templateSelect = document.getElementById("templateSelect");
const headlineEl = document.getElementById("headline");
const bodyEl = document.getElementById("body");
const offerEl = document.getElementById("offer");
const photoInput = document.getElementById("photoInput");
const bgStrengthEl = document.getElementById("bgStrength");
const logoUpload = document.getElementById("logoUpload");
const bgColorEl = document.getElementById("bgColor");
const textColorEl = document.getElementById("textColor");
const accentColorEl = document.getElementById("accentColor");
const fontSelect = document.getElementById("fontSelect");

const preview = document.getElementById("preview");
const previewBgImage = document.getElementById("previewBgImage");
const previewLogo = document.getElementById("previewLogo");
const previewHeadline = document.getElementById("previewHeadline");
const previewBody = document.getElementById("previewBody");
const previewOffer = document.getElementById("previewOffer");
const previewContact = document.getElementById("previewContact");

// Real fonts with names
const fonts = [
  { css: "Poppins, system-ui, sans-serif", label: "Poppins (Clean Modern)" },
  { css: "Playfair Display, serif", label: "Playfair Display (Elegant Serif)" },
  { css: "Oswald, sans-serif", label: "Oswald (Bold Block)" },
  { css: "Raleway, sans-serif", label: "Raleway (Minimalist)" },
  { css: "Merriweather, serif", label: "Merriweather (Classic Serif)" },
  { css: "Montserrat, system-ui, sans-serif", label: "Montserrat (Professional)" },
  { css: "Roboto, system-ui, sans-serif", label: "Roboto (Neutral)" },
  { css: "Nunito, system-ui, sans-serif", label: "Nunito (Rounded Soft)" },
  { css: "Bebas Neue, sans-serif", label: "Bebas Neue (Tall Bold)" },
  { css: "Lora, serif", label: "Lora (Editorial)" }
];

fonts.forEach(f => {
  const opt = document.createElement("option");
  opt.value = f.css;
  opt.textContent = f.label;
  opt.style.fontFamily = f.css;
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
    design.bgImage = reader.result;
    previewBgImage.style.backgroundImage = `url(${reader.result})`;
    renderPreview();
  };
  reader.readAsDataURL(file);
};

logoUpload.onchange = () => {
  const file = logoUpload.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    design.logoOverride = reader.result;
    previewLogo.style.backgroundImage = `url(${reader.result})`;
  };
  reader.readAsDataURL(file);
};

function renderPreview() {
  const bg = bgColorEl.value;
  const text = textColorEl.value;
  const accent = accentColorEl.value;
  const font = fontSelect.value || fonts[0].css;
  const strength = parseInt(bgStrengthEl.value, 10) / 100;

  preview.style.backgroundColor = bg;
  preview.style.color = text;
  previewHeadline.style.color = accent;
  previewOffer.style.color = accent;
  preview.style.fontFamily = font;

  previewHeadline.textContent = headlineEl.value || "";
  previewBody.textContent = bodyEl.value || "";
  previewOffer.textContent = offerEl.value || "";

  previewBgImage.style.opacity = strength;
  if (design.bgImage) {
    previewBgImage.style.backgroundImage = `url(${design.bgImage})`;
  }

  const logoSrc = design.logoOverride || profile.logo || null;
  if (logoSrc) {
    previewLogo.style.backgroundImage = `url(${logoSrc})`;
  } else {
    previewLogo.style.backgroundImage = "none";
  }

  const contactLines = [];
  if (profile.name) contactLines.push(profile.name);
  if (profile.phone) contactLines.push(`Phone: ${profile.phone}`);
  if (profile.email) contactLines.push(`Email: ${profile.email}`);
  if (profile.address) contactLines.push(profile.address);

  previewContact.textContent = contactLines.join(" • ");
}

headlineEl.oninput = renderPreview;
bodyEl.oninput = renderPreview;
offerEl.oninput = renderPreview;
bgColorEl.oninput = renderPreview;
textColorEl.oninput = renderPreview;
accentColorEl.oninput = renderPreview;
fontSelect.onchange = renderPreview;
bgStrengthEl.oninput = renderPreview;

modeCardsBtn.onclick = () => {
  modeCardsBtn.classList.add("active");
  modeFlyersBtn.classList.remove("active");
  preview.classList.add("card-mode");
};

modeFlyersBtn.onclick = () => {
  modeFlyersBtn.classList.add("active");
  modeCardsBtn.classList.remove("active");
  preview.classList.remove("card-mode");
};

document.getElementById("save").onclick = () => {
  design = {
    mode: preview.classList.contains("card-mode") ? "card" : "flyer",
    template: templateSelect.value,
    headline: headlineEl.value,
    body: bodyEl.value,
    offer: offerEl.value,
    bgColor: bgColorEl.value,
    textColor: textColorEl.value,
    accentColor: accentColorEl.value,
    font: fontSelect.value,
    bgImage: design.bgImage || null,
    bgStrength: bgStrengthEl.value,
    logoOverride: design.logoOverride || null
  };
  localStorage.setItem(FLYER_KEY, JSON.stringify(design));
  alert("Design saved.");
};

document.getElementById("printFlyer").onclick = () => {
  const w = window.open("", "_blank");
  w.document.write(`
    <html><head><title>Print</title></head>
    <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#f4f7fa;">
      ${preview.outerHTML}
    </body></html>
  `);
  w.document.close();
  w.focus();
  w.print();
};

document.getElementById("emailFlyer").onclick = () => {
  const subject = encodeURIComponent("Tree Service Card / Flyer");
  const bodyText = encodeURIComponent(
`${headlineEl.value}

${bodyEl.value}

${offerEl.value}

${profile.name || ""} • ${profile.phone || ""} • ${profile.email || ""}`
  );
  window.location.href = `mailto:?subject=${subject}&body=${bodyText}`;
};

async function shareAsImage() {
  if (!("html2canvas" in window)) {
    alert("Sharing as image requires a screenshot tool on this device.");
    return;
  }
}

document.getElementById("shareFlyer").onclick = async () => {
  if (!navigator.share) {
    alert("Use your device screenshot/share to pass this card/flyer to the client.");
    return;
  }

  // Simple text share (static OS; image generation would need canvas)
  const text = `${headlineEl.value}\n\n${bodyEl.value}\n\n${offerEl.value}\n\n${profile.name || ""} • ${profile.phone || ""} • ${profile.email || ""}`;
  try {
    await navigator.share({
      title: "Tree Service Card",
      text
    });
  } catch (e) {
    // user cancelled or not supported
  }
};

document.getElementById("fullscreenFlyer").onclick = () => {
  const w = window.open("", "_blank");
  w.document.write(`
    <html><head><title>Card / Flyer</title></head>
    <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;">
      ${preview.outerHTML}
    </body></html>
  `);
  w.document.close();
};

function init() {
  if (design.template) templateSelect.value = design.template;
  if (design.headline) headlineEl.value = design.headline;
  if (design.body) bodyEl.value = design.body;
  if (design.offer) offerEl.value = design.offer;
  if (design.bgColor) bgColorEl.value = design.bgColor;
  if (design.textColor) textColorEl.value = design.textColor;
  if (design.accentColor) accentColorEl.value = design.accentColor;
  if (design.font) fontSelect.value = design.font;
  if (design.bgImage) previewBgImage.style.backgroundImage = `url(${design.bgImage})`;
  if (design.bgStrength) bgStrengthEl.value = design.bgStrength;
  if (design.logoOverride) previewLogo.style.backgroundImage = `url(${design.logoOverride})`;

  if (!fontSelect.value) fontSelect.value = fonts[0].css;

  if (design.mode === "flyer") {
    modeFlyersBtn.click();
  } else {
    modeCardsBtn.click();
  }

  if (!design.headline && !design.body && !design.offer) {
    applyTemplate("classic");
  } else {
    renderPreview();
  }
}

init();
