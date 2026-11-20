# Vice Platinum — GTA VI Trophy Guide & Tracker

![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)
![Entry rank](https://make.fun/badge/gta6-trophy-guide-01/jembot21/gta6-trophy-guide/rank.svg)
![Entry reward](https://make.fun/badge/gta6-trophy-guide-01/jembot21/gta6-trophy-guide/reward.svg)

An independent entry for the [make.fun GTA VI trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01). Vice Platinum turns the supplied 55-trophy PlayStation 5 list into an original, offline field guide and personal progress tracker.

- All official names, descriptions and grades, with 55 original cited guides.
- Saved earned progress, per-grade totals, manual counters and private trophy notes.
- Kind, grade, search and unearned filters; spoiler shielding for unearned story trophies across every view.
- Six-stage platinum roadmap, four inferred missable precautions and a next-five queue.
- JSON export/import for earned trophies, counts, notes and spoiler preference; explicit reset confirmation.
- Warm paper, serif display typography, pink and teal accents; responsive keyboard-accessible interface with no images, webfonts or external requests.

Run `node serve.ts`, then open http://localhost:8080. Alternatively, use any static HTTP server with `app/` at its root. No build step or application dependencies are required. The app works without internet once served locally; progress stays in this browser's localStorage under `vice-platinum-v1`. Export before changing devices or clearing browser data.

## Sources & scope

The supplied official list attributes names, descriptions and grades to **Exophase — Grand Theft Auto VI (PS5) trophy list**, with **PSNProfiles — GTA VI trophy list** for cross-checks and progress targets. **GTA Wiki (gta.fandom.com)** supplies world terminology where relevant. Each trophy includes its own named source line. Guide prose is original interpretation of those descriptions, not a copied walkthrough. Specific locations and mechanics not established by the descriptions remain explicitly unconfirmed. Missable flags are inferred and will be confirmed once the game is out. Manual counts are not a PlayStation integration. No affiliation with Rockstar Games.

## Reproduce the entry

Install screenshot tooling with `npm install playwright` and `npx playwright install chromium`. Run `node tools/shots.mjs` to launch the local server, verify behavior and capture four seeded 1280×800 JPEGs. The script prints dimensions and enforces the 256 KiB limit. It also checks exact starter trophy fields, all guides and stage membership.

Run `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` to copy the app and screenshots into the hand-in directory and write `out/dossier.json`. The vendor hand-in logic is unchanged.
