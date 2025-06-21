# Ragnarok MVP Timer

This application tracks respawn times of MVP monsters in Ragnarok Online. You can add timers in minutes to watch the next spawn; completed timers move to the history list.

## Usage

1. Clone or download the repository.
2. Open `index.html` in a modern browser.
3. Enter the monster name and expected minutes, then click **Add**.
4. You can also create timers using the preset MVP list on the right.

When a timer ends, your chosen sound plays and the card turns red.

### Local Server with Python

1. Run `npm install`.
2. Start the server using `npm start`.
3. Open `http://localhost:3000` in your browser.
4. Set the `PORT` environment variable to use a different port.

## Developer Notes

- Run `npm install` before running tests; this installs Jest and other dev dependencies defined in `package.json`.
- Use `npm test` to execute the test suite.
- Follow ESLint rules for code edits.
- Add new monsters using the `mvpData` array in `app.js`.
- Current dev dependencies: Jest 29.6.1 and ESLint 8.53.0.

Example CI output:

```
$ npm test

> ragnarok-mvp-timer@1.0.0 test
> jest

 PASS  __tests__/app.test.js
 PASS  __tests__/layout.test.js
 PASS  __tests__/nowTz.test.js
 PASS  __tests__/timeUtils.test.js
 PASS  __tests__/timer.test.js

Test Suites: 5 passed, 5 total
Tests:       17 passed, 17 total
Snapshots:   0 total
Time:        2.3 s
```

## Interface

The example below shows a typical timer card:

![Sample](MVP%20Giff/DRACULA.gif)

The card displays remaining time, estimated spawn time and buttons to reset or move it.
<!-- Clear browser cache to see updated files. -->
