// ===============================
// REAL TREE MAP – PERMISSION ONCE, FRESH GPS ALWAYS
// ===============================

let hasPermission = false;

// Ask for permission ONCE
function requestPermissionOnce() {
  navigator.geolocation.getCurrentPosition(
    () => {
      hasPermission = true;
      centerOnUser();
    },
    () => {
      locationStatus.textContent = "Location denied. Enable it in browser settings.";
    }
  );
}

// Always get fresh GPS, but never trigger popup again
function getFreshLocation(callback) {
  if (!hasPermission) {
    requestPermissionOnce();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      locationStatus.textContent = `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      callback(lat, lng);
    },
    (err) => {
      console.log(err);
      locationStatus.textContent = "Unable to get location.";
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
  );
}

// ===============================
// CENTER MAP ON USER
// ===============================
function centerOnUser() {
  getFreshLocation((lat, lng) => {
    mapFrame.src = `https://www.google.com/maps?q=${lat},${lng}&z=14&output=embed`;
    openInMaps.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  });
}

// ===============================
// FILTER HANDLING
// ===============================
filterRow.addEventListener("click", (e) => {
  const btn = e.target.closest(".pill");
  if (!btn) return;

  const type = btn.dataset.type;
  if (!FILTER_QUERIES[type]) return;

  [...filterRow.querySelectorAll(".pill")].forEach((el) =>
    el.classList.toggle("active", el === btn)
  );

  currentFilter = type;
  activeFilterLabel.textContent = FILTER_QUERIES[type];

  updateMapEmbed();
});

// ===============================
// UPDATE MAP WITH FRESH GPS
// ===============================
function updateMapEmbed() {
  if (!currentFilter) return;

  getFreshLocation((lat, lng) => {
    const queryBase = FILTER_QUERIES[currentFilter];
    const q = `${queryBase} near ${lat},${lng}`;
    const encoded = encodeURIComponent(q);

    mapFrame.src = `https://www.google.com/maps?q=${encoded}&z=13&output=embed`;
    openInMaps.href = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  });
}

// ===============================
// DIRECTIONS
// ===============================
function buildDirectionsUrl(origin, queryBase) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(queryBase)}`;
}

directionsFromUserBtn.addEventListener("click", () => {
  if (!currentFilter) return alert("Select a supply filter first.");

  getFreshLocation((lat, lng) => {
    const origin = `${lat},${lng}`;
    const dest = FILTER_QUERIES[currentFilter];
    window.open(buildDirectionsUrl(origin, dest), "_blank");
  });
});

directionsFromClientBtn.addEventListener("click", () => {
  if (!currentFilter) return alert("Select a supply filter first.");

  const clientAddress = clientAddressInput.value.trim();
  if (!clientAddress) return alert("Enter a client address first.");

  const dest = FILTER_QUERIES[currentFilter];
  window.open(buildDirectionsUrl(clientAddress, dest), "_blank");
});

// ===============================
// INIT — Ask permission once
// ===============================
requestPermissionOnce();
