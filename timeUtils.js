let DateTime;
if(typeof window==='undefined'){
  ({DateTime}=require('./luxon.js'));
}else{
  ({DateTime}=luxon);
}
function mezarSaatineGoreKalan(saat,zone,respawn){
  const [h,m]=saat.split(':').map(Number);
  const now=DateTime.now().setZone(zone);
  let t=now.set({hour:h,minute:m,second:0,millisecond:0});
  if(t>now)t=t.minus({days:1});
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
