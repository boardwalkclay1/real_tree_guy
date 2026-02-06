// ====== CONFIG ======
const PJ_STORAGE_KEY = "realTreeMapPJs";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter?data=",
  "https://overpass.kumi.systems/api/interpreter?data=",
  "https://overpass.nchc.org.tw/api/interpreter?data="
];

const OVERPASS_RADIUS = 15000;
const OVERPASS_RETRIES = 4;
const OVERPASS_BACKOFF = 1000;

// ====== STATE ======
let potentialJobs = loadPJs();
let searchMarker = null;
let endpointIndex = 0;

// ====== MAP ======
const map = L.map("map").setView([33.75, -84.25], 11);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  maxZoom: 19
}).addTo(map);

const layerPJs = L.layerGroup().addTo(map);
const layerHD = L.layerGroup().addTo(map);
const layerLowes = L.layerGroup().addTo(map);
const layerArbor = L.layerGroup().addTo(map);

const statusEl = document.getElementById("mapStatus");

// ====== STORAGE ======
function loadPJs() {
  try {
    return JSON.parse(localStorage.getItem(PJ_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function savePJs() {
  localStorage.setItem(PJ_STORAGE_KEY, JSON.stringify(potentialJobs));
}

// ====== HELPERS ======
function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function gDir(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function gSV(lat, lng) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}

// ====== PJ LAYER ======
function rebuildPJs() {
  layerPJs.clearLayers();
  potentialJobs.forEach(pj => {
    const html = `
      <strong>${pj.nickname}</strong><br>
      ${pj.notes}<br><br>
      <button onclick="window.open('${gDir(pj.lat,pj.lng)}')">Directions</button>
      <button onclick="window.open('${gSV(pj.lat,pj.lng)}')">Street View</button>
    `;
    L.marker([pj.lat, pj.lng], {
      icon: L.divIcon({ html:"📍", className:"pj-marker" })
    }).bindPopup(html).addTo(layerPJs);
  });
}
rebuildPJs();

// ====== OVERPASS ======
async function fetchOverpassRaw(query) {
  const url = OVERPASS_ENDPOINTS[endpointIndex] + encodeURIComponent(query);
  endpointIndex = (endpointIndex + 1) % OVERPASS_ENDPOINTS.length;

  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

async function fetchOverpass(query) {
  let err;
  for (let i = 0; i < OVERPASS_RETRIES; i++) {
    try {
      return await fetchOverpassRaw(query);
    } catch (e) {
      err = e;
      await sleep(OVERPASS_BACKOFF * (i + 1));
    }
  }
  throw err;
}

// ====== STORE QUERIES (FIXED) ======
function qHomeDepot(lat, lng) {
  return `
    [out:json];
    (
      node["name"~"Home Depot",i](around:${OVERPASS_RADIUS},${lat},${lng});
      node["brand"~"Home Depot",i](around:${OVERPASS_RADIUS},${lat},${lng});
      node["operator"~"Home Depot",i](around:${OVERPASS_RADIUS},${lat},${lng});
      node["shop"="doityourself"](around:${OVERPASS_RADIUS},${lat},${lng});
    );
    out;
  `;
}

function qLowes(lat, lng) {
  return `
    [out:json];
    (
      node["name"~"Lowe",i](around:${OVERPASS_RADIUS},${lat},${lng});
      node["brand"~"Lowe",i](around:${OVERPASS_RADIUS},${lat},${lng});
      node["operator"~"Lowe",i](around:${OVERPASS_RADIUS},${lat},${lng});
      node["shop"="hardware"](around:${OVERPASS_RADIUS},${lat},${lng});
    );
    out;
  `;
}

function qArborist(lat, lng) {
  return `
    [out:json];
    (
      node["shop"="forestry"](around:${OVERPASS_RADIUS},${lat},${lng});
      node["shop"="hardware"](around:${OVERPASS_RADIUS},${lat},${lng});
      node["shop"="tools"](around:${OVERPASS_RADIUS},${lat},${lng});
      node["shop"="agrarian"](around:${OVERPASS_RADIUS},${lat},${lng});
    );
    out;
  `;
}

// ====== LOAD STORES ======
async function loadStores(lat, lng) {
  setStatus("Loading stores…");

  layerHD.clearLayers();
  layerLowes.clearLayers();
  layerArbor.clearLayers();

  try {
    const hd = await fetchOverpass(qHomeDepot(lat, lng));
    await sleep(300);
    const lw = await fetchOverpass(qLowes(lat, lng));
    await sleep(300);
    const arb = await fetchOverpass(qArborist(lat, lng));

    hd.elements?.forEach(el => {
      if (!el.lat) return;
      L.marker([el.lat, el.lon], {
        icon: L.divIcon({ html:"🧱", className:"hd-marker" })
      }).bindPopup(`<strong>Home Depot</strong><br><button onclick="window.open('${gDir(el.lat,el.lon)}')">Directions</button>`).addTo(layerHD);
    });

    lw.elements?.forEach(el => {
      if (!el.lat) return;
      L.marker([el.lat, el.lon], {
        icon: L.divIcon({ html:"🔩", className:"lowes-marker" })
      }).bindPopup(`<strong>Lowe's</strong><br><button onclick="window.open('${gDir(el.lat,el.lon)}')">Directions</button>`).addTo(layerLowes);
    });

    arb.elements?.forEach(el => {
      if (!el.lat) return;
      L.marker([el.lat, el.lon], {
        icon: L.divIcon({ html:"🪚", className:"arb-marker" })
      }).bindPopup(`<strong>Arborist / Tools</strong><br><button onclick="window.open('${gDir(el.lat,el.lon)}')">Directions</button>`).addTo(layerArbor);
    });

    setStatus("");
  } catch (e) {
    console.error(e);
    setStatus("Overpass busy — try again.");
  }
}

loadStores(33.75, -84.25);

// ====== FILTERS ======
function applyFilters() {
  filterPJs.checked ? map.addLayer(layerPJs) : map.removeLayer(layerPJs);
  filterHomeDepot.checked ? map.addLayer(layerHD) : map.removeLayer(layerHD);
  filterLowes.checked ? map.addLayer(layerLowes) : map.removeLayer(layerLowes);
  filterArborist.checked ? map.addLayer(layerArbor) : map.removeLayer(layerArbor);
}

document.getElementById("btnAllOn").onclick = () => {
  filterPJs.checked = filterHomeDepot.checked = filterLowes.checked = filterArborist.checked = true;
  applyFilters();
};

document.getElementById("btnAllOff").onclick = () => {
  filterPJs.checked = filterHomeDepot.checked = filterLowes.checked = filterArborist.checked = false;
  applyFilters();
};

applyFilters();

// ====== PJ FORM ======
const pjForm = document.getElementById("pjForm");
let pendingCoords = null;

map.on("click", e => {
  pendingCoords = e.latlng;
  pjCoordsLabel.textContent = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
  pjForm.style.display = "flex";
});

pjCancel.onclick = () => pjForm.style.display = "none";

pjSave.onclick = () => {
  potentialJobs.push({
    id: Date.now(),
    nickname: pjNickname.value || "PJ",
    notes: pjNotes.value || "",
    reminder: pjReminder.value || null,
    lat: pendingCoords.lat,
    lng: pendingCoords.lng
  });
  savePJs();
  rebuildPJs();
  pjForm.style.display = "none";
};

// ====== SEARCH ======
btnSearch.onclick = () => search(searchInput.value);

searchInput.onkeydown = e => {
  if (e.key === "Enter") {
    e.preventDefault();
    search(searchInput.value);
  }
};

async function search(q) {
  if (!q.trim()) return;
  setStatus("Searching…");

  const url = "https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(q);
  const res = await fetch(url);
  const data = await res.json();

  if (!data.length) {
    setStatus("No results.");
    return;
  }

  const best = data[0];
  const lat = +best.lat;
  const lng = +best.lon;

  map.setView([lat, lng], 14);

  if (searchMarker) map.removeLayer(searchMarker);

  searchMarker = L.marker([lat, lng], {
    icon: L.divIcon({ html:"📌", className:"search-marker" })
  }).bindPopup(`<strong>${best.display_name}</strong><br><button onclick="window.open('${gDir(lat,lng)}')">Directions</button>`).addTo(map).openPopup();

  setStatus("");
}

// ====== USE MY LOCATION ======
btnLocate.onclick = () => {
  if (!navigator.geolocation) return alert("Not supported.");
  setStatus("Locating…");

  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    map.setView([lat, lng], 12);
    await loadStores(lat, lng);
    setStatus("");
  });
};
