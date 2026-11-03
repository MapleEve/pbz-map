# pbz-map

English interactive maps for **Phantom Blade Zero**, built with Vue 3 and Leaflet. Browse regions, filter landmarks, search names and descriptions, and keep completion marks and custom pins in your browser.

[Open the map](https://mapleeve.github.io/pbz-map/) · [Report an issue](https://github.com/MapleEve/pbz-map/issues) · [Contribute](https://github.com/MapleEve/pbz-map/pulls)

## Using the map

- Choose a region, then pan and zoom to explore it. **Reset view** restores the region's configured view.
- Select categories to show their landmarks. **Select all** toggles the category selection. **Clear** clears the selection and returns the completion filter to **All**, without deleting saved progress or pins.
- Use **All**, **Completed** or **Incomplete** to filter completion status. A newly loaded region starts with **Incomplete** and its configured default categories.
- Search landmark names and descriptions across the included regions, independently of category and completion filters. Results appear after a 500 ms pause, grouped into name and description matches with highlighted text and category and region labels.
- Select a result to open its map destination, or press Enter to use keyword navigation. Cross-region results open in a new tab on identified desktop browsers; mobile and unidentified browsers stay in the current context. Mobile search has a separate view with **Cancel**.
- Open a landmark to read its description and ordered images. **Mark complete** and **Undo** change its completion status locally. A landmark hidden by the active completion filter no longer appears on the map.
- Use **Add pin** and follow the placement prompt to save a custom pin. Cancel placement with **Cancel pin** or Escape. Open a saved pin to remove it.
- **Clear pins** removes only the current region's custom pins. **Reset progress** clears only its completion marks. Both ask for confirmation and preserve the other kind of saved state.
- Collapse or expand the map controls to change the space available for the map.

Completion marks and custom pins are stored per region, browser and origin. No account is required, and progress is not synchronized with a remote service. If browser storage cannot be read or a change cannot be saved, the app reports the problem instead of applying an unsaved change. Clearing browser site data removes that origin's saved progress and pins.

## Local development

Use Node.js **20.19+ within 20.x, or 22.12 and later**, and npm.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173/**. The app reads the included product records and local assets rather than fetching live game-map content.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm test` | Run product-data, model, component-code and local-state tests. |
| `npm run build` | Write the production build to `dist/`. |
| `npm run check` | Run the tests, then build the app. |

## Product data and assets

- `public/data/manifest.json` defines the ordered regions, category groups, categories, view settings and local resource paths. English names are stored directly on their records.
- Each region's `pointsUrl` identifies its landmark collection. Each landmark record contains its original ID, category, position, `z`, English name, description and ordered local-image references.
- A landmark can have multiple category representations with the same original ID. Rendering and selection distinguish the region, category and landmark together; completion remains attached to the original landmark ID.
- `public/assets/` contains the map tiles, category icons and associated landmark images. Image files retain their original pixels, including any text embedded in the imagery.
- Shared modules in `src/` handle data validation, search, persistence, map rendering and controls for every region.

Positions use `[longitude, latitude]` in the data and convert to Leaflet's `[latitude, longitude]` at the rendering boundary. Tiles use EPSG:3857 / XYZ. Each region defines its display zoom range and, where applicable, a separate maximum native tile zoom. Retained `z` values are data, not floor selectors.

Keep product data and assets together when hosting the app. Missing local resources are reported without switching to a third-party image server or live-data fallback.

## GitHub Pages and static hosting

The project site is **https://mapleeve.github.io/pbz-map/**. The repository's Pages workflow runs on updates to `master` and can also be started manually. It installs the locked dependencies, runs `npm run check`, builds for `/pbz-map/` and deploys only `dist/` after the build succeeds.

To build for the same project path locally:

```sh
npm run build -- --base=/pbz-map/
```

Serve the generated `dist/` directory at `/pbz-map/` with a static HTTP server. For root hosting, use `npm run build -- --base=/` and serve `dist/` at `/`. The chosen base applies to the entry bundle, local JSON, tiles, icons and landmark images.

## Sources and license

The English terminology reference is the [Phantom Blade Zero Interactive Map](https://phantombladezero.wiki.fextralife.com/Interactive_Map) and related pages on that same Fextralife wiki. This reference is not a claim that every term is an official game localization. Original map data and imagery come from [Gamersky](https://app.gamersky.com/map/?mapId=254&nameundefined).

Some names and descriptions are provisional English translations; source verification will continue after this release.

Original project content is licensed under **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** only to the extent that its contributors have authority to grant those rights. Sharing and adaptations require attribution and are permitted only for noncommercial purposes under that license. See [LICENSE](LICENSE) for the scope notice and complete legal text.

Third-party game content, map data, imagery, trademarks and dependencies are not relicensed by this project. They remain subject to their respective owners' rights and applicable licenses. Their inclusion does not establish authorization, open-source status or permission to relicense them. Existing third-party license notices and attribution requirements continue to apply.
