# Game modes

Each file here registers one mode on `window.REIGN_MODES[id]` and is loaded by `index.html` before `js/game.js`.

A mode object has:

| Field | Meaning |
|---|---|
| `id`, `label`, `setting`, `blurb` | Shown on the mode picker |
| `tagline` | Three lines shown under the title (HTML allowed) |
| `meters` | `{ b, s, t, m }`, each `{ name, icon }`. The keys are fixed; only labels change per mode |
| `firstNames`, `epithets` | Used to name each new CISO |
| `tenureHint` | Shown on the title screen before the first run |
| `characters` | `{ key: { name, role, emoji, color } }` |
| `cards` | The deck (see below). Must include a `welcome` card |
| `endings` | `b0 b1 s0 s1 t0 t1 m0 m1`: what happens when that meter hits 0 or 100 |

## Cards

```js
{
  id: 'dev_mfa', who: 'dev',
  text: 'Can I disable MFA on the production deploy account?',
  l: { t: 'Absolutely not', fx: { s: 5, m: -10 } },
  r: { t: 'Just this once', fx: { s: -15, m: 10 } },
}
```

`text` can also be a function of the run state, e.g. `(st) => ...`. A choice (`l` / `r`) can have:

- `t`: label shown while swiping
- `fx`: meter changes, e.g. `{ b: -10, s: 5 }`
- `set` / `clear`: flag(s) to set or clear for the rest of the run
- `next`: follow-up card id, or a list of ids where the first one whose requirements pass is used
- `delay`: weeks until the follow-up shows up (default 3)

Card options:

- `followup`: only appears when scheduled by a `next`
- `once`: appears at most once per run
- `requires` / `excludes`: flags that must / must not be set
- `cond`: `function(state) => boolean`, where `state.m` holds the meters
- `weight`: relative draw chance (default 1)

Run `node tools/check-cards.js` after editing to validate every mode.
