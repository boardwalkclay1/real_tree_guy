// ===============================
// REAL TREE MAP – USER LOCATION + FILTERS + DIRECTIONS
// ===============================

// DOM
const filterRow = document.getElementById("filterRow");
const mapFrame = document.getElementById("mapFrame");
const locationStatus = document.getElementById("locationStatus");
const activeFilterLabel = document.getElementById("activeFilterLabel");
const openInMaps = document.getElementById("openInMaps");
const clientAddressInput = document.getElementById("clientAddress");
const directionsFromUserBtn = document.getElementById("directionsFromUser");
const directionsFromClientBtn = document.getElementById("directionsFromClient");
const hintText = document.getElementById("hintText");

// State
let userLat = null;
let userLng = null;
let currentFilter = null;

// Search phrases for each filter
const FILTER_QUERIES = {
  home_depot: "Home Depot",
  lowes: "Lowe's",
  ace: "Ace Hardware",
  chainsaw: "chainsaw repair shop",
  woodworking: "woodworking supply store",
  wood_dump: "wood dump site",
  sawmill: "sawmill"
};

// ===============================
// GEOLOCATION
// ===============================
function initLocation() {
  if (!navigator.geolocation) {
    locationStatus.textContent = "Geolocation not supported.";
    return;
  }

  locationStatus.textContent = "Requesting your location…";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      locationStatus.textContent = `Location locked: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;

      if (currentFilter) updateMapEmbed();
    },
    () => {
      locationStatus.textContent = "Could not get your location. Using fallback search.";
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
  );
}

// ===============================
// FILTER HANDLING
// ===============================
filterRow.addEventListener("click", (e) => {
  const btn = e.target.closest(".pill");
  if (!btn) return;

  const type = btn.dataset.type;
  if (!FILTER_QUERIES[type]) return;

  [...filterRow.querySelectorAll(".pill")].forEach((el) =>
    el.classList.toggle("active", el === btn)
  );

  currentFilter = type;
  activeFilterLabel.textContent = FILTER_QUERIES[type];

  updateMapEmbed();
});

// ===============================
// MAP EMBED BUILDER (FIXED VERSION)
// ===============================
function updateMapEmbed() {
  if (!currentFilter) {
    mapFrame.src = "https://www.google.com/maps?q=&output=embed";
    openInMaps.href = "https://www.google.com/maps";
    return;
  }

  const queryBase = FILTER_QUERIES[currentFilter];

  let q;
  if (userLat != null && userLng != null) {
    q = `${queryBase} near ${userLat},${userLng}`;
  } else {
    q = `${queryBase} near me`;
  }

  const encoded = encodeURIComponent(q);

  // ⭐ FIXED EMBED URL (this is the correct working format)
  const embedSrc = `https://www.google.com/maps?q=${encoded}&z=13&output=embed`;
  mapFrame.src = embedSrc;

  // External link
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  openInMaps.href = externalUrl;

  hintText.textContent = "Use the map or choose directions.";
}

// ===============================
// DIRECTIONS HELPERS
// ===============================
function buildDirectionsUrl(origin, queryBase) {
  const dest = encodeURIComponent(queryBase);
  const orig = encodeURIComponent(origin);
  return `https://www.google.com/maps/dir/?api=1&origin=${orig}&destination=${dest}`;
}

// Directions: Me → Supply
directionsFromUserBtn.addEventListener("click", () => {
  if (!currentFilter) return alert("Select a supply filter first.");
  if (userLat == null || userLng == null) return alert("Your location is not available yet.");

  const origin = `${userLat},${userLng}`;
  const queryBase = FILTER_QUERIES[currentFilter];
  window.open(buildDirectionsUrl(origin, queryBase), "_blank", "noopener");
});

// Directions: Client → Supply
directionsFromClientBtn.addEventListener("click", () => {
  if (!currentFilter) return alert("Select a supply filter first.");

  const clientAddress = clientAddressInput.value.trim();
  if (!clientAddress) return alert("Enter a client address first.");

  const queryBase = FILTER_QUERIES[currentFilter];
  window.open(buildDirectionsUrl(clientAddress, queryBase), "_blank", "noopener");
});

// ===============================
// INIT
// ===============================
initLocation();
updateMapEmbed();
