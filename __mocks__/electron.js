import { jest } from "@jest/globals";
export const contextBridge = {
  exposeInMainWorld: jest.fn()
};
export const ipcRenderer = {
  invoke: jest.fn(async () => "/tmp"),
  on: jest.fn(),
  send: jest.fn()
};
