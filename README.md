# BIGOLE Knockout Cup

Standalone one-page landscape finals bracket.

## Data contract

The app polls `data/live.json` every 60 seconds.

- During `phase: regular`, each card shows league points and teams are re-seeded after excluding Tim.
- During `phase: finals`, each card shows the current round score.
- `finals.matches` controls each matchup, status and winner.

The repository contains a manual snapshot only. A verified SuperCoach importer or GitHub Action must update `data/live.json` for true live operation.
