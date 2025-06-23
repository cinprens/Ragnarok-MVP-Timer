# Ragnarok MVP Timer

A desktop timer app built with Electron for tracking the respawn times of Ragnarok Online MVP monsters. Timers persist to disk and display remaining time and next spawn information.

## Features
- Real-time countdowns for MVP respawns
  driven by `requestAnimationFrame`
- "MVP Rank" panel showing kill counts
- Options window to add custom MVPs, change theme and toggle blink effect
- Upload custom map and MVP images in options
- Dark theme with transparent panels
- Hot reload in development

### Data Files
Custom MVPs are saved in `customMvps.json` under your Electron `userData`
directory. Edited defaults are stored separately in `mvpDataEdit.json`. Both
files are merged with the base list when the app loads.

## Development
```bash
npm install
npm run dev
```

## Packaging
```bash
npm run make
```

