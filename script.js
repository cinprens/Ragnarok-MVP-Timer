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
  { name: 'Beelzebub', map: 'abbey03', respawn: 43200, img: 'MVP Giff/BEELZEBUB_.gif', mapImg: 'Maps/abbey03.gif' },
  { name: 'Maya', map: 'anthell02', respawn: 7200, img: 'MVP Giff/MAYA.gif', mapImg: 'Maps/anthell02.gif' },
  { name: 'Tao Gunka', map: 'beach_dun', respawn: 3600, img: 'MVP Giff/TAO_GUNKA.gif', mapImg: 'Maps/beach_dun.gif' },
  { name: 'Dracula', map: 'gef_dun01', respawn: 3600, img: 'MVP Giff/DRACULA.gif', mapImg: 'Maps/gef_dun01.gif' },
  { name: 'Dracula', map: 'gef_dun02', respawn: 3600, img: 'MVP Giff/DRACULA.gif', mapImg: 'Maps/gef_dun02.gif' },
  { name: 'Orc Hero', map: 'gef_fild03', respawn: 3600, img: 'MVP Giff/ORK_HERO.gif', mapImg: 'Maps/gef_fild03.gif' },
  { name: 'Orc Lord', map: 'gef_fild14', respawn: 7200, img: 'MVP Giff/ORC_LORD.gif', mapImg: 'Maps/gef_fild14.gif' },
  { name: 'Doppelganger', map: 'gl_cas01', respawn: 7200, img: 'MVP Giff/DOPPELGANGER.gif', mapImg: 'Maps/gl_cas01.gif' },
  { name: 'Dark Lord', map: 'gl_chyard', respawn: 7200, img: 'MVP Giff/DARK_LORD.gif', mapImg: 'Maps/gl_chyard.gif' },
  { name: 'Evil Snake Lord', map: 'gon_dun03', respawn: 7200, img: 'MVP Giff/Evil Snake Lord.gif', mapImg: 'Maps/gon_dun03.gif' },
  { name: 'Amon Ra', map: 'in_sphinx5', respawn: 3600, img: 'MVP Giff/AMON_RA.gif', mapImg: 'Maps/in_sphinx5.gif' },
  { name: 'White Lady', map: 'lou_dun03', respawn: 7200, img: 'MVP Giff/White Lady.gif', mapImg: 'Maps/lou_dun03.gif' },
  { name: 'Mistress', map: 'mjolnir_04', respawn: 7200, img: 'MVP Giff/MISTRESS.gif', mapImg: 'Maps/mjolnir_04.gif' },
  { name: 'Phreeoni', map: 'moc_fild17', respawn: 3600, img: 'MVP Giff/PHREEONI.gif', mapImg: 'Maps/moc_fild17.gif' },
  { name: 'Osiris', map: 'moc_pryd04', respawn: 3600, img: 'MVP Giff/OSIRIS.gif', mapImg: 'Maps/moc_pryd04.gif' },
  { name: 'Randgris', map: 'odin_tem03', respawn: 10800, img: 'MVP Giff/RANDGRIS.gif', mapImg: 'Maps/odin_tem03.gif' },
  { name: 'Moonlight Flower', map: 'pay_dun04', respawn: 3600, img: 'MVP Giff/MOONLIGHT.gif', mapImg: 'Maps/pay_dun04.gif' },
  { name: 'Eddga', map: 'pay_fild10', respawn: 7200, img: 'MVP Giff/EDDGA.gif', mapImg: 'Maps/pay_fild10.gif' },
  { name: 'Baphomet', map: 'prt_maze03', respawn: 7200, img: 'MVP Giff/4_BAPHOMET.gif', mapImg: 'Maps/prt_maze03.gif' },
  { name: 'Golden Bug', map: 'prt_sewb4', respawn: 3600, img: 'MVP Giff/GOLDEN_BUG.gif', mapImg: 'Maps/prt_sewb4.gif' },
  { name: 'Drake', map: 'treasure02', respawn: 7200, img: 'MVP Giff/DRAKE.gif', mapImg: 'Maps/treasure02.gif' },
  { name: 'Turtle General', map: 'tur_dun04', respawn: 3600, img: 'MVP Giff/TURTLE_GENERAL.gif', mapImg: 'Maps/tur_dun04.gif' },
  { name: 'Stormy Knight', map: 'xmas_dun02', respawn: 7200, img: 'MVP Giff/4_STORMKNIGHT.gif', mapImg: 'Maps/xmas_dun02.gif' },
  { name: 'Garm', map: 'xmas_fild01', respawn: 7200, img: 'MVP Giff/GARM.gif', mapImg: 'Maps/xmas_fild01.gif' }
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
