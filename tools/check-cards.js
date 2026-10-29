// Validates js/cards.js and simulates random runs. Usage: node tools/check-cards.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'cards.js'), 'utf8'), ctx);
const { CHARACTERS, CARDS, ENDINGS } = ctx.window.REIGN;

const errors = [];
const ids = new Set();
for (const c of CARDS) {
  if (ids.has(c.id)) errors.push(`duplicate id ${c.id}`);
  ids.add(c.id);
  if (!CHARACTERS[c.who]) errors.push(`${c.id}: unknown character ${c.who}`);
  for (const side of ['l', 'r']) {
    const ch = c[side];
    if (!ch || !ch.t) errors.push(`${c.id}.${side}: missing label`);
    for (const k of Object.keys((ch && ch.fx) || {})) {
      if (!'bstm'.includes(k)) errors.push(`${c.id}.${side}: bad meter ${k}`);
    }
  }
}
for (const c of CARDS) {
  for (const side of ['l', 'r']) {
    for (const n of [].concat((c[side] && c[side].next) || [])) {
      if (!ids.has(n)) errors.push(`${c.id}.${side}: next -> missing card ${n}`);
    }
  }
}
for (const k of ['b', 's', 't', 'm']) {
  for (const end of ['0', '1']) if (!ENDINGS[k + end]) errors.push(`missing ending ${k}${end}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`OK: ${CARDS.length} cards, ${Object.keys(CHARACTERS).length} characters, ${Object.keys(ENDINGS).length} endings`);
