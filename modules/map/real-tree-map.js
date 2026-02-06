// ====== CONFIG ======
const PJ_STORAGE_KEY = "realTreeMapPJs";
const SEARCH_RADIUS_METERS = 15000;
const OVERPASS_URL = "https://overpass.kumi.systems/api/interpreter";

// ====== STATE ======
let potentialJobs = loadPJs();
let searchMarker = null;
let pendingCoords = null;

// ====== MAP ======
const map = L.map("map").setView([33.75, -84.25], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// LAYERS
const layerPJs = L.layerGroup().addTo(map);
const layerHD = L.layerGroup();
const layerLowes = L.layerGroup();
const layerArbor = L.layerGroup();

// UI ELEMENTS
const statusEl = document.getElementById("mapStatus");
const filterPJs = document.getElementById("filterPJs");
const filterHomeDepot = document.getElementById("filterHomeDepot");
const filterLowes = document.getElementById("filterLowes");
const filterArborist = document.getElementById("filterArborist");
const btnAllOn = document.getElementById("btnAllOn");
const btnAllOff = document.getElementById("btnAllOff");

const pjForm = document.getElementById("pjForm");
const pjCoordsLabel = document.getElementById("pjCoordsLabel");
const pjNickname = document.getElementById("pjNickname");
const pjNotes = document.getElementById("pjNotes");
const pjReminder = document.getElementById("pjReminder");
const pjSave = document.getElementById("pjSave");
const pjCancel = document.getElementById("pjCancel");

const searchInput = document.getElementById("searchInput");
const btnSearch = document.getElementById("btnSearch");
const btnLocate = document.getElementById("btnLocate");

// ====== STORAGE ======
function loadPJs() {
  try { return JSON.parse(localStorage.getItem(PJ_STORAGE_KEY)) || []; }
  catch { return []; }
}

function savePJs() {
  localStorage.setItem(PJ_STORAGE_KEY, JSON.stringify(potentialJobs));
}

// ====== HELPERS ======
function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg || "";
}

function gDir(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function gSV(lat, lng) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}

// Escape quotes in query for Overpass regex
function escapeOverpass(str) {
  return String(str).replace(/"/g, '\\"');
}

// ====== PJ LAYER ======
function rebuildPJs() {
  layerPJs.clearLayers();
  potentialJobs.forEach(pj => {
    const html = `
      <strong>${pj.nickname}</strong><br>
      ${pj.notes || ""}<br><br>
      <button onclick="window.open('${gDir(pj.lat,pj.lng)}')">Directions</button>
      <button onclick="window.open('${gSV(pj.lat,pj.lng)}')">Street View</button>
    `;
    L.marker([pj.lat, pj.lng], {
      icon: L.divIcon({ html:"📍" })
    }).bindPopup(html).addTo(layerPJs);
  });
}
rebuildPJs();

// ====== OVERPASS SEARCH (HARDENED) ======
async function overpassSearch(query, lat, lng) {
  const safeQuery = escapeOverpass(query);
  const q = `
    [out:json];
    (
      node["name"~"${safeQuery}", i](around:${SEARCH_RADIUS_METERS}, ${lat}, ${lng});
      node["brand"~"${safeQuery}", i](around:${SEARCH_RADIUS_METERS}, ${lat}, ${lng});
      node["shop"~"${safeQuery}", i](around:${SEARCH_RADIUS_METERS}, ${lat}, ${lng});
      node["amenity"~"${safeQuery}", i](around:${SEARCH_RADIUS_METERS}, ${lat}, ${lng});
    );
    out center;
  `;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      body: q,
      headers: { "Content-Type": "text/plain" }
    });

    if (!res.ok) {
      console.warn("Overpass not OK:", res.status);
      return [];
    }

    const data = await res.json();
    if (!data.elements) return [];

    return data.elements
      .map(e => ({
        lat: e.lat || (e.center && e.center.lat),
        lon: e.lon || (e.center && e.center.lon),
        name: (e.tags && e.tags.name) || query
      }))
      .filter(r => r.lat && r.lon);
  } catch (err) {
    console.error("Overpass error:", err);
    return [];
  }
}

