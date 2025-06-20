const nameInput = document.getElementById('name');
const minutesInput = document.getElementById('minutes');
const tombInput = document.getElementById('tomb');
const addBtn = document.getElementById('addBtn');
const timersEl = document.getElementById('timers');
const historyEl = document.getElementById('history');
const soundInput = document.getElementById('soundFile');
const alertSound = document.getElementById('alertSound');
const timezoneSelect = document.getElementById('timezone');
const listEl = document.getElementById('mvpList');

const savedZone = localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
const zones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [savedZone];
zones.forEach(z => {
  const opt = document.createElement('option');
  opt.value = z;
  opt.textContent = z;
  timezoneSelect.appendChild(opt);
});
timezoneSelect.value = savedZone;
timezoneSelect.onchange = () => {
  localStorage.setItem('timezone', timezoneSelect.value);
  renderTimers();
  renderHistory();
};

const mvpData = [
  { id: 1511, name: 'Orc Lord', respawn: 3600 },
  { id: 1115, name: 'Eddga', respawn: 7200 },
  { id: 1785, name: 'Phreeoni', respawn: 3600 }
];

function renderMvpList() {
  listEl.innerHTML = '';
  const ol = document.createElement('ol');
  mvpData.forEach(m => {
    const li = document.createElement('li');
    li.textContent = m.name;
    li.onclick = () => addTimer(m.name, m.respawn / 60);
    li.oncontextmenu = e => {
      e.preventDefault();
      const val = parseInt(prompt('Dakika?') || '', 10);
      if (!isNaN(val)) addTimer(m.name, val);
    };
    ol.appendChild(li);
  });
  listEl.appendChild(ol);
}

let timers = JSON.parse(localStorage.getItem('mvpTimers') || '[]');
let history = JSON.parse(localStorage.getItem('mvpHistory') || '[]');

function saveTimers() {
  localStorage.setItem('mvpTimers', JSON.stringify(timers));
}

function saveHistory() {
  localStorage.setItem('mvpHistory', JSON.stringify(history));
}

function addTimer(name, minutes) {
  const end = Date.now() + minutes * 60000;
  timers.push({ name, end });
  saveTimers();
  renderTimers();
}

function removeTimer(index) {
  timers.splice(index, 1);
  saveTimers();
  renderTimers();
}

function moveTimer(index, dir) {
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= timers.length) return;
  const [item] = timers.splice(index, 1);
  timers.splice(newIndex, 0, item);
  saveTimers();
  renderTimers();
}

function renderTimers() {
  timersEl.innerHTML = '';
  const now = Date.now();
  timers.forEach((t, i) => {
    const div = document.createElement('div');
    const left = t.end - now;
    if (left <= 0) {
      history.unshift({ name: t.name, time: t.end });
      timers.splice(i, 1);
      saveTimers();
      saveHistory();
      renderHistory();
      if (alertSound.src) alertSound.play();
    } else {
      const endStr = new Date(t.end).toLocaleString('tr-TR', { timeZone: timezoneSelect.value });
      const sec = Math.ceil(left / 1000);
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      const leftStr = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
      div.textContent = `${t.name} ${leftStr} ${endStr}`;
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Sil';
      removeBtn.onclick = () => removeTimer(i);
      const upBtn = document.createElement('button');
      upBtn.textContent = '▲';
      upBtn.onclick = () => moveTimer(i, -1);
      const downBtn = document.createElement('button');
      downBtn.textContent = '▼';
      downBtn.onclick = () => moveTimer(i, 1);
      div.appendChild(removeBtn);
      div.appendChild(upBtn);
      div.appendChild(downBtn);
      timersEl.appendChild(div);
    }
  });
}

function renderHistory() {
  historyEl.innerHTML = '';
  history.slice(0, 10).forEach(h => {
    const div = document.createElement('div');
    const timeStr = new Date(h.time).toLocaleString('tr-TR', { timeZone: timezoneSelect.value });
    div.textContent = `${h.name} ${timeStr}`;
    historyEl.appendChild(div);
  });
}

addBtn.onclick = () => {
  const name = nameInput.value.trim();
  const minutes = parseInt(minutesInput.value, 10);
  const tomb = parseInt(tombInput.value, 10) || 0;
  if (!name || isNaN(minutes)) return;
  addTimer(name, minutes + tomb);
};

soundInput.onchange = e => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    if (typeof ev.target?.result === 'string') {
      alertSound.src = ev.target.result;
    }
  };
  reader.readAsDataURL(file);
};

setInterval(renderTimers, 1000);
renderTimers();
renderHistory();
renderMvpList();
