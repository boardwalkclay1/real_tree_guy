// ===============================
// REAL TREE MAP – NEW WORKING VERSION
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

// State
let userLat = null;
let userLng = null;
let currentFilter = null;
let locationReady = false;

// Search phrases
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

  locationStatus.textContent = "Requesting location…";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      locationReady = true;

      locationStatus.textContent = `Location locked: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;

      // Center map on user immediately
      mapFrame.src = `https://www.google.com/maps?q=${userLat},${userLng}&z=14&output=embed`;
      openInMaps.href = `https://www.google.com/maps/search/?api=1&query=${userLat},${userLng}`;
    },
    (err) => {
      locationStatus.textContent = "Location denied. Enable it in browser settings.";
      console.log(err);
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

  // ⭐ Prevent Washington fallback
  if (!locationReady) {
    alert("Still getting your location… try again in a moment.");
    return;
  }

  [...filterRow.querySelectorAll(".pill")].forEach((el) =>
    el.classList.toggle("active", el === btn)
  );

  currentFilter = type;
  activeFilterLabel.textContent = FILTER_QUERIES[type];

  updateMapEmbed();
});

// ===============================
// UPDATE EMBED MAP
// ===============================
function updateMapEmbed() {
  if (!currentFilter) return;
  if (!locationReady) return;

  const queryBase = FILTER_QUERIES[currentFilter];
  const q = `${queryBase} near ${userLat},${userLng}`;
  const encoded = encodeURIComponent(q);

  // ⭐ Correct dynamic embed
  mapFrame.src = `https://www.google.com/maps?q=${encoded}&z=13&output=embed`;

  // External link
  openInMaps.href = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

// ===============================
// DIRECTIONS
// ===============================
function buildDirectionsUrl(origin, queryBase) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(queryBase)}`;
}

directionsFromUserBtn.addEventListener("click", () => {
  if (!currentFilter) return alert("Select a supply filter first.");
  if (!locationReady) return alert("Your location is not available yet.");

  const origin = `${userLat},${userLng}`;
  const dest = FILTER_QUERIES[currentFilter];
  window.open(buildDirectionsUrl(origin, dest), "_blank");
});

directionsFromClientBtn.addEventListener("click", () => {
  if (!currentFilter) return alert("Select a filter first.");

  const clientAddress = clientAddressInput.value.trim();
  if (!clientAddress) return alert("Enter a client address first.");

  const dest = FILTER_QUERIES[currentFilter];
  window.open(buildDirectionsUrl(clientAddress, dest), "_blank");
});

// ===============================
// INIT
// ===============================
initLocation();
