jest.useFakeTimers().setSystemTime(new Date("2023-01-01T00:00:00Z"));
test("nowTz dogru zaman dondurur", async () => {
  localStorage.setItem("timezone","Asia/Tokyo");
  const mod = await import("../app.js");
  expect(mod.nowTz().toISOString()).toBe("2023-01-01T09:00:00.000Z");
  localStorage.removeItem("timezone");
  jest.useRealTimers();
});
