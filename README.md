# BIGOLE Knockout Cup

Standalone one-page finals app.

## Current state
- Tim is excluded before seeding.
- The remaining league ladder is reseeded automatically.
- The current Top 8 is rendered into the correct four-week finals bracket.
- Current data is a snapshot from the supplied screenshots.

## Live-data contract still required
Do not claim the app is live until the authenticated SuperCoach network endpoint is identified and tested.

Expected live payload fields:
- season
- round
- regularRoundsRemaining
- standings: team name, coach, league points, total points
- finals matchup live scores once finals begin

The UI should consume a generated `competition.json` or an authenticated backend endpoint. Never place SuperCoach login details or session tokens in this public repository.
