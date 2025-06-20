function renderMvpList() {
  listEl.innerHTML = '';

  const sirali = [...mvpData].sort((a, b) => {
    const aStarted = !!started[a.name];
    const bStarted = !!started[b.name];
    if (aStarted && !bStarted) return -1;
    if (!aStarted && bStarted) return 1;
    return a.name.localeCompare(b.name);
  });

  sirali.forEach(m => {
    const card = document.createElement('div');
    card.className = 'mvp-card';
    if (started[m.name]) card.classList.add('aktif');

    const gif = document.createElement('img');
    gif.src = `./${m.img}`;
    gif.alt = `${m.name} gif`;

    const map = document.createElement('img');
    map.src = `./${m.mapImg}`;
    map.alt = `${m.map} harita`;

    const time = document.createElement('input');
    time.type = 'number';
    time.placeholder = 'Dakika';

    const btn = document.createElement('button');
    btn.textContent = 'Başlat';
    btn.onclick = () => {
      const val = parseInt(time.value, 10);
      addTimer(m.name, isNaN(val) ? m.respawn / 60 : val);

      // Kaydır: başlatınca bu kartı ortaya getir
      setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    };

    card.appendChild(gif);
    card.appendChild(map);
    card.appendChild(time);
    card.appendChild(btn);

    listEl.appendChild(card);
  });
}
