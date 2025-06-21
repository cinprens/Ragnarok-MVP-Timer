let DateTime;
if(typeof window==='undefined'){
  ({DateTime}=require('./luxon.js'));
}else{
  ({DateTime}=luxon);
}
function mezarSaatineGoreKalan(saat,zone,respawn){
  const [h,m,s=0]=saat.split(':').map(Number);
  const localNow=DateTime.now();
  let tLocal=localNow.set({hour:h,minute:m,second:s,millisecond:0});
  if(tLocal>localNow)tLocal=tLocal.minus({days:1});
  const now=localNow.setZone(zone);
  const t=tLocal.setZone(zone);
  const diff=now.diff(t,'seconds').seconds;
  return Math.round(respawn-diff);
}
function ozelZamanaGoreKalan(dk,sn){
  return dk*60+sn;
}
if(typeof window!=='undefined'){
  window.mezarSaatineGoreKalan=mezarSaatineGoreKalan;
  window.ozelZamanaGoreKalan=ozelZamanaGoreKalan;
}
module.exports={mezarSaatineGoreKalan,ozelZamanaGoreKalan};
