import sharp from "sharp";
import { Buffer } from "node:buffer";
import { writeFile, copyFile } from "node:fs/promises";

// Code-native typographic artwork; no synthetic photographs or project imagery.
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><rect width="180" height="180" rx="36" fill="#111116"/><path d="M35 125V66h15v10c7-9 14-12 25-11v16c-17-2-24 5-24 22v22zm87-2c-7 4-13 6-20 6-17 0-28-13-28-33s11-33 28-33c8 0 14 3 20 8v-6h16v60h-16zm-15-9c10 0 16-7 16-18s-6-18-16-18-16 7-16 18 6 18 16 18" fill="#f7f7fa"/><circle cx="153" cy="119" r="8" fill="#c8b6f2"/></svg>`;
await writeFile("public/favicon.svg", mark);
await sharp(Buffer.from(mark))
  .resize(180, 180)
  .png()
  .toFile("public/apple-touch-icon.png");
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f7f7fa"/><rect x="880" width="320" height="630" fill="#111116"/><circle cx="1000" cy="270" r="105" fill="none" stroke="#c8b6f2" stroke-width="2"/><path d="M910 270h180M1000 180v180" stroke="#747484"/><text x="72" y="90" fill="#6b469c" font-family="Arial,sans-serif" font-size="24">RENDEL ABAINZA / DEVELOPER</text><text x="68" y="252" fill="#1b1b22" font-family="Arial,sans-serif" font-size="76" font-weight="600">Useful software,</text><text x="68" y="344" fill="#6b469c" font-family="Arial,sans-serif" font-size="76" font-weight="600">thoughtfully built.</text><path d="M72 454h710" stroke="#dcdce5"/><text x="72" y="515" fill="#5e5e6b" font-family="Arial,sans-serif" font-size="25">From interface to system.</text><text x="935" y="500" fill="#c8b6f2" font-family="Arial,sans-serif" font-size="76" font-weight="600">ra.</text></svg>`;
await sharp(Buffer.from(social)).png().toFile("public/social-card.png");
await copyFile(
  "node_modules/@fontsource-variable/geist/LICENSE",
  "public/GEIST-LICENSE.txt",
);
