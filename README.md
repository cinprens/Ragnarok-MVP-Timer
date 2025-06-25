❤️ Support This Project
If you find this project useful, consider sponsoring me on GitHub to help keep it maintained and improve it further.





| Tier                      | Price         | Description                                                                                                              
| ------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![PORING](https://github.com/user-attachments/assets/535df144-2c45-4e66-9f40-be56fbc377c7) *Poring Tier*    | **\$1/month** | Light support tier. Adds a bit of charm with fun Poring-style content. Small, cute, and appreciated.                                                       |
| ![DROPS](https://github.com/user-attachments/assets/229ef95e-ccb8-437b-9f25-85efb8789402) **Drops  Tier** | **\$3/month** | 	Monster drop visuals & loot-inspired additions. A little flair goes a long way.                  |
| ![POPORING](https://github.com/user-attachments/assets/c4d6314d-f442-4579-86ce-a1f8205c482b) ***Poporing Tier***      | **\$7/month** | For those who want to brighten things up with wobbly charm. Slightly more playful. |


> 🫶 Thanks to every supporter who helps keep this alive. Even small porings matter. 🍥




| Tier             | Price              | Description                                                |
| ---------------- | ------------------ | ---------------------------------------------------------- |
| ![ANGELING](https://github.com/user-attachments/assets/4fbf4c0e-47c9-47f1-8c0c-888cd8bf19b4) **Angeling**  | **\$50 one-time**  | Holy aura, pure bounce, golden heart.                      |
| ![GHOSTRING](https://github.com/user-attachments/assets/c72e672a-a499-4e0a-bb6b-2ec6e6756091) **Ghostring** | **\$100 one-time** | Ethereal vibes, phase-through energy, the cutest haunting. |
| ![DEVILING](https://github.com/user-attachments/assets/aa92be65-794f-445a-9c77-08adc14e2229) **Deviling**  | **\$250 one-time** | Mischievous shadows, pink chaos, the master of cursed fun. |




# Ragnarok MVP Timer

A desktop timer app built with Electron for tracking the respawn times of Ragnarok Online MVP monsters. Timers persist to disk and display remaining time and next spawn information.

---


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





## ❤️ Support This Project

If you find this project useful, consider [sponsoring me on GitHub](https://github.com/sponsors/cinprens) to help keep it maintained and improve it further.

[![Sponsor](https://img.shields.io/badge/Sponsor-❤️-red)](https://github.com/sponsors/cinprens)



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

