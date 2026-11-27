# VERONIC — Moon CV (GitHub-ready replacement)

This package is structured for your `CV-moon` repository root.

## Replace your repo contents with:
- `index.html`
- `styles.css`
- `script.js`
- `README.md`

## Notes
- This version is designed for GitHub Pages.
- It uses imported `.glb` models for the astronaut, shuttle, and rover.
- Models and planet textures are loaded from public CDNs / source URLs at runtime.
- If any model fails to load, a simple fallback object is shown.

## Live dependencies used at runtime
- `three.js` from unpkg
- `GLTFLoader` from unpkg
- NASA 3D Resources `.glb` model URLs from jsDelivr GitHub CDN
- Three.js example planet textures

## Added upgrades
- Imported GLB astronaut / shuttle / rover
- Earth near the moon
- Moon dust particles
- Satellite lights
- Shooting stars
- Orbit glow trails
- Parallax text transitions
- Smooth section-based camera movement
- Drag interaction