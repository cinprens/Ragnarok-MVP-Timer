# Ragnarok MVP Timer

A desktop timer app built with Electron for tracking the respawn times of Ragnarok Online MVP monsters. Timers persist to disk and display remaining time and next spawn information.

---

## 💖 Support the Project

This app is and always will be free and offline. But if you enjoyed using it and want to support future updates, you can **buy me a coffee** or **support me here**:

👉 [https://adventurecapitalist.gumroad.com/l/cpqip](https://adventurecapitalist.gumroad.com/l/cpqip)

Thanks for keeping MVP hunting alive! 🏹🐺


## Features
- Real-time countdowns for MVP respawns
  driven by `requestAnimationFrame`
- "MVP Rank" panel showing kill counts
- Options window to add custom MVPs, change theme and toggle blink effect
- Upload custom map and MVP images in options
- Dark theme with transparent panels
- Hot reload in development


![image](https://github.com/user-attachments/assets/49f9c9c9-0aab-41cc-a7ea-2399e8f3843a)
![image](https://github.com/user-attachments/assets/135c8dc4-0b81-4b0a-8c8a-a677498b8a82)
![image](https://github.com/user-attachments/assets/0aefb0d5-8f5b-4810-ada9-0827c41aefdd)








### Data Files
Custom MVPs are saved in `customMvps.json` under your Electron `userData`
directory. Edited defaults are stored separately in `mvpDataEdit.json`. Both
files are merged with the base list when the app loads.

## Development
```bash
npm install
npm run dev
```
Running `npm install` once also sets up `node_modules` so that
`npm test` can execute without module errors.

## Packaging
```bash
npm run make
```

## Testing
Install dependencies if you haven't already and then run Jest:

```bash
npm install
npm test
```
If `node_modules` is missing, tests will fail to start.

## License
This project is released under the [MIT License](LICENSE).

