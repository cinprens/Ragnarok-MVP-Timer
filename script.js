const started = {};              // Yalnızca 1 tane!
function renderMvpList(){
  listEl.innerHTML='';
  [...mvpData]
   .sort((a,b)=> (started[a.name]?-1:1) - (started[b.name]?-1:1) )
   .forEach(m=>{
      const c = document.createElement('div');
      c.className='mvp-card'+(started[m.name]?' aktif':'');
      const g = img(m.img);       // yardımcı basit fonksiyon aşağıda
      const mp= img(m.mapImg);
      const inpt = numInput('Dakika');
      const btn  = button('Başlat',()=>{
          addTimer(m.name, parseInt(inpt.value)||m.respawn/60);
          c.scrollIntoView({behavior:'smooth',block:'center'});
      });
      c.append(g,mp,inpt,btn);    listEl.append(c);
   });
}
// 1 aktif en öne:
if(aktif[0]){
  nearestEl.innerHTML='';
  nearestEl.appendChild(ortaKart(aktif[0]));
}

// süresi dolan -> sağ panele:
bitti.forEach(t=>{
  const kc = minimalBittiKart(t);
  completedEl.appendChild(kc);
});
const img = src=>{const i=new Image();i.src='./'+src;i.width=48;i.alt=src+' görseli';return i;}
const numInput=ph=>{const i=document.createElement('input');i.placeholder=ph;return i;}
const button=(txt,fn)=>{const b=document.createElement('button');b.textContent=txt;b.onclick=fn;return b;}

// orta panel kartı
function ortaKart(timer){
  const k = document.createElement('div');k.className='card';
  const mvp = mvpData.find(x=>x.name===timer.name);
  k.append( img(mvp.img), img(mvp.mapImg), zamanEtiketi(timer,'time-display') );
  return k;
}

// sağ panel minimal kart
function minimalBittiKart(timer){
  const k=document.createElement('div');k.className='bitti-card';
  const mvp=mvpData.find(x=>x.name===timer.name);
  k.append( img(mvp.img), img(mvp.mapImg), zamanEtiketi(timer,'bitti-time',true) );
  return k;
}

// ileri/geri sayım etiketi
function zamanEtiketi(t,cls,geri=false){
  const d=document.createElement('div');d.className=cls;
  const left = (geri? Date.now()-t.end : t.end-Date.now());
  const mm=Math.floor(Math.abs(left)/60000).toString().padStart(2,'0');
  const ss=Math.floor(Math.abs(left)%60000/1000).toString().padStart(2,'0');
  d.textContent = (geri?'-':'')+`${mm}:${ss}`; return d;
}
