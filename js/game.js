(function () {
  'use strict';

  const { CHARACTERS, CARDS, ENDINGS } = window.REIGN;
  const CARD_BY_ID = Object.fromEntries(CARDS.map((c) => [c.id, c]));
  const METERS = ['b', 's', 't', 'm'];
  const METER_NAMES = { b: 'Budget', s: 'Security', t: 'Board trust', m: 'Morale' };
  const MAX = 100;
  const START = 50;
  const RECENT_LIMIT = 20;
  const SWIPE_COMMIT = 90;
  const SWIPE_PREVIEW = 30;
  const STORAGE_KEY = 'reign-of-ciso.v1';

  const FIRST = ['Alex', 'Sam', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Taylor', 'Jamie', 'Robin', 'Dana', 'Avery', 'Quinn', 'Kai', 'Sasha', 'Nikita', 'Charlie', 'Ari', 'Remy'];
  const EPITHET = ['the Patched', 'the Unpatched', 'Zero-Day', 'the Firewall', 'the Compliant', 'the Auditable', 'MFA', 'the Phished', 'the Paranoid', 'the Encrypted', 'Two-Factor', 'the Hashed', 'the Salted', 'the Sandboxed', 'Least-Privilege', 'the Logged', 'the Air-Gapped', 'Root'];

  // ---------- Persistence ----------
  const store = {
    data: { best: 0, cisoCount: 0, endings: {}, prevName: null, prevWeeks: 0, run: null },
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) Object.assign(this.data, JSON.parse(raw));
      } catch (e) { /* storage unavailable: play without saving */ }
    },
    save() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ }
    },
  };

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const el = {
    screens: {
      title: $('screen-title'), game: $('screen-game'), over: $('screen-over'), endings: $('screen-endings'),
    },
    meters: Object.fromEntries(METERS.map((k) => [k, document.querySelector(`.meter[data-k="${k}"]`)])),
    question: $('question'),
    card: $('card'),
    portrait: $('portrait'),
    choiceL: $('choice-left'),
    choiceR: $('choice-right'),
    whoName: $('who-name'),
    whoRole: $('who-role'),
    tenure: $('tenure'),
    cisoName: $('ciso-name'),
    hint: $('hint'),
    toast: $('toast'),
  };

  function show(name) {
    Object.entries(el.screens).forEach(([k, s]) => s.classList.toggle('active', k === name));
  }

  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.toast.classList.remove('show'), 2200);
  }

  // ---------- Helpers ----------
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const asList = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
  const clamp = (v) => Math.max(0, Math.min(MAX, v));

  function formatTenure(weeks) {
    if (weeks < 52) return `${weeks} week${weeks === 1 ? '' : 's'}`;
    const y = Math.floor(weeks / 52);
    const w = weeks % 52;
    return `${y} year${y === 1 ? '' : 's'}${w ? `, ${w} week${w === 1 ? '' : 's'}` : ''}`;
  }

  // ---------- Run state ----------
  let run = null;
  let busy = false;

  function newRun() {
    const d = store.data;
    d.cisoCount += 1;
    run = {
      cisoNo: d.cisoCount,
      name: `${pick(FIRST)} ${pick(EPITHET)}`,
      prevName: d.prevName,
      prevWeeks: d.prevWeeks,
      m: { b: START, s: START, t: START, m: START },
      week: 0,
      flags: [],
      scheduled: [],
      recent: [],
      used: [],
      current: 'welcome',
    };
    d.run = run;
    store.save();
  }

  function eligible(card) {
    if (asList(card.requires).some((f) => !run.flags.includes(f))) return false;
    if (asList(card.excludes).some((f) => run.flags.includes(f))) return false;
    if (card.cond && !card.cond(run)) return false;
    return true;
  }

  function drawCard() {
    // Scheduled follow-ups take priority once they're due.
    run.scheduled.sort((a, b) => a.at - b.at);
    while (run.scheduled.length && run.scheduled[0].at <= run.week) {
      const item = run.scheduled.shift();
      const id = asList(item.ids).find((cid) => CARD_BY_ID[cid] && eligible(CARD_BY_ID[cid]));
      if (id) return id;
    }

    const pool = CARDS.filter((c) =>
      !c.followup &&
      !(c.once && run.used.includes(c.id)) &&
      !run.recent.includes(c.id) &&
      eligible(c));
    // If we somehow exhausted the pool, forget recent history.
    const candidates = pool.length ? pool : CARDS.filter((c) => !c.followup && !c.once && eligible(c));
    const total = candidates.reduce((sum, c) => sum + (c.weight || 1), 0);
    let r = Math.random() * total;
    for (const c of candidates) {
      r -= c.weight || 1;
      if (r <= 0) return c.id;
    }
    return candidates[candidates.length - 1].id;
  }

  function currentCard() { return CARD_BY_ID[run.current]; }

  function checkEnd() {
    for (const k of METERS) {
      if (run.m[k] <= 0) return `${k}0`;
      if (run.m[k] >= MAX) return `${k}1`;
    }
    return null;
  }

  function applyChoice(side) {
    const card = currentCard();
    const choice = card[side] || {};
    const fx = choice.fx || {};

    METERS.forEach((k) => {
      if (!fx[k]) return;
      run.m[k] = clamp(run.m[k] + fx[k]);
      const meter = el.meters[k];
      meter.classList.remove('up', 'down');
      void meter.offsetWidth; // restart animation
      meter.classList.add(fx[k] > 0 ? 'up' : 'down');
    });

    asList(choice.set).forEach((f) => { if (!run.flags.includes(f)) run.flags.push(f); });
    asList(choice.clear).forEach((f) => { run.flags = run.flags.filter((x) => x !== f); });
    if (choice.next) run.scheduled.push({ ids: asList(choice.next), at: run.week + 1 + (choice.delay ?? 3) });

    if (card.once) run.used.push(card.id);
    run.recent.push(card.id);
    if (run.recent.length > RECENT_LIMIT) run.recent.shift();
    run.week += 1;
  }

  // ---------- Rendering ----------
  function renderMeters() {
    METERS.forEach((k) => {
      const v = run.m[k];
      const meter = el.meters[k];
      meter.querySelector('.fill').style.height = `${v}%`;
      meter.classList.toggle('danger', v <= 20 || v >= 80);
      meter.setAttribute('aria-label', `${METER_NAMES[k]}: ${v} of ${MAX}`);
    });
  }

  function renderCard() {
    const card = currentCard();
    const who = CHARACTERS[card.who];
    el.question.textContent = typeof card.text === 'function' ? card.text(run) : card.text;
    el.portrait.textContent = who.emoji;
    el.card.style.background = `radial-gradient(circle at 50% 35%, ${who.color}, ${shade(who.color)} 85%)`;
    el.whoName.textContent = who.name;
    el.whoRole.textContent = who.role;
    el.choiceL.textContent = (card.l && card.l.t) || '...';
    el.choiceR.textContent = (card.r && card.r.t) || '...';
    el.tenure.textContent = `Week ${run.week + 1}`;
    el.cisoName.textContent = `CISO #${run.cisoNo} ${run.name}`;
  }

  function shade(hex) {
    const n = parseInt(hex.slice(1), 16);
    const f = (c) => Math.round(c * 0.45).toString(16).padStart(2, '0');
    return `#${f(n >> 16)}${f((n >> 8) & 255)}${f(n & 255)}`;
  }

  function setPreview(side) {
    const fx = side ? ((currentCard()[side] || {}).fx || {}) : {};
    METERS.forEach((k) => {
      const v = Math.abs(fx[k] || 0);
      el.meters[k].classList.toggle('preview-sm', v > 0 && v < 15);
      el.meters[k].classList.toggle('preview-lg', v >= 15);
    });
    el.choiceL.classList.toggle('show', side === 'l');
    el.choiceR.classList.toggle('show', side === 'r');
  }

  function enterCard() {
    el.card.classList.remove('fly', 'animate', 'dragging');
    el.card.style.transform = '';
    el.card.classList.remove('enter');
    void el.card.offsetWidth;
    el.card.classList.add('enter');
    renderCard();
  }

  // ---------- Game flow ----------
  function startGame(fresh) {
    if (fresh || !run) newRun();
    renderMeters();
    enterCard();
    setPreview(null);
    el.hint.classList.toggle('hidden', run.week > 2);
    show('game');
    busy = false;
  }

  function commit(side) {
    if (busy) return;
    busy = true;
    setPreview(null);
    const dir = side === 'l' ? -1 : 1;
    el.card.classList.remove('animate', 'dragging');
    el.card.classList.add('fly');
    el.card.style.transform = `translate(${dir * window.innerWidth}px, 80px) rotate(${dir * 30}deg)`;

    applyChoice(side);
    renderMeters();
    el.hint.classList.toggle('hidden', run.week > 2);

    const ending = checkEnd();
    if (ending) {
      store.save();
      setTimeout(() => gameOver(ending), 750);
      return;
    }
    run.current = drawCard();
    store.save();
    setTimeout(() => { enterCard(); busy = false; }, 320);
  }

  function gameOver(key) {
    const d = store.data;
    const e = ENDINGS[key];
    const weeks = run.week;
    const isNewEnding = !d.endings[key];
    const isBest = weeks > d.best;
    d.endings[key] = (d.endings[key] || 0) + 1;
    if (isBest) d.best = weeks;
    d.prevName = `${run.name}`;
    d.prevWeeks = weeks;
    d.run = null;
    store.save();

    $('over-emoji').textContent = e.emoji;
    $('over-title').textContent = e.title;
    $('over-text').textContent = e.text;
    const found = Object.keys(d.endings).length;
    $('over-stats').innerHTML = `
      CISO #${run.cisoNo} <strong>${run.name}</strong><br>
      Tenure: <strong>${formatTenure(weeks)}</strong>${isBest ? ' <span class="new">NEW RECORD</span>' : ''}<br>
      Best tenure: <strong>${formatTenure(d.best)}</strong><br>
      Endings found: <strong>${found}/${Object.keys(ENDINGS).length}</strong>${isNewEnding ? ' <span class="new">NEW</span>' : ''}`;
    show('over');
    gameOver.last = { title: e.title, weeks };
    run = null;
    busy = false;
  }

  function renderTitle() {
    const d = store.data;
    const btn = $('btn-start');
    if (d.run) {
      btn.textContent = `Back to work (week ${d.run.week + 1})`;
    } else {
      btn.textContent = d.cisoCount ? 'Hire a new CISO' : 'Accept the job offer';
    }
    const found = Object.keys(d.endings).length;
    $('title-stats').innerHTML = d.cisoCount
      ? `CISOs fired: ${d.cisoCount - (d.run ? 1 : 0)}<br>Best tenure: ${formatTenure(d.best)}<br>Endings: ${found}/${Object.keys(ENDINGS).length}`
      : 'Average CISO tenure is about 2 years.<br>Let\'s see how you do.';
    show('title');
  }

  function renderEndings() {
    const d = store.data;
    const grid = $('endings-grid');
    grid.innerHTML = '';
    Object.entries(ENDINGS).forEach(([key, e]) => {
      const got = d.endings[key];
      const how = `${METER_NAMES[key[0]]} ${key[1] === '0' ? 'hits zero' : 'maxes out'}`;
      const div = document.createElement('div');
      div.className = `ending${got ? '' : ' locked'}`;
      div.innerHTML = `<div class="e-emoji">${e.emoji}</div><div class="e-title">${got ? e.title : '???'}</div><div class="e-how">${how}</div>`;
      grid.appendChild(div);
    });
    $('endings-count').textContent = `${Object.keys(d.endings).length} of ${Object.keys(ENDINGS).length} discovered`;
    show('endings');
  }

  async function share() {
    const last = gameOver.last;
    const text = last
      ? `I lasted ${formatTenure(last.weeks)} as CISO before "${last.title}". Can you do better?`
      : 'Can you survive as a CISO?';
    const url = location.href.split('#')[0];
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Reign of CISO', text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast('Copied to clipboard');
    } catch (e) { /* user cancelled */ }
  }

  // ---------- Input: swiping ----------
  const drag = { active: false, id: null, x0: 0, y0: 0, dx: 0, dy: 0, moved: false };

  function sideFor(dx) {
    if (dx <= -SWIPE_PREVIEW) return 'l';
    if (dx >= SWIPE_PREVIEW) return 'r';
    return null;
  }

  function setCardTransform(dx, dy) {
    el.card.style.transform = `translate(${dx}px, ${dy * 0.25}px) rotate(${dx * 0.07}deg)`;
  }

  el.card.addEventListener('pointerdown', (e) => {
    if (busy || !run) return;
    drag.active = true;
    drag.id = e.pointerId;
    drag.x0 = e.clientX;
    drag.y0 = e.clientY;
    drag.dx = drag.dy = 0;
    drag.moved = false;
    el.card.setPointerCapture(e.pointerId);
    el.card.classList.remove('animate', 'enter');
    el.card.classList.add('dragging');
  });

  el.card.addEventListener('pointermove', (e) => {
    if (!drag.active || e.pointerId !== drag.id) return;
    drag.dx = e.clientX - drag.x0;
    drag.dy = e.clientY - drag.y0;
    if (Math.abs(drag.dx) > 4) drag.moved = true;
    setCardTransform(drag.dx, drag.dy);
    setPreview(sideFor(drag.dx));
  });

  function endDrag(e) {
    if (!drag.active || e.pointerId !== drag.id) return;
    drag.active = false;
    el.card.classList.remove('dragging');
    if (Math.abs(drag.dx) >= SWIPE_COMMIT) {
      commit(drag.dx < 0 ? 'l' : 'r');
      return;
    }
    el.card.classList.add('animate');
    if (!drag.moved) {
      // A tap: wiggle to teach swiping.
      el.card.style.transform = 'translate(-18px,0) rotate(-2deg)';
      setTimeout(() => { el.card.style.transform = ''; }, 160);
    } else {
      el.card.style.transform = '';
    }
    setPreview(null);
  }
  el.card.addEventListener('pointerup', endDrag);
  el.card.addEventListener('pointercancel', endDrag);

  // Keyboard: hold an arrow to preview, release to choose.
  let keySide = null;
  document.addEventListener('keydown', (e) => {
    if (!el.screens.game.classList.contains('active') || busy) return;
    const side = e.key === 'ArrowLeft' ? 'l' : e.key === 'ArrowRight' ? 'r' : null;
    if (!side) return;
    e.preventDefault();
    if (keySide === side) return;
    keySide = side;
    el.card.classList.add('animate');
    setCardTransform(side === 'l' ? -60 : 60, 0);
    setPreview(side);
  });
  document.addEventListener('keyup', (e) => {
    const side = e.key === 'ArrowLeft' ? 'l' : e.key === 'ArrowRight' ? 'r' : null;
    if (!side || side !== keySide) return;
    keySide = null;
    if (!el.screens.game.classList.contains('active')) return;
    commit(side);
  });

  // ---------- Buttons ----------
  $('btn-start').addEventListener('click', () => {
    if (store.data.run) {
      run = store.data.run;
      startGame(false);
    } else {
      startGame(true);
    }
  });
  $('btn-again').addEventListener('click', () => startGame(true));
  $('btn-menu').addEventListener('click', renderTitle);
  $('btn-share').addEventListener('click', share);
  $('btn-endings').addEventListener('click', renderEndings);
  $('btn-endings-back').addEventListener('click', renderTitle);

  // ---------- Boot ----------
  store.load();
  // Drop a saved run if its current card no longer exists (deck changed between versions).
  if (store.data.run && !CARD_BY_ID[store.data.run.current]) store.data.run = null;
  renderTitle();

  // Expose a tiny hook for automated testing.
  window.__reign = { get run() { return run; }, commit, store, drawCard: () => drawCard() };
})();
