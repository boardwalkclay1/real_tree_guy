// ===============================
// REAL TREE GUY – CARDS & FLYERS STUDIO
// Live Preview Engine
// ===============================

// DOM HOOKS
const modeCardBtn = document.getElementById("modeCard");
const modeFlyerBtn = document.getElementById("modeFlyer");
const modeDoorHangerBtn = document.getElementById("modeDoorHanger");

const templateSelect = document.getElementById("templateSelect");
const headlineInput = document.getElementById("headline");
const bodyInput = document.getElementById("body");
const offerInput = document.getElementById("offer");

const bgUpload = document.getElementById("bgUpload");
const bgStrength = document.getElementById("bgStrength");
const logoUpload = document.getElementById("logoUpload");

const bgColorInput = document.getElementById("bgColor");
const textColorInput = document.getElementById("textColor");
const accentColorInput = document.getElementById("accentColor");
const fontSelect = document.getElementById("fontSelect");

const saveDesignBtn = document.getElementById("saveDesign");
const printFlyerBtn = document.getElementById("printFlyer");
const emailFlyerBtn = document.getElementById("emailFlyer");
const shareFlyerBtn = document.getElementById("shareFlyer");
const fullscreenFlyerBtn = document.getElementById("fullscreenFlyer");

// PREVIEW DOM
const preview = document.getElementById("preview");
const previewBg = document.getElementById("previewBg");
const previewLogo = document.getElementById("previewLogo");
const previewHeadline = document.getElementById("previewHeadline");
const previewBody = document.getElementById("previewBody");
const previewOffer = document.getElementById("previewOffer");
const previewContact = document.getElementById("previewContact");

// ===============================
// FONTS
// ===============================
const AVAILABLE_FONTS = [
  { label: "Montserrat (Default)", value: "'Montserrat', sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" }
];

function initFontSelect() {
  AVAILABLE_FONTS.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f.value;
    opt.textContent = f.label;
    fontSelect.appendChild(opt);
  });
  fontSelect.value = AVAILABLE_FONTS[0].value;
}

// ===============================
// TEMPLATES
// ===============================
const TEMPLATES = {
  classic: {
    headline: "Professional Tree Removal & Trimming",
    body: "Safe, insured, and reliable tree work. From removals to pruning, we handle it all with care.",
    offer: "Call Today for a Free Estimate",
  },
  bold: {
    headline: "🔥 BIG TREE? BIGGER DISCOUNT.",
    body: "Storm damage, dangerous limbs, or overgrown trees — we move fast and clean.",
    offer: "10% Off This Week Only",
  },
  minimal: {
    headline: "Clean, Safe Tree Work",
    body: "Licensed, insured, and focused on quality. No mess, no stress.",
    offer: "Book Your Estimate",
  },
  premium: {
    headline: "Premium Tree Care for Premium Properties",
    body: "White‑glove service, detailed cleanup, and professional crews you can trust.",
    offer: "Ask About Our Maintenance Plans",
  },
  storm: {
    headline: "⚡ Emergency Storm Damage Response",
    body: "24/7 emergency tree removal and cleanup. We secure the site and protect your property.",
    offer: "Call Now – We’re On Standby",
  }
};

function applyTemplate(name) {
  const tpl = TEMPLATES[name];
  if (!tpl) return;
  headlineInput.value = tpl.headline;
  bodyInput.value = tpl.body;
  offerInput.value = tpl.offer;
  updatePreview();
}

// ===============================
// MODE SWITCHING
// ===============================
function setMode(mode) {
  modeCardBtn.classList.toggle("active", mode === "card");
  modeFlyerBtn.classList.toggle("active", mode === "flyer");
  modeDoorHangerBtn.classList.toggle("active", mode === "door");

  preview.classList.remove("card-mode", "flyer-mode", "door-mode");

  if (mode === "card") {
    preview.classList.add("card-mode");
    preview.style.width = "350px";
    preview.style.height = "200px";
  } else if (mode === "flyer") {
    preview.classList.add("flyer-mode");
    preview.style.width = "350px";
    preview.style.height = "500px";
  } else if (mode === "door") {
    preview.classList.add("door-mode");
    preview.style.width = "280px";
    preview.style.height = "550px";
  }
}

