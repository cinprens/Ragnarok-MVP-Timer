import { jest } from "@jest/globals";
import fs from "fs";

const ipcRenderer = {
  send: jest.fn()
};

global.window = window;
window.api = {
  setWindowSize: (w, h) => ipcRenderer.send("set-window-size", { width: w, height: h }),
  readEdit: () => [],
  getMvps: () => [],
  updateMvps: jest.fn(),
  writeEdit: jest.fn(),
  writeCustom: jest.fn(),
  readCustom: () => [],
  copyMap: jest.fn(),
  copyMvp: jest.fn(),
  resetEdit: jest.fn()
};

const html = fs.readFileSync("options.html", "utf8");

beforeEach(async () => {
  jest.resetModules();
  document.body.innerHTML = html;
  localStorage.clear();
  await import("../options.js");
  ipcRenderer.send.mockClear();
});

test("changing preset resolution sends ipc message", () => {
  const sel = document.getElementById("resSelect");
  sel.value = "1600x900";
  sel.dispatchEvent(new Event("change"));

  expect(ipcRenderer.send).toHaveBeenLastCalledWith(
    "set-window-size",
    { width: 1600, height: 900 }
  );
  expect(document.getElementById("widthInput").value).toBe("1600");
  expect(document.getElementById("heightInput").value).toBe("900");
});

test("applying custom resolution sends ipc message", () => {
  document.getElementById("widthInput").value = "1280";
  document.getElementById("heightInput").value = "800";
  document.getElementById("applyResBtn").click();

  expect(ipcRenderer.send).toHaveBeenLastCalledWith(
    "set-window-size",
    { width: 1280, height: 800 }
  );
});
