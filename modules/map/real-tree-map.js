// ====== CONFIG ======
const PJ_STORAGE_KEY = "realTreeMapPJs";

// ====== STATE ======
let potentialJobs = loadPJsFromStorage();
let searchMarker = null;

// ====== MAP INIT ======
const map = L.map('map', {
  zoomControl: true,
  scrollWheelZoom: true
}).setView([33.75, -84.25], 11); // default Atlanta-ish

// CartoDB Light (Positron)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap &copy; CARTO'
}).addTo(map);

// Layer groups
const layerPJs = L.layerGroup().addTo(map);
const layerHomeDepot = L.layerGroup().addTo(map);
const layerLowes = L.layerGroup().addTo(map);
const layerArborist = L.layerGroup().addTo(map);

// ====== STORAGE HELPERS ======
function loadPJsFromStorage() {
  try {
    const raw = localStorage.getItem(PJ_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to load PJs:", e);
    return [];
  }
}

function savePJsToStorage() {
  localStorage.setItem(PJ_STORAGE_KEY, JSON.stringify(potentialJobs));
}

// ====== LINK HELPERS ======
function googleDirectionsLink(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

function googleStreetViewLink(lat, lng) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}

// ====== ICS CALENDAR ======
function createICSForPJ(pj) {
  if (!pj.reminder) {
    alert("No reminder date set for this PJ.");
    return;
  }

  const dt = new Date(pj.reminder);
  if (isNaN(dt.getTime())) {
    alert("Invalid reminder date.");
    return;
  }

  const pad = n => String(n).padStart(2, "0");
  const y = dt.getUTCFullYear();
  const m = pad(dt.getUTCMonth() + 1);
  const d = pad(dt.getUTCDate());
  const hh = pad(dt.getUTCHours());
  const mm = pad(dt.getUTCMinutes());
  const ss = "00";
  const dtStart = `${y}${m}${d}T${hh}${mm}${ss}Z`;

  const dtEndObj = new Date(dt.getTime() + 60 * 60 * 1000);
  const y2 = dtEndObj.getUTCFullYear();
  const m2 = pad(dtEndObj.getUTCMonth() + 1);
  const d2 = pad(dtEndObj.getUTCDate());
  const hh2 = pad(dtEndObj.getUTCHours());
  const mm2 = pad(dtEndObj.getUTCMinutes());
  const dtEnd = `${y2}${m2}${d2}T${hh2}${mm2}${ss}Z`;

  const summary = `PJ: ${pj.nickname || "Tree Job"}`;
  const description = (pj.notes || "").replace(/\r?\n/g, "\\n");
  const location = `${pj.lat}, ${pj.lng}`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Real Tree Map//EN",
    "BEGIN:VEVENT",
    `UID:${pj.id}@realtreemap`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${summary.replace(/\s+/g, "_")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Expose for popup buttons
window.realTreeMapCalendar = function (pjId) {
  const pj = potentialJobs.find(p => String(p.id) === String(pjId));
  if (!pj) return;
  createICSForPJ(pj);
};

// ====== PJs LAYER ======
function rebuildPJsLayer() {
  layerPJs.clearLayers();
  potentialJobs.forEach(pj => {
    const popupHtml = `
      <strong>PJ: ${pj.nickname || "Untitled"}</strong><br>
      ${pj.notes ? (pj.notes + "<br>") : ""}<br>
      ${pj.reminder ? ("Reminder: " + pj.reminder + "<br><br>") : "<br>"}
      <button onclick="window.open('${googleDirectionsLink(pj.lat, pj.lng)}','_blank')">Directions</button>
      <button onclick="window.open('${googleStreetViewLink(pj.lat, pj.lng)}','_blank')">Street View</button>
      <button onclick="window.realTreeMapCalendar('${pj.id}')">Add to Calendar</button>
    `;
    L.marker([pj.lat, pj.lng], {
      icon: L.divIcon({ html: "📍", className: "pj-marker" })
    }).bindPopup(popupHtml).addTo(layerPJs);
  });
}

rebuildPJsLayer();

// ====== OVERPASS (REAL STORES) ======
async function fetchOverpass(query) {
  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Overpass error");
  return res.json();
}

async function loadStoresAround(lat, lng) {
  layerHomeDepot.clearLayers();
  layerLowes.clearLayers();
  layerArborist.clearLayers();

  const radius = 15000; // 15km

  const qHomeDepot = `
    [out:json];
    node["brand"="The Home Depot"](around:${radius},${lat},${lng});
    out;
  `;
  const qLowes = `
    [out:json];
    node["brand"="Lowe's"](around:${radius},${lat},${lng});
    out;
  `;
  const qArborist = `
    [out:json];
    (
      node["shop"="forestry"](around:${radius},${lat},${lng});
      node["shop"="hardware"](around:${radius},${lat},${lng});
      node["shop"="tools"](around:${radius},${lat},${lng});
      node["shop"="agrarian"](around:${radius},${lat},${lng});
    );
    out;
  `;

  try {
    const [hdData, lowesData, arbData] = await Promise.all([
      fetchOverpass(qHomeDepot),
      fetchOverpass(qLowes),
      fetchOverpass(qArborist)
    ]);

    // Home Depot
    (hdData.elements || []).forEach(el => {
      if (!el.lat || !el.lon) return;
      const name = el.tags && (el.tags.name || "Home Depot");
      const popupHtml = `
        <strong>Home Depot</strong><br>${name}<br><br>
        <button onclick="window.open('${googleDirectionsLink(el.lat, el.lon)}','_blank')">Directions</button>
      `;
      L.marker([el.lat, el.lon], {
        icon: L.divIcon({ html: "🧱", className: "hd-marker" })
      }).bindPopup(popupHtml).addTo(layerHomeDepot);
    });

    // Lowe's
    (lowesData.elements || []).forEach(el => {
      if (!el.lat || !el.lon) return;
      const name = el.tags && (el.tags.name || "Lowe's");
      const popupHtml = `
        <strong>Lowe's</strong><br>${name}<br><br>
        <button onclick="window.open('${googleDirectionsLink(el.lat, el.lon)}','_blank')">Directions</button>
      `;
      L.marker([el.lat, el.lon], {
        icon: L.divIcon({ html: "🔩", className: "lowes-marker" })
      }).bindPopup(popupHtml).addTo(layerLowes);
    });

    // Arborist / hardware / tools / agrarian
    (arbData.elements || []).forEach(el => {
      if (!el.lat || !el.lon) return;
      const name = el.tags && (el.tags.name || "Tree / Tool Shop");
      const popupHtml = `
        <strong>Chainsaw / Arborist / Tools</strong><br>${name}<br><br>
        <button onclick="window.open('${googleDirectionsLink(el.lat, el.lon)}','_blank')">Directions</button>
      `;
      L.marker([el.lat, el.lon], {
        icon: L.divIcon({ html: "🪚", className: "arb-marker" })
      }).bindPopup(popupHtml).addTo(layerArborist);
    });

  } catch (e) {
    console.error("Error loading stores:", e);
  }
}

// Initial store load (default center)
loadStoresAround(33.75, -84.25);

// ====== FILTERS ======
const chkPJs = document.getElementById('filterPJs');
const chkHomeDepot = document.getElementById('filterHomeDepot');
const chkLowes = document.getElementById('filterLowes');
const chkArborist = document.getElementById('filterArborist');

function applyFilters() {
  chkPJs.checked ? map.addLayer(layerPJs) : map.removeLayer(layerPJs);
  chkHomeDepot.checked ? map.addLayer(layerHomeDepot) : map.removeLayer(layerHomeDepot);
  chkLowes.checked ? map.addLayer(layerLowes) : map.removeLayer(layerLowes);
  chkArborist.checked ? map.addLayer(layerArborist) : map.removeLayer(layerArborist);
}

[chkPJs, chkHomeDepot, chkLowes, chkArborist].forEach(chk => {
  chk.addEventListener('change', applyFilters);
});

document.getElementById('btnAllOn').addEventListener('click', () => {
  [chkPJs, chkHomeDepot, chkLowes, chkArborist].forEach(c => c.checked = true);
  applyFilters();
});

document.getElementById('btnAllOff').addEventListener('click', () => {
  [chkPJs, chkHomeDepot, chkLowes, chkArborist].forEach(c => c.checked = false);
  applyFilters();
});

applyFilters();

// ====== PJ CREATION UI ======
const pjForm = document.getElementById('pjForm');
const pjCoordsLabel = document.getElementById('pjCoordsLabel');
const pjNicknameInput = document.getElementById('pjNickname');
const pjNotesInput = document.getElementById('pjNotes');
const pjReminderInput = document.getElementById('pjReminder');
const pjCancelBtn = document.getElementById('pjCancel');
const pjSaveBtn = document.getElementById('pjSave');

let pendingPJCoords = null;

function openPJForm(latlng) {
  pendingPJCoords = latlng;
  pjCoordsLabel.textContent = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
  pjNicknameInput.value = "";
  pjNotesInput.value = "";
  pjReminderInput.value = "";
  pjForm.style.display = "flex";
}

function closePJForm() {
  pjForm.style.display = "none";
  pendingPJCoords = null;
}

map.on('click', (e) => {
  openPJForm(e.latlng);
});

pjCancelBtn.addEventListener('click', () => {
  closePJForm();
});

pjSaveBtn.addEventListener('click', () => {
  if (!pendingPJCoords) return;

  const nickname = pjNicknameInput.value.trim() || "PJ";
  const notes = pjNotesInput.value.trim();
  const reminder = pjReminderInput.value ? pjReminderInput.value : null;

  const newPJ = {
    id: Date.now(),
    nickname,
    notes,
    lat: pendingPJCoords.lat,
    lng: pendingPJCoords.lng,
    reminder
  };

  potentialJobs.push(newPJ);
  savePJsToStorage();
  rebuildPJsLayer();
  closePJForm();
});

// ====== USE MY LOCATION ======
const btnLocate = document.getElementById('btnLocate');
btnLocate.addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported in this browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      map.setView([lat, lng], 12);
      loadStoresAround(lat, lng);
    },
    err => {
      console.error(err);
      alert("Could not get your location.");
    }
  );
});

// ====== SEARCH ANY PLACE (Nominatim) ======
const searchInput = document.getElementById('searchInput');
const btnSearch = document.getElementById('btnSearch');

async function searchPlace(query) {
  if (!query.trim()) return;
  const url = "https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(query);
  const res = await fetch(url, {
    headers: { "Accept-Language": "en" }
  });
  if (!res.ok) {
    alert("Search failed.");
    return;
  }
  const results = await res.json();
  if (!results.length) {
    alert("No results found.");
    return;
  }
  const best = results[0];
  const lat = parseFloat(best.lat);
  const lng = parseFloat(best.lon);

  map.setView([lat, lng], 14);

  if (searchMarker) {
    map.removeLayer(searchMarker);
  }
  const popupHtml = `
    <strong>${best.display_name}</strong><br><br>
    <button onclick="window.open('${googleDirectionsLink(lat, lng)}','_blank')">Directions</button>
  `;
  searchMarker = L.marker([lat, lng], {
    icon: L.divIcon({ html: "📌", className: "search-marker" })
  }).bindPopup(popupHtml).addTo(map).openPopup();
}

btnSearch.addEventListener('click', () => {
  searchPlace(searchInput.value);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchPlace(searchInput.value);
  }
});
