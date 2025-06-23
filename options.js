const saveBtn = document.getElementById('saveBtn');
const themeSelect = document.getElementById('themeSelect');
const soundToggle = document.getElementById('soundToggle');
const tzSelect = document.getElementById('tzSelectOpt');

// ----------------------- MVP EKLE/DÜZENLE -------------------------
saveBtn.onclick = async () => {
  const entry = {
    id: document.getElementById('id').value,
    name: document.getElementById('name').value,
    map: document.getElementById('map').value,
    respawn: parseInt(document.getElementById('respawn').value, 10)
  };
  if (window.api && window.api.readCustom && window.api.writeCustom) {
    const list = window.api.readCustom() || [];
    list.push(entry);
    window.api.writeCustom(list);
  }
};

// ----------------------- SEKME GEÇİŞİ -----------------------------
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ----------------------- AYARLAR ---------------------------------
function populateZones() {
  Intl.supportedValuesOf('timeZone').forEach(z => {
    const o = document.createElement('option');
    o.value = z;
    o.textContent = z;
    tzSelect.append(o);
  });
}

function loadSettings() {
  themeSelect.value = localStorage.getItem('theme') || 'dark';
  soundToggle.checked = localStorage.getItem('soundEnabled') !== '0';
  tzSelect.value = localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
}

themeSelect.addEventListener('change', () => {
  localStorage.setItem('theme', themeSelect.value);
});

soundToggle.addEventListener('change', () => {
  localStorage.setItem('soundEnabled', soundToggle.checked ? '1' : '0');
});

tzSelect.addEventListener('change', () => {
  localStorage.setItem('timezone', tzSelect.value);
});

populateZones();
loadSettings();
