# BIGOLE Knockout Cup

Standalone landscape-only Top 8 finals bracket.

## Data

The app reads `data/live.json` every 60 seconds.

- Week 1 displays league points.
- Weeks 2–4 display each finals round score.
- Tim is removed before the top eight are seeded.
- The bracket routing follows the SuperCoach Top 8 structure:
  - QF1 winner → PF1
  - QF2 winner → PF2
  - QF1 loser + EF1 winner → SF1
  - QF2 loser + EF2 winner → SF2
  - SF1 winner → PF2
  - SF2 winner → PF1
  - PF winners → Grand Final
