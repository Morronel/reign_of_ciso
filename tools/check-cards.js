// Validates every deck in js/modes/ and prints a quick random-play balance check.
// Usage: node tools/check-cards.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = path.join(__dirname, '..', 'js', 'modes');
const ctx = { window: {} };
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort()) {
  vm.runInNewContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
}

const METERS = ['b', 's', 't', 'm'];
let failed = false;

function randomRunLength({ cards }) {
  const pool = cards.filter((c) => !c.followup && !c.cond);
  const m = { b: 50, s: 50, t: 50, m: 50 };
  for (let week = 1; week < 1000; week++) {
    const c = pool[Math.floor(Math.random() * pool.length)];
    const fx = c[Math.random() < 0.5 ? 'l' : 'r'].fx || {};
    for (const k of METERS) {
      m[k] = Math.max(0, Math.min(100, m[k] + (fx[k] || 0)));
      if (m[k] === 0 || m[k] === 100) return week;
    }
  }
  return 1000;
}

for (const [id, mode] of Object.entries(ctx.window.REIGN_MODES)) {
  const errors = [];
  const { characters, cards, endings, meters } = mode;
  const ids = new Set();
  for (const c of cards) {
    if (ids.has(c.id)) errors.push(`duplicate id ${c.id}`);
    ids.add(c.id);
    if (!characters[c.who]) errors.push(`${c.id}: unknown character ${c.who}`);
    for (const side of ['l', 'r']) {
      const ch = c[side];
      if (!ch || !ch.t) errors.push(`${c.id}.${side}: missing label`);
      for (const k of Object.keys((ch && ch.fx) || {})) {
        if (!METERS.includes(k)) errors.push(`${c.id}.${side}: bad meter ${k}`);
      }
      for (const n of [].concat((ch && ch.next) || [])) {
        if (!cards.some((x) => x.id === n)) errors.push(`${c.id}.${side}: next -> missing card ${n}`);
      }
    }
  }
  if (!ids.has('welcome')) errors.push('missing welcome card');
  for (const k of METERS) {
    if (!meters[k] || !meters[k].name || !meters[k].icon) errors.push(`missing meter ${k}`);
    for (const end of ['0', '1']) if (!endings[k + end]) errors.push(`missing ending ${k}${end}`);
  }
  for (const f of ['label', 'setting', 'blurb', 'tagline', 'firstNames', 'epithets', 'tenureHint']) {
    if (!mode[f]) errors.push(`missing field ${f}`);
  }

  if (errors.length) {
    failed = true;
    console.error(`${id}: FAIL\n  ${errors.join('\n  ')}`);
    continue;
  }
  const runs = Array.from({ length: 2000 }, () => randomRunLength(mode)).sort((a, b) => a - b);
  console.log(`${id}: OK, ${cards.length} cards, ${Object.keys(characters).length} characters, ` +
    `${Object.keys(endings).length} endings, random-play median ${runs[1000]} weeks`);
}
process.exit(failed ? 1 : 0);
