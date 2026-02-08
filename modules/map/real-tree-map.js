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

// Map search phrases per filter
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
    locationStatus.textContent = "Geolocation not supported in this browser.";
    return;
  }

  locationStatus.textContent = "Requesting your location…";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      locationStatus.textContent = `Location locked: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
      // If a filter is already selected, refresh map with real coords
      if (currentFilter) {
        updateMapEmbed();
      }
    },
    (err) => {
      console.warn("Geolocation error:", err);
      locationStatus.textContent = "Could not get your location. Map will still work, but not centered on you.";
    },
    {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 30000
    }
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

  // Toggle active class
  [...filterRow.querySelectorAll(".pill")].forEach((el) => {
    el.classList.toggle("active", el === btn);
  });

  currentFilter = type;
  activeFilterLabel.textContent = FILTER_QUERIES[type];

  updateMapEmbed();
});

// ===============================
// MAP EMBED BUILDER
// ===============================
function updateMapEmbed() {
  if (!currentFilter) {
    mapFrame.src = "https://www.google.com/maps/embed?pb=";
    openInMaps.href = "https://www.google.com/maps";
    return;
  }

  const queryBase = FILTER_QUERIES[currentFilter];

  let q;
  if (userLat != null && userLng != null) {
    // Search near user coordinates
    q = `${queryBase} near ${userLat},${userLng}`;
  } else {
    // Fallback: generic search (still works, just not centered on user)
    q = `${queryBase} near me`;
  }

  const encoded = encodeURIComponent(q);

  // Embed URL
  const embedSrc = `https://www.google.com/maps/embed?pb=&q=${encoded}&z=13`;
  mapFrame.src = embedSrc;

  // External URL
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  openInMaps.href = externalUrl;

  hintText.textContent = "Use the map to pick a store, or use the buttons for directions.";
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
  if (!currentFilter) {
    alert("Select a supply filter first.");
    return;
  }
  if (userLat == null || userLng == null) {
    alert("Your location is not available yet.");
    return;
  }

  const origin = `${userLat},${userLng}`;
  const queryBase = FILTER_QUERIES[currentFilter];
  const url = buildDirectionsUrl(origin, queryBase);
  window.open(url, "_blank", "noopener");
});

// Directions: Client → Supply
directionsFromClientBtn.addEventListener("click", () => {
  if (!currentFilter) {
    alert("Select a supply filter first.");
    return;
  }
  const clientAddress = clientAddressInput.value.trim();
  if (!clientAddress) {
    alert("Enter a client address first.");
    return;
  }

  const queryBase = FILTER_QUERIES[currentFilter];
  const url = buildDirectionsUrl(clientAddress, queryBase);
  window.open(url, "_blank", "noopener");
});

// ===============================
// INIT
// ===============================
initLocation();
updateMapEmbed();
