# Reign of CISO 🛡️

A Reigns-style swipe game where you're the CISO. Swipe left or right on the decisions that land on your desk.

## Modes

- **Casual: CISO at a small startup.** Series A, 40 people, a very persistent vendor, the CEO's nephew and the office cat. Silly and forgiving.
- **Realistic: Group CISO at a large European bank.** ECB-supervised, DORA in force. Major-incident reporting clocks, TLPT, the Register of Information, third-party contracts, SWIFT CSP, GDPR, works councils and ransomware. The obvious answer is often wrong, and many cheap shortcuts come back weeks later as supervisory findings or incidents. Meters: Budget, Resilience, Supervisor and Business.

Each mode keeps its own best tenure, endings and saved run. Cards are randomly mirrored, so the sensible answer isn't always on the same side.

Casual meters:

| | Meter | Hits zero | Maxes out |
|---|---|---|---|
| 💰 | Budget | Bankrupt department | Investigated for hoarding |
| 🛡️ | Security | Totally pwned | So locked down nobody can work |
| 🎩 | Board trust | Scapegoated | Promoted into owning the printers |
| 🙂 | Morale | Your team quits | Nobody follows any rules |

You can't win. You can only last. Your tenure is counted in weeks, and every fired CISO is replaced by the next one.

## Playing

Mobile first: drag the card left or right. On desktop you can drag with the mouse or hold ← / → to preview a choice and release to confirm. While previewing, dots above the meters show which ones the choice will move (bigger dot, bigger change), but not which way.

## Running locally

It's plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## Deploying

`.github/workflows/pages.yml` publishes the site on every push to `main`. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions** once.

## Adding cards

Each mode lives in its own file in `js/modes/` (format documented in `js/modes/README.md`). A card looks like:

```js
{
  id: 'dev_mfa', who: 'dev',
  text: 'Can I disable MFA on the production deploy account?',
  l: { t: 'Absolutely not', fx: { s: 5, m: -10 } },
  r: { t: 'Just this once', fx: { s: -15, m: 10 } },
}
```

`fx` keys are `b` (budget), `s` (security), `t` (board trust) and `m` (morale). Choices can also `set` flags and schedule a follow-up card with `next` and `delay`; see `js/modes/README.md`. Run `node tools/check-cards.js` to validate every deck.
