// ====== CONFIG ======
const PJ_STORAGE_KEY = "realTreeMapPJs";
const SEARCH_RADIUS_KM = 15;

// ====== STATE ======
let potentialJobs = loadPJs();
let searchMarker = null;

// ====== MAP ======
const map = L.map("map").setView([33.75, -84.25], 11);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  maxZoom: 19
}).addTo(map);

const layerPJs = L.layerGroup().addTo(map);
const layerHD = L.layerGroup();
const layerLowes = L.layerGroup();
const layerArbor = L.layerGroup();

const statusEl = document.getElementById("mapStatus");

// FILTER ELEMENTS
const filterPJs = document.getElementById("filterPJs");
const filterHomeDepot = document.getElementById("filterHomeDepot");
const filterLowes = document.getElementById("filterLowes");
const filterArborist = document.getElementById("filterArborist");
const btnAllOn = document.getElementById("btnAllOn");
const btnAllOff = document.getElementById("btnAllOff");

// PJ FORM ELEMENTS
const pjForm = document.getElementById("pjForm");
const pjCoordsLabel = document.getElementById("pjCoordsLabel");
const pjNickname = document.getElementById("pjNickname");
const pjNotes = document.getElementById("pjNotes");
const pjReminder = document.getElementById("pjReminder");
const pjSave = document.getElementById("pjSave");
const pjCancel = document.getElementById("pjCancel");

// SEARCH + LOCATE
const searchInput = document.getElementById("searchInput");
const btnSearch = document.getElementById("btnSearch");
const btnLocate = document.getElementById("btnLocate");

let pendingCoords = null;

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

// ====== NOMINATIM SEARCH ======
async function searchPOI(query, lat, lng) {
  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `format=json&limit=20&` +
    `q=${encodeURIComponent(query + " near " + lat + "," + lng)}`;

  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) return [];

  return await res.json();
}

// ====== LOAD STORES (NOMINATIM VERSION) ======
async function loadStores(lat, lng) {
  setStatus("Loading stores…");

  layerHD.clearLayers();
  layerLowes.clearLayers();
  layerArbor.clearLayers();

  try {
    // HOME DEPOT
    if (filterHomeDepot.checked) {
      const hd = await searchPOI("Home Depot", lat, lng);
      hd.forEach(r => {
        L.marker([r.lat, r.lon], {
          icon: L.divIcon({ html:"🧱" })
        }).bindPopup(
          `<strong>Home Depot</strong><br>${r.display_name}<br><br>` +
          `<button onclick="window.open('${gDir(r.lat,r.lon)}')">Directions</button>`
        ).addTo(layerHD);
      });
    }

    // LOWE'S
    if (filterLowes.checked) {
      const lw = await searchPOI("Lowe's", lat, lng);
      lw.forEach(r => {
        L.marker([r.lat, r.lon], {
          icon: L.divIcon({ html:"🔩" })
        }).bindPopup(
          `<strong>Lowe's</strong><br>${r.display_name}<br><br>` +
          `<button onclick="window.open('${gDir(r.lat,r.lon)}')">Directions</button>`
        ).addTo(layerLowes);
      });
    }

    // ARBORIST / TOOLS
    if (filterArborist.checked) {
      const arb = await searchPOI("hardware store", lat, lng);
      const arb2 = await searchPOI("tool store", lat, lng);
      const arb3 = await searchPOI("chainsaw", lat, lng);

      [...arb, ...arb2, ...arb3].forEach(r => {
        L.marker([r.lat, r.lon], {
          icon: L.divIcon({ html:"🪚" })
        }).bindPopup(
          `<strong>Tools / Arborist</strong><br>${r.display_name}<br><br>` +
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
    setStatus("Search failed — try again.");
  }
}

// ====== FILTERS ======
async function applyFilters() {
  if (filterPJs.checked) map.addLayer(layerPJs);
  else map.removeLayer(layerPJs);

  if (filterHomeDepot.checked ||
      filterLowes.checked ||
      filterArborist.checked) {
    await loadStores(map.getCenter().lat, map.getCenter().lng);
  } else {
    map.removeLayer(layerHD);
    map.removeLayer(layerLowes);
    map.removeLayer(layerArbor);
    setStatus("");
  }
}

filterPJs.onchange =
filterHomeDepot.onchange =
filterLowes.onchange =
filterArborist.onchange = applyFilters;

btnAllOn.onclick = () => {
  filterPJs.checked =
  filterHomeDepot.checked =
  filterLowes.checked =
  filterArborist.checked = true;
  applyFilters();
};

btnAllOff.onclick = () => {
  filterPJs.checked =
  filterHomeDepot.checked =
  filterLowes.checked =
  filterArborist.checked = false;
  applyFilters();
};

// ====== PJ FORM ======
map.on("click", e => {
  pendingCoords = e.latlng;
  pjCoordsLabel.textContent = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
  pjForm.style.display = "flex";
});

pjCancel.onclick = () => pjForm.style.display = "none";

pjSave.onclick = () => {
  if (!pendingCoords) return;
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
    icon: L.divIcon({ html:"📌" })
  }).bindPopup(
    `<strong>${best.display_name}</strong><br><button onclick="window.open('${gDir(lat,lng)}')">Directions</button>`
  ).addTo(map).openPopup();

  setStatus("");
}

// ====== USE MY LOCATION ======
btnLocate.onclick = () => {
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
