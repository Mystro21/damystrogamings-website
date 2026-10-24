# Da Conquer browser playtest

This page serves the Unity 6000.3.12f1 WebGL export from the current Da Conquer
source. The game files are under `game/`. The website home and games pages link
to `/play/da-conquer/`.

This is a solo browser edition. Native Firebase authentication, online rooms,
mobile purchases and cloud saves are excluded by the existing WebGL guards.
Browser-local progress does not sync with the mobile apps. No additional
analytics or tracking is added by this game page.

The export uses gzip compression with Unity's decompression fallback, so it
does not require custom Content-Encoding headers on GitHub Pages. Keep the
exported loader, framework and wasm files together. The large gzip data asset
is split into 16 MB parts with content hashes; `data-manifest.json` describes
the parts. The browser verifies each part, decompresses the combined asset,
and passes it to Unity through a temporary object URL. The embedded game's
canvas must fill its iframe; the outer page supplies the full-screen control.

Build method: `DaConquerBuild.BuildWebGL`.

## Browser verification, October 24, 2026

- Game loads through the split-file download and integrity checks.
- Da Conquer: two guided draw/discard turns and computer responses completed;
  the correct 13-card table artwork is displayed.
- Da Sayka: ten-card layout, unrestricted discard pickup, normal discard and
  computer handoff verified without a 41-point opening.
- Browser reload and resume restore the saved game. Tall view fits the portrait
  table and leaves its corner controls accessible.
- The embedded native splash video is unsupported on WebGL and is skipped by
  the existing fallback. Desktop orientation-lock requests produce a nonfatal
  browser console error; the game remains playable using the view controls.
- The optional account panel remains visible but offline. Return continues play.
- Online play, full win/loss device acceptance and physical mobile browsers were
  not verified by this browser smoke test.