// ===============================
// IMAGE HANDLING
// ===============================
function handleImageUpload(inputEl, callback) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}

// ===============================
// PREVIEW UPDATE
// ===============================
function updatePreview() {
  // Text
  previewHeadline.textContent = headlineInput.value || "Your Headline Here";
  previewBody.textContent = bodyInput.value || "Describe your services, what makes you different, and why they should call you.";
  previewOffer.textContent = offerInput.value || "Special Offer or Call to Action";

  // Contact line (placeholder for now)
  previewContact.textContent = "Call / Text: (555) 555‑5555 • RealTreeGuy.com";

  // Colors
  preview.style.backgroundColor = bgColorInput.value;
  preview.style.color = textColorInput.value;
  previewOffer.style.color = accentColorInput.value;

  // Font
  preview.style.fontFamily = fontSelect.value;

  // Background strength
  const strength = parseInt(bgStrength.value, 10) / 100;
  previewBg.style.opacity = strength;
}

// ===============================
// ACTIONS
// ===============================
saveDesignBtn.addEventListener("click", () => {
  const design = {
    mode: modeCardBtn.classList.contains("active")
      ? "card"
      : modeFlyerBtn.classList.contains("active")
      ? "flyer"
      : "door",
    template: templateSelect.value,
    headline: headlineInput.value,
    body: bodyInput.value,
    offer: offerInput.value,
    bgColor: bgColorInput.value,
    textColor: textColorInput.value,
    accentColor: accentColorInput.value,
    font: fontSelect.value
  };

  // For now, just store in localStorage
  localStorage.setItem("rtg_flyer_design", JSON.stringify(design));
  alert("Design saved locally. (Future: save to Real Tree Guy OS profile)");
});

printFlyerBtn.addEventListener("click", () => {
  window.print();
});

emailFlyerBtn.addEventListener("click", () => {
  alert("Email feature coming soon. (Hook into Real Tree Guy OS email module.)");
});

shareFlyerBtn.addEventListener("click", async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: "My Real Tree Guy Flyer",
        text: "Check out my new tree service flyer.",
        url: window.location.href
      });
    } catch (e) {
      console.log(e);
    }
  } else {
    alert("Sharing not supported on this device. Copy the URL or screenshot the flyer.");
  }
});

fullscreenFlyerBtn.addEventListener("click", () => {
  if (preview.requestFullscreen) {
    preview.requestFullscreen();
  } else {
    alert("Fullscreen not supported here. Try desktop or a modern mobile browser.");
  }
});

// ===============================
// EVENT WIRING
// ===============================
modeCardBtn.addEventListener("click", () => setMode("card"));
modeFlyerBtn.addEventListener("click", () => setMode("flyer"));
modeDoorHangerBtn.addEventListener("click", () => setMode("door"));

templateSelect.addEventListener("change", () => applyTemplate(templateSelect.value));

headlineInput.addEventListener("input", updatePreview);
bodyInput.addEventListener("input", updatePreview);
offerInput.addEventListener("input", updatePreview);

bgColorInput.addEventListener("input", updatePreview);
textColorInput.addEventListener("input", updatePreview);
accentColorInput.addEventListener("input", updatePreview);
bgStrength.addEventListener("input", updatePreview);

fontSelect.addEventListener("change", updatePreview);

bgUpload.addEventListener("change", () => {
  handleImageUpload(bgUpload, (dataUrl) => {
    previewBg.style.backgroundImage = `url('${dataUrl}')`;
    updatePreview();
  });
});

logoUpload.addEventListener("change", () => {
  handleImageUpload(logoUpload, (dataUrl) => {
    previewLogo.style.backgroundImage = `url('${dataUrl}')`;
  });
});

// ===============================
// INIT
// ===============================
initFontSelect();
applyTemplate("classic");
setMode("card");
updatePreview();
