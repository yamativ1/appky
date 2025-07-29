// scripts/download-avatars.js
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

const outputDir = path.join(__dirname, '../public/avatar');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadAvatar(index) {
  const seed = `avatar-${index}`; // 種は固定にしてランダム風
  const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
  const res = await fetch(url);
  const svg = await res.text();
  const filePath = path.join(outputDir, `avatar_${index}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`✅ Saved avatar_${index}.svg`);
}

async function main() {
  for (let i = 0; i < 100; i++) {
    await downloadAvatar(i);
    await sleep(300); // 少しディレイ（安全のため）
  }
}

main();
