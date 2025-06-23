import { jest } from "@jest/globals";
jest.mock("electron");
import { mergeMvpLists } from "../preload.js";

test("base entries preserved when edits exist", () => {
  const base = [
    { name: "A", respawn: 1 },
    { name: "B", respawn: 2 }
  ];
  const custom = [
    { name: "C", respawn: 3 }
  ];
  const edits = [
    { name: "A", respawn: 5 }
  ];
  const res = mergeMvpLists(base, custom, edits);
  expect(res.find(m => m.name === "B")).toBeTruthy();
  const a = res.find(m => m.name === "A");
  expect(a.respawn).toBe(5);
  expect(res.length).toBe(3);
});

test("duplicate names with different maps remain", () => {
  const base = [
    { name: "Doppelganger", map: "gef_dun02" },
    { name: "Doppelganger", map: "gl_cas01" }
  ];
  const res = mergeMvpLists(base, [], []);
  const matches = res.filter(m => m.name === "Doppelganger");
  expect(matches.length).toBe(2);
});
