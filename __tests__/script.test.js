beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));
  document.body.innerHTML = `
    <input id="name" />
    <input id="minutes" />
    <input id="tomb" />
    <button id="addBtn"></button>
    <section id="enYakin"></section>
    <section id="yaklasanlar"></section>
    <section id="bitenler"></section>
    <div id="history"></div>
    <input id="soundFile" />
    <audio id="alertSound"></audio>
    <select id="timezone"></select>
    <section id="mvpList"></section>
  `;
  localStorage.clear();
  jest.resetModules();
});

afterEach(() => {
  jest.useRealTimers();
});

test('addTimer fonksiyonu zamanlayıcı ekler', () => {
  const { addTimer, timers } = require('../script');
  addTimer('Test', 5);
  expect(timers.length).toBe(1);
  expect(timers[0].name).toBe('Test');
  expect(timers[0].end).toBe(Date.now() + 5 * 60000);
});

test('removeTimer fonksiyonu zamanlayıcı siler', () => {
  const { addTimer, removeTimer, timers } = require('../script');
  addTimer('A', 1);
  addTimer('B', 1);
  removeTimer(0);
  expect(timers.length).toBe(1);
  expect(timers[0].name).toBe('B');
});

test('moveTimer fonksiyonu zamanlayıcı taşır', () => {
  const { addTimer, moveTimer, timers } = require('../script');
  addTimer('A', 1);
  addTimer('B', 1);
  moveTimer(1, -1);
  expect(timers[0].name).toBe('B');
});

test('renderTimers DOM elemanlarini olusturur', () => {
  const { addTimer } = require('../script');
  addTimer('A', 1);
  jest.runOnlyPendingTimers();
  expect(document.getElementById('enYakin').children.length).toBe(1);
});

test('kartlarda alt niteliği bulunur', () => {
  const { addTimer } = require('../script');
  addTimer('A', 1);
  jest.runOnlyPendingTimers();
  const img=document.querySelector('#enYakin img');
  expect(img.alt).toMatch('görseli');
});
