// --- Static supply data (replace/extend as needed) ---
const homeDepotSpots = [
  { name: "Home Depot 1", lat: 33.77, lng: -84.23 },
];

const lowesSpots = [
  { name: "Lowe's 1", lat: 33.74, lng: -84.26 },
];

const arboristShops = [
  { name: "Chainsaw Pro Shop", lat: 33.73, lng: -84.22 },
];

// --- PJ storage (localStorage-backed) ---
const PJ_STORAGE_KEY = "relTreeMapPJs";
let potentialJobs = loadPJsFromStorage();

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

// --- Map init ---
const map = L.map('map', {
  zoomControl: true,
  scrollWheelZoom: true
}).setView([33.75, -84.25], 12);

// Light CartoDB (Positron)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap &copy; CARTO'
}).addTo(map);

// --- Layer groups ---
const layerPJs = L.layerGroup().addTo(map);
const layerHomeDepot = L.layerGroup().addTo(map);
const layerLowes = L.layerGroup().addTo(map);
const layerArborist = L.layerGroup().addTo(map);

// --- Helpers: directions + street view links ---
function googleDirectionsLink(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

function googleStreetViewLink(lat, lng) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}

// --- ICS calendar file generator ---
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

  // 1-hour default duration
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
    "PRODID:-//Rel Tree Map//EN",
    "BEGIN:VEVENT",
    `UID:${pj.id}@reltreemap`,
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

// --- Build layers ---
function rebuildPJsLayer() {
  layerPJs.clearLayers();
  potentialJobs.forEach(pj => {
    const popupHtml = `
      <strong>PJ: ${pj.nickname || "Untitled"}</strong><br>
      ${pj.notes ? (pj.notes + "<br>") : ""}<br>
      <button onclick="window.open('${googleDirectionsLink(pj.lat, pj.lng)}','_blank')">Directions</button>
      <button onclick="window.open('${googleStreetViewLink(pj.lat, pj.lng)}','_blank')">Street View</button>
      <button onclick="window.relTreeMapCalendar('${pj.id}')">Add to Calendar</button>
    `;
    L.marker([pj.lat, pj.lng], {
      icon: L.divIcon({ html: "📍", className: "pj-marker" })
    }).bindPopup(popupHtml).addTo(layerPJs);
  });
}

function buildSupplyLayers() {
  layerHomeDepot.clearLayers();
  homeDepotSpots.forEach(hd => {
    const popupHtml = `
      <strong>Home Depot</strong><br>${hd.name}<br><br>
      <button onclick="window.open('${googleDirectionsLink(hd.lat, hd.lng)}','_blank')">Directions</button>
    `;
    L.marker([hd.lat, hd.lng], {
      icon: L.divIcon({ html: "🧱", className: "hd-marker" })
    }).bindPopup(popupHtml).addTo(layerHomeDepot);
  });

  layerLowes.clearLayers();
  lowesSpots.forEach(lw => {
    const popupHtml = `
      <strong>Lowe's</strong><br>${lw.name}<br><br>
      <button onclick="window.open('${googleDirectionsLink(lw.lat, lw.lng)}','_blank')">Directions</button>
    `;
    L.marker([lw.lat, lw.lng], {
      icon: L.divIcon({ html: "🔩", className: "lowes-marker" })
    }).bindPopup(popupHtml).addTo(layerLowes);
  });

  layerArborist.clearLayers();
  arboristShops.forEach(shop => {
    const popupHtml = `
      <strong>Chainsaw / Arborist</strong><br>${shop.name}<br><br>
      <button onclick="window.open('${googleDirectionsLink(shop.lat, shop.lng)}','_blank')">Directions</button>
    `;
    L.marker([shop.lat, shop.lng], {
      icon: L.divIcon({ html: "🪚", className: "arb-marker" })
    }).bindPopup(popupHtml).addTo(layerArborist);
  });
}

rebuildPJsLayer();
buildSupplyLayers();

// Expose calendar hook for popup button
window.relTreeMapCalendar = function (pjId) {
  const pj = potentialJobs.find(p => String(p.id) === String(pjId));
  if (!pj) return;
  createICSForPJ(pj);
};

// --- Filters ---
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

// --- PJ creation UI ---
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
