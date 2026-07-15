# BIGOLE Knockout Cup — HD Landscape + Admin Finalisation

A standalone GitHub Pages finals bracket. Tim is excluded before seeding.

## What the admin switch does

The lock button opens a Supabase email/password login. After SuperCoach publishes the corrected final round totals, the admin switches the current finals week to FINAL and confirms.

Only the current finals week is processed:

- Week 1 locks QF1, EF1, EF2 and QF2; elimination losers are removed; qualifying losers receive their double chance; Week 2 is populated.
- Week 2 locks both semi-finals and populates the preliminary finals.
- Week 3 locks both preliminary finals and populates the grand final.
- Week 4 locks the grand final and declares the champion.

A tied matchup is awarded to the higher original seed.

## Supabase setup

1. Create or use a Supabase project.
2. Run `supabase-setup.sql` in Supabase SQL Editor.
3. In Authentication, create one admin user using email and password.
4. Open Project Settings > API.
5. Paste the Project URL and anon/public key into `config.js`.
6. Upload all files to the separate `bigole-knockout-cup` GitHub repository.

Do not put a plain password in JavaScript. Supabase verifies the password and stores the shared bracket state.

## Live scores

`data/live.json` remains the score feed. A future verified SuperCoach importer updates standings and `roundScore`. The admin switch does not invent scores; it freezes the latest scores already supplied by the feed.