// ====== LOAD STORES ======
async function loadStores(lat, lng) {
  setStatus("Loading stores…");

  layerHD.clearLayers();
  layerLowes.clearLayers();
  layerArbor.clearLayers();

  try {
    if (filterHomeDepot && filterHomeDepot.checked) {
      const hd = await overpassSearch("Home Depot", lat, lng);
      hd.forEach(r => {
        L.marker([r.lat, r.lon], {
          icon: L.divIcon({ html:"🧱" })
        }).bindPopup(
          `<strong>${r.name}</strong><br><br>` +
          `<button onclick="window.open('${gDir(r.lat,r.lon)}')">Directions</button>`
        ).addTo(layerHD);
      });
    }

    if (filterLowes && filterLowes.checked) {
      const lw = await overpassSearch("Lowe", lat, lng);
      lw.forEach(r => {
        L.marker([r.lat, r.lon], {
          icon: L.divIcon({ html:"🔩" })
        }).bindPopup(
          `<strong>${r.name}</strong><br><br>` +
          `<button onclick="window.open('${gDir(r.lat,r.lon)}')">Directions</button>`
        ).addTo(layerLowes);
      });
    }

    if (filterArborist && filterArborist.checked) {
      const arb = await overpassSearch("hardware", lat, lng);
      const arb2 = await overpassSearch("tool", lat, lng);
      const arb3 = await overpassSearch("chainsaw", lat, lng);

      [...arb, ...arb2, ...arb3].forEach(r => {
        L.marker([r.lat, r.lon], {
          icon: L.divIcon({ html:"🪚" })
        }).bindPopup(
          `<strong>${r.name}</strong><br><br>` +
          `<button onclick="window.open('${gDir(r.lat,r.lon)}')">Directions</button>`
        ).addTo(layerArbor);
      });
    }

    if (layerHD.getLayers().length) map.addLayer(layerHD);
    if (layerLowes.getLayers().length) map.addLayer(layerLowes);
    if (layerArbor.getLayers().length) map.addLayer(layerArbor);

    setStatus("");
  } catch (e) {
    console.error(e);
    setStatus("Store search failed.");
  }
}

// ====== FILTERS ======
async function applyFilters() {
  if (filterPJs && filterPJs.checked) map.addLayer(layerPJs);
  else map.removeLayer(layerPJs);

  if ((filterHomeDepot && filterHomeDepot.checked) ||
      (filterLowes && filterLowes.checked) ||
      (filterArborist && filterArborist.checked)) {
    const c = map.getCenter();
    await loadStores(c.lat, c.lng);
  } else {
    map.removeLayer(layerHD);
    map.removeLayer(layerLowes);
    map.removeLayer(layerArbor);
    setStatus("");
  }
}

if (filterPJs) filterPJs.onchange = applyFilters;
if (filterHomeDepot) filterHomeDepot.onchange = applyFilters;
if (filterLowes) filterLowes.onchange = applyFilters;
if (filterArborist) filterArborist.onchange = applyFilters;

if (btnAllOn) btnAllOn.onclick = () => {
  if (filterPJs) filterPJs.checked = true;
  if (filterHomeDepot) filterHomeDepot.checked = true;
  if (filterLowes) filterLowes.checked = true;
  if (filterArborist) filterArborist.checked = true;
  applyFilters();
};

if (btnAllOff) btnAllOff.onclick = () => {
  if (filterPJs) filterPJs.checked = false;
  if (filterHomeDepot) filterHomeDepot.checked = false;
  if (filterLowes) filterLowes.checked = false;
  if (filterArborist) filterArborist.checked = false;
  applyFilters();
};

// ====== PJ FORM ======
map.on("click", e => {
  if (!pjForm || !pjCoordsLabel) return;
  pendingCoords = e.latlng;
  pjCoordsLabel.textContent = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
  pjForm.style.display = "flex";
});

if (pjCancel) pjCancel.onclick = () => {
  if (pjForm) pjForm.style.display = "none";
};

if (pjSave) pjSave.onclick = () => {
  if (!pendingCoords) return;
  potentialJobs.push({
    id: Date.now(),
    nickname: (pjNickname && pjNickname.value) || "PJ",
    notes: (pjNotes && pjNotes.value) || "",
    reminder: (pjReminder && pjReminder.value) || null,
    lat: pendingCoords.lat,
    lng: pendingCoords.lng
  });
  savePJs();
  rebuildPJs();
  if (pjForm) pjForm.style.display = "none";
};

// ====== SEARCH (OVERPASS) ======
async function search(q) {
  if (!q || !q.trim()) return;
  setStatus("Searching…");

  const center = map.getCenter();
  const results = await overpassSearch(q, center.lat, center.lng);

  if (!results.length) {
    setStatus("No results.");
    return;
  }

  const best = results[0];
  const lat = best.lat;
  const lng = best.lon;

  map.setView([lat, lng], 14);

  if (searchMarker) map.removeLayer(searchMarker);

  searchMarker = L.marker([lat, lng], {
    icon: L.divIcon({ html:"📌" })
  }).bindPopup(
    `<strong>${best.name}</strong><br><button onclick="window.open('${gDir(lat,lng)}')">Directions</button>`
  ).addTo(map).openPopup();

  setStatus("");
}

if (btnSearch) btnSearch.onclick = () => search(searchInput && searchInput.value || "");

if (searchInput) {
  searchInput.onkeydown = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      search(searchInput.value);
    }
  };
}

// ====== USE MY LOCATION ======
if (btnLocate) btnLocate.onclick = () => {
  if (!navigator.geolocation) return alert("Geolocation not supported.");
  setStatus("Locating…");

  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    map.setView([lat, lng], 12);
    await loadStores(lat, lng);
    setStatus("");
  }, err => {
    console.error(err);
    setStatus("");
    alert("Could not get your location.");
  });
};
