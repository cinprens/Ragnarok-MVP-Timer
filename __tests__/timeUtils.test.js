const {mezarSaatineGoreKalan,ozelZamanaGoreKalan}=require('../timeUtils');
const {DateTime,Settings}=require('../luxon.js');

test('mezar bugun',()=>{
  Settings.now=()=>new Date('2023-01-01T12:00:00Z').getTime();
  const r=mezarSaatineGoreKalan('10:00:00','UTC',7200);
  expect(r).toBe(0);
  Settings.now=null;
});

test('mezar dunden',()=>{
  Settings.now=()=>new Date('2023-01-01T02:00:00Z').getTime();
  const r=mezarSaatineGoreKalan('22:00:00','UTC',7200);
  expect(r).toBe(-7200);
  Settings.now=null;
});

test('ozel sure',()=>{
  expect(ozelZamanaGoreKalan(5,30)).toBe(330);
});

test('mezar utc custom',()=>{
  Settings.now=()=>new Date('2023-01-01T12:00:00Z').getTime();
  const r=mezarSaatineGoreKalan('11:30:00','UTC',5400);
  expect(r).toBe(3600);
  Settings.now=null;
});

test('saniye girisi',()=>{
  Settings.now=()=>new Date('2023-01-01T12:00:30Z').getTime();
  const r=mezarSaatineGoreKalan('12:00:00','UTC',120);
  expect(r).toBe(90);
  Settings.now=null;
});
