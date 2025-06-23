// Options window logic for MVP editing and app settings

const saveBtn   = document.getElementById("saveBtn");
const newBtn    = document.getElementById("newBtn");
const resetBtn  = document.getElementById("resetBtn");
const themeSel  = document.getElementById("themeSelect");
const soundTog  = document.getElementById("soundToggle");
const tzSel     = document.getElementById("tzSelectOpt");
const blinkTog  = document.getElementById("blinkToggleOpt");
const resSel    = document.getElementById("resSelect");
const widthInp  = document.getElementById("widthInput");
const heightInp = document.getElementById("heightInput");
const applyBtn  = document.getElementById("applyResBtn");
const listBox   = document.getElementById("mvpList");
const mapInput  = document.getElementById("mapImg");
const mvpInput  = document.getElementById("mvpImg");

// 'data' holds the merged list currently displayed. Custom creations are saved
// to customMvps.json while edits overwrite mvpDataEdit.json.
let data = [];
let editIndex = -1;

async function applyAutoResolution() {
  const size = await (window.api?.getScreenSize?.());
  if (size) {
    widthInp.value = size.width;
    heightInp.value = size.height;
    window.api.setWindowSize && window.api.setWindowSize(size.width, size.height);
  }
}

// ----- Helper functions -----
function fillForm(m = {}) {
  document.getElementById("name").value = m.name || "";
  document.getElementById("map").value = m.map || "";
  document.getElementById("respawn").value = m.respawn || "";
  mapInput.value = "";
  mvpInput.value = "";
}

function renderList() {
  listBox.innerHTML = "";
  data.forEach((m, idx) => {
    const li = document.createElement("li");
    li.textContent = `${m.name} (${m.map})`;
    const eBtn = document.createElement("button");
    eBtn.textContent = "Edit";
    eBtn.onclick = () => { editIndex = idx; fillForm(m); };
    const dBtn = document.createElement("button");
    dBtn.textContent = "Delete";
    dBtn.onclick = () => {
      data.splice(idx, 1);
      saveData();
      const merged = window.api.getMvps ? window.api.getMvps() : data;
      window.api.updateMvps && window.api.updateMvps(merged);
      renderList();
    };
    li.append(eBtn, dBtn);
    listBox.append(li);
  });
}

function saveData() {
  window.api.writeEdit && window.api.writeEdit(data);
}

function loadData() {
  data = window.api.readEdit && window.api.readEdit();
  if (!Array.isArray(data) || data.length === 0) {
    // No edits yet, show full list
    data = window.api.getMvps ? window.api.getMvps() : [];
  }
  renderList();
}

// ----- Form actions -----
saveBtn.onclick = async () => {
  const entry = {
    name: document.getElementById("name").value.trim(),
    map: document.getElementById("map").value.trim(),
    respawn: parseInt(document.getElementById("respawn").value, 10) || 0
  };

  if (mapInput.files[0]) {
    const f = mapInput.files[0];
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["gif", "jpg", "png"].includes(ext)) {
      alert("Only gif, jpg or png allowed");
      return;
    }
    const p = window.api.copyMap && window.api.copyMap(f.path, f.name);
    if (p) entry.mapImg = p;
  }

  if (mvpInput.files[0]) {
    const f = mvpInput.files[0];
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["gif", "jpg", "png"].includes(ext)) {
      alert("Only gif, jpg or png allowed");
      return;
    }
    const p = window.api.copyMvp && window.api.copyMvp(f.path, f.name);
    if (p) entry.img = p;
  }

  if (editIndex >= 0) {
    data[editIndex] = entry;
    saveData();
  } else {
    data.push(entry);
    const custom = window.api.readCustom ? window.api.readCustom() : [];
    custom.push(entry);
    window.api.writeCustom && window.api.writeCustom(custom);
  }
  const merged = window.api.getMvps ? window.api.getMvps() : data;
  window.api.updateMvps && window.api.updateMvps(merged);
  renderList();
  fillForm();
  editIndex = -1;
};

newBtn.onclick = () => { editIndex = -1; fillForm(); };

resetBtn.onclick = () => {
  if (confirm("Reset to default list?")) {
    window.api.resetEdit && window.api.resetEdit();
    loadData();
    const merged = window.api.getMvps ? window.api.getMvps() : data;
    window.api.updateMvps && window.api.updateMvps(merged);
    fillForm();
  }
};

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
  tzSel.value = localStorage.getItem("timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const settings = window.api.getSettings ? window.api.getSettings() : { resolution: "auto" };
  const res = settings.resolution || "auto";
  if (res === "auto") {
    resSel.value = "auto";
    applyAutoResolution();
  } else {
    const match = Array.from(resSel.options).some(o => o.value === res);
    resSel.value = match ? res : "custom";
    const [w, h] = res.split("x").map(Number);
    widthInp.value = w;
    heightInp.value = h;
    if (window.api && window.api.setWindowSize) window.api.setWindowSize(w, h);
  }
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

resSel.addEventListener("change", async () => {
  const val = resSel.value;
  if (val === "auto") {
    window.api.saveSettings && window.api.saveSettings({ resolution: "auto" });
    await applyAutoResolution();
  } else if (val === "custom") {
    window.api.saveSettings && window.api.saveSettings({ resolution: `${widthInp.value}x${heightInp.value}` });
  } else {
    window.api.saveSettings && window.api.saveSettings({ resolution: val });
    const [w, h] = val.split("x").map(Number);
    widthInp.value = w;
    heightInp.value = h;
    if (window.api && window.api.setWindowSize) window.api.setWindowSize(w, h);
  }
});

applyBtn.addEventListener("click", () => {
  const w = parseInt(widthInp.value, 10);
  const h = parseInt(heightInp.value, 10);
  if (Number.isNaN(w) || Number.isNaN(h) || w < 1024 || h < 640) {
    alert("Minimum resolution is 1024x640");
    return;
  }
  const val = `${w}x${h}`;
  window.api.saveSettings && window.api.saveSettings({ resolution: val });
  const match = Array.from(resSel.options).find(o => o.value === val);
  resSel.value = match ? val : "custom";
  if (window.api && window.api.setWindowSize) window.api.setWindowSize(w, h);
});

populateZones();
loadSettings();
loadData();
