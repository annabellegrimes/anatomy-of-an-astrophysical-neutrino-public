// Shared: a speckled silt texture for seafloors drawn with three.js (the P-ONE array). siltTexture(repeat) returns a tiling CanvasTexture; pass the number of tiles across the floor.
// The speckles are seeded, so the floor looks the same on every load. With neutral set, the silt is light grey, to be
// tinted by the material's (or the vertices') colour.
window.siltTexture = function (repeat, neutral) {
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  g.fillStyle = neutral ? "#d6d6d6" : "#6a6250"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const v = 70 + rnd() * 60 | 0; g.fillStyle = neutral ? `rgba(${v + 110},${v + 110},${v + 110},${0.3 + rnd() * 0.4})` : `rgba(${v + 20},${v + 12},${v - 6},${0.25 + rnd() * 0.35})`;
    g.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 2.5, 1 + rnd() * 2.5);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = 4;
  return t;
};
