const saveBtn = document.getElementById('saveBtn');

saveBtn.onclick = () => {
  const data = [{
    id: document.getElementById('id').value,
    name: document.getElementById('name').value,
    map: document.getElementById('map').value,
    respawn: parseInt(document.getElementById('respawn').value, 10)
  }];
  window.api.saveCustom(data);
};
