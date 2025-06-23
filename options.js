// Options window logic for application settings

const themeSel  = document.getElementById("themeSelect");
const soundTog  = document.getElementById("soundToggle");
const tzSel     = document.getElementById("tzSelectOpt");
const blinkTog  = document.getElementById("blinkToggleOpt");

// ----- Tabs -----
document.querySelectorAll(".tabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// ----- App settings -----
function populateZones() {
  Intl.supportedValuesOf("timeZone").forEach(z => {
    const o = document.createElement("option");
    o.value = z;
    o.textContent = z;
    tzSel.append(o);
  });
}

function loadSettings() {
  themeSel.value = localStorage.getItem("theme") || "dark";
  soundTog.checked = localStorage.getItem("soundEnabled") !== "0";
  blinkTog.checked = localStorage.getItem("blinkOff") !== "1";
  tzSel.value = localStorage.getItem("timezone") ||
                Intl.DateTimeFormat().resolvedOptions().timeZone;
}

themeSel.addEventListener("change", () => {
  localStorage.setItem("theme", themeSel.value);
});

soundTog.addEventListener("change", () => {
  localStorage.setItem("soundEnabled", soundTog.checked ? "1" : "0");
});

blinkTog.addEventListener("change", () => {
  localStorage.setItem("blinkOff", blinkTog.checked ? "0" : "1");
});

tzSel.addEventListener("change", () => {
  localStorage.setItem("timezone", tzSel.value);
});

populateZones();
loadSettings();
