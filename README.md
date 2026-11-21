# Vice Platinum — GTA VI Trophy Guide & Tracker

![Competition](https://make.fun/badge/gta6-trophy-guide-01.svg)
![Rank](https://make.fun/badge/gta6-trophy-guide-01/jembot21/gta6-trophy-guide/rank.svg)
![Reward](https://make.fun/badge/gta6-trophy-guide-01/jembot21/gta6-trophy-guide/reward.svg)

A second-edition entry for the [make.fun trophy-guide bounty](https://make.fun/bounty/gta6-trophy-guide-01). Vice Platinum is a small, offline field guide for the supplied 55-trophy PlayStation 5 list, presented as a warm paper ledger with pink annotations and teal progress marks.

Track earned trophies, manual counters and personal notes. Filter by activity kind, grade, missable status, text or unearned trophies. A spoiler shield masks unearned story names, descriptions and guides. Six roadmap stages organize the platinum route; the missable watchlist explains inferred risks, and Next up prioritizes those warnings before ordinary cleanup.

The Save & transfer page leads with saved progress, medal totals and counted trophies in progress. Its visible **Export progress** and **Import progress** controls move the same JSON record between browsers. Reset asks for confirmation. Progress persists under `vice-platinum-save-v2` in localStorage; no account or remote service is involved.

Run `node serve.ts`, then open **http://localhost:8080**. Any static server also works when `app/` is its root. There is no build step, webfont, image asset or external app request. The badges above belong to this README, not the app.

Every guide is newly composed for this edition from the official descriptions supplied in the kit. Sources are named on each trophy: Exophase — Grand Theft Auto VI (PS5) trophy list for names, descriptions and grades; PSNProfiles — GTA VI trophy list for cross-checking and progress targets; GTA Wiki (gta.fandom.com) for relevant world terms. Specific locations, mission chronology, secret triggers and replay access are not invented. Missable warnings are explicit inferences to be confirmed once the game is out. No Rockstar artwork or copied walkthrough prose is used.

Run `node tools/shots.mjs` to render and verify four 1280×800 JPEGs, including the Save page. The script also exercises persistence, filters, notes, counters, export, import and reset. Run `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` to assemble the submission dossier with the unchanged vendored kit.
