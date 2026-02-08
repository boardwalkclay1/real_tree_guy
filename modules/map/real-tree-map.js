// ===============================
// REAL TREE MAP (NO LEAFLET, NO API KEYS)
// ===============================

// Add or remove locations here.
// This is the ONLY place you edit data.
const locations = [
  {
    id: "yard-oak",
    label: "Client Yard – Live Oak",
    lat: 30.675,
    lng: -81.6,
    address: "Yulee, FL",
    notes: "Leaning toward house, estimate removal."
  },
  {
    id: "street-pine",
    label: "Street Side – Pine",
    lat: 30.67,
    lng: -81.58,
    address: "Near SR-200",
    notes: "Check for dieback and top weight."
  },
  {
    id: "backlot-mixed",
    label: "Back Lot – Mixed Stand",
    lat: 30.68,
    lng: -81.62,
    address: "Wooded lot",
    notes: "Multiple stems, wind exposure."
  }
];

// DOM elements
const mapList = document.getElementById("mapList");
const mapFrame = document.getElementById("mapFrame");
const selectedLabel = document.getElementById("selectedLabel");
const openInMaps = document.getElementById("openInMaps");

let activeId = null;

// Build the left-side list
function buildList() {
  mapList.innerHTML = "";

  locations.forEach((loc) => {
    const div = document.createElement("div");
    div.className = "map-item";
    div.dataset.id = loc.id;

    div.innerHTML = `
      <div class="map-item-title">${loc.label}</div>
      <div class="map-item-meta">${loc.address}</div>
      <div class="map-item-meta">${loc.notes}</div>
    `;

    div.onclick = () => selectLocation(loc.id);

    mapList.appendChild(div);
  });
}

// Select a location and update the map
function selectLocation(id) {
  const loc = locations.find((l) => l.id === id);
  if (!loc) return;

  activeId = id;

  // Highlight active item
  [...mapList.querySelectorAll(".map-item")].forEach((el) => {
    el.classList.toggle("active", el.dataset.id === id);
  });

  // Build Google Maps embed URL
  const q = encodeURIComponent(`${loc.lat},${loc.lng}`);
  const embedSrc = `https://www.google.com/maps?q=${q}&z=18&output=embed`;
  mapFrame.src = embedSrc;

  // External link (opens full Google Maps)
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;
  openInMaps.href = externalUrl;

  selectedLabel.textContent = loc.label;
}

// Initialize
buildList();

// Auto-select first location
if (locations.length > 0) {
  selectLocation(locations[0].id);
}
