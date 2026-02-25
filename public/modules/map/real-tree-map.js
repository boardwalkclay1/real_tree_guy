// ===============================
// REAL TREE MAP – FINAL VERSION
// Public Google Embed + Fresh GPS Every Time
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

// Search phrases (MUST match HTML data-type)
const FILTER_QUERIES = {
  "home depot": "Home Depot",
  "lowes": "Lowe's",
  "ace hardware": "Ace Hardware",
  "chainsaw repair": "chainsaw repair shop",
  "woodworking store": "woodworking supply store",
  "wood dump": "wood dump site",
  "sawmill": "sawmill",
  "gas station": "gas station"
};

// ===============================
// ALWAYS GET FRESH GPS
// ===============================
function getLocation(callback) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;

      locationStatus.textContent = `Location: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;

      callback(userLat, userLng);
    },
    () => {
      locationStatus.textContent = "Location denied. Showing general map.";
      mapFrame.src = "https://www.google.com/maps?q=tree+service+supplies&output=embed";
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
  );
}

// ===============================
// INITIAL MAP LOAD
// ===============================
getLocation((lat, lng) => {
  mapFrame.src = `https://www.google.com/maps?q=${lat},${lng}&z=13&output=embed`;
});

// ===============================
// FILTER HANDLING
// ===============================
document.querySelectorAll(".pill").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    const queryBase = FILTER_QUERIES[type];
    if (!queryBase) return;

    activeFilterLabel.textContent = queryBase;

    // ALWAYS get fresh GPS before updating map
    getLocation((lat, lng) => {
      const encoded = encodeURIComponent(`${queryBase} near ${lat},${lng}`);
      mapFrame.src = `https://www.google.com/maps?q=${encoded}&z=13&output=embed`;
      openInMaps.href = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
    });
  });
});

// ===============================
// DIRECTIONS: ME → SUPPLY
// ===============================
directionsFromUserBtn.addEventListener("click", () => {
  const type = activeFilterLabel.textContent;
  if (type === "None") return alert("Select a supply filter first.");

  getLocation((lat, lng) => {
    window.open(`https://www.google.com/maps/dir/${lat},${lng}/${type}`, "_blank");
  });
});

// ===============================
// DIRECTIONS: CLIENT → SUPPLY
// ===============================
directionsFromClientBtn.addEventListener("click", () => {
  const client = clientAddressInput.value.trim();
  if (!client) return alert("Enter a client address first.");

  const type = activeFilterLabel.textContent;
  if (type === "None") return alert("Select a supply filter first.");

  window.open(`https://www.google.com/maps/dir/${client}/${type}`, "_blank");
});
