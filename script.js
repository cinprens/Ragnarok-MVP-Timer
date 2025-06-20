const nameInput=document.getElementById('name');
const minutesInput=document.getElementById('minutes');
const addBtn=document.getElementById('addBtn');
const timersEl=document.getElementById('timers');
const historyEl=document.getElementById('history');
let timers=JSON.parse(localStorage.getItem('mvpTimers')||'[]');
let history=JSON.parse(localStorage.getItem('mvpHistory')||'[]');
function saveTimers(){localStorage.setItem('mvpTimers',JSON.stringify(timers))}
function saveHistory(){localStorage.setItem('mvpHistory',JSON.stringify(history))}
function renderTimers(){timersEl.innerHTML='';const now=Date.now();timers.forEach((t,i)=>{const div=document.createElement('div');const left=t.end-now;if(left<=0){history.unshift({name:t.name,time:new Date(t.end).toLocaleString()});timers.splice(i,1);saveTimers();saveHistory();renderHistory();}else{div.textContent=t.name+' '+Math.ceil(left/1000);timersEl.appendChild(div);}})}
function renderHistory(){historyEl.innerHTML='';history.slice(0,10).forEach(h=>{const div=document.createElement('div');div.textContent=h.name+' '+h.time;historyEl.appendChild(div);})}
addBtn.onclick=()=>{const name=nameInput.value.trim();const minutes=parseInt(minutesInput.value,10);if(!name||isNaN(minutes))return;const end=Date.now()+minutes*60000;timers.push({name,end});saveTimers();renderTimers();};
setInterval(renderTimers,1000);
renderTimers();
renderHistory();
