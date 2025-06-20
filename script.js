const data = [
  { name: 'Orc Lord' },
  { name: 'Dracula' },
  { name: 'Baphomet' },
  { name: 'Eddga' }
];

let index = 0;

function render() {
  const now = new Date().toLocaleTimeString();
  document.getElementById('left-content').innerHTML =
    data.map((m) => `<div class="item">${m.name}</div>`).join('') +
    `<div class="timestamp">${now}</div>`;

  document.getElementById('mid-content').innerHTML =
    `<div class="big-item">${data[index % data.length].name}</div>` +
    `<div class="timestamp">${now}</div>`;

  document.getElementById('right-content').innerHTML =
    `<div class="timestamp">${now}</div>`;

  index += 1;
}

setInterval(render, 3000);
render();
