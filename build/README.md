# build/

This folder contains build resources used by electron-builder.

## Required Files

| File | Description |
|------|-------------|
| `icon.ico` | App icon for Windows (.ico format, 256x256 recommended) |
| `icon.png` | App icon for Linux/macOS (512x512 PNG) |

## How to add your icon

1. Create or export a 512x512 PNG image of your app icon
2. Convert it to `.ico` using a tool like:
   - https://convertio.co/png-ico/
   - https://www.icoconverter.com/
3. Place `icon.ico` in this `build/` folder

electron-builder will automatically pick it up when you run `npm run build`.

> If no icon is found, electron-builder will use the default Electron icon.
