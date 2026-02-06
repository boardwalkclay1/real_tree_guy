// ====== CONFIG ======
const PJ_STORAGE_KEY = "realTreeMapPJs";

// Single, stable Overpass endpoint
const OVERPASS_URL = "https://overpass-api.de/api/interpreter?data=";

const OVERPASS_RADIUS = 15000;
const OVERPASS_RETRIES = 2;
const OVERPASS_TIMEOUT_MS = 4000;

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
  if (statusEl) statusEl.textContent = msg || "";
}

function gDir(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function gSV(lat, lng) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
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
      icon: L.divIcon({ html: "📍" })
    }).bindPopup(html).addTo(layerPJs);
  });
}
rebuildPJs();

// ====== OVERPASS (TIMEOUT + RETRIES, SINGLE ENDPOINT) ======
async function fetchOverpass(query) {
  let lastError = null;

  for (let attempt = 0; attempt < OVERPASS_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);

    try {
      const res = await fetch(OVERPASS_URL + encodeURIComponent(query), {
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (e) {
      clearTimeout(timeout);
      lastError = e;
      await sleep(500 * (attempt + 1));
    }
  }

  throw lastError || new Error("Overpass failed");
}

// ====== STORE QUERIES ======
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
  if (!filterHomeDepot.checked &&
      !filterLowes.checked &&
      !filterArborist.checked) {
    setStatus("");
    return;
  }

  setStatus("Loading stores…");

  layerHD.clearLayers();
  layerLowes.clearLayers();
  layerArbor.clearLayers();

  try {
    if (filterHomeDepot.checked) {
      const hd = await fetchOverpass(qHomeDepot(lat, lng));
      if (hd.elements && hd.elements.length) {
        hd.elements.forEach(el => {
          if (!el.lat || !el.lon) return;
          L.marker([el.lat, el.lon], {
            icon: L.divIcon({ html: "🧱" })
          }).bindPopup(
            `<strong>Home Depot</strong><br><button onclick="window.open('${gDir(el.lat,el.lon)}')">Directions</button>`
          ).addTo(layerHD);
        });
      }
    }

    if (filterLowes.checked) {
      const lw = await fetchOverpass(qLowes(lat, lng));
      if (lw.elements && lw.elements.length) {
        lw.elements.forEach(el => {
          if (!el.lat || !el.lon) return;
          L.marker([el.lat, el.lon], {
            icon: L.divIcon({ html: "🔩" })
          }).bindPopup(
            `<strong>Lowe's</strong><br><button onclick="window.open('${gDir(el.lat,el.lon)}')">Directions</button>`
          ).addTo(layerLowes);
        });
      }
    }

    if (filterArborist.checked) {
      const arb = await fetchOverpass(qArborist(lat, lng));
      if (arb.elements && arb.elements.length) {
        arb.elements.forEach(el => {
          if (!el.lat || !el.lon) return;
          L.marker([el.lat, el.lon], {
            icon: L.divIcon({ html: "🪚" })
          }).bindPopup(
            `<strong>Arborist / Tools</strong><br><button onclick="window.open('${gDir(el.lat,el.lon)}')">Directions</button>`
          ).addTo(layerArbor);
        });
      }
    }

    // Attach layers only if they have content
    if (layerHD.getLayers().length) map.addLayer(layerHD);
    if (layerLowes.getLayers().length) map.addLayer(layerLowes);
    if (layerArbor.getLayers().length) map.addLayer(layerArbor);

    setStatus("");
  } catch (e) {
    console.error("Overpass failed:", e);
    setStatus("Overpass busy or offline — try again.");
  }
}

// ====== FILTERS ======
async function applyFilters() {
  // PJs
  if (filterPJs.checked) {
    map.addLayer(layerPJs);
  } else {
    map.removeLayer(layerPJs);
  }

  // Stores
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

pjCancel.onclick = () => {
  pjForm.style.display = "none";
  pendingCoords = null;
};

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
  pendingCoords = null;
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
  if (!res.ok) {
    setStatus("Search failed.");
    return;
  }
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
    icon: L.divIcon({ html: "📌" })
  }).bindPopup(
    `<strong>${best.display_name}</strong><br><button onclick="window.open('${gDir(lat,lng)}')">Directions</button>`
  ).addTo(map).openPopup();

  setStatus("");
}

// ====== USE MY LOCATION ======
btnLocate.onclick = () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }
  setStatus("Locating…");

  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    map.setView([lat, lng], 12);
    await loadStores(lat, lng);
    setStatus("");
  }, err => {
    console.error("Geolocation error:", err);
    setStatus("");
    alert("Could not get your location.");
  });
};
