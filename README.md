# Ragnarok MVP Timer

A desktop timer app built with Electron for tracking the respawn times of Ragnarok Online MVP monsters. Timers persist to disk and display remaining time and next spawn information.

## Features
- Real-time countdowns for MVP respawns
  driven by `requestAnimationFrame`
- "MVP Rank" panel showing kill counts
- Options window to add custom MVPs, change theme and toggle blink effect
- Dark theme with transparent panels
- Hot reload in development

## Development
```bash
npm install
npm run dev
```

## Packaging
```bash
npm run make
```

