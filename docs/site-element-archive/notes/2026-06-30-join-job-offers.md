# Join Page Job Offers

Status: archived
Date archived: 2026-06-30
Original source:
- `nous-rejoindre/index.html` `.join-jobs__grid`
- `nous-rejoindre/stage-communication-marketing/index.html`
- `nous-rejoindre/stage-developpement-commercial/index.html`
Archive location:
- `docs/site-element-archive/pages/2026-06-30-nous-rejoindre-jobs-before-empty-state.html`
- `docs/site-element-archive/pages/2026-06-30-stage-communication-marketing.html`
- `docs/site-element-archive/pages/2026-06-30-stage-developpement-commercial.html`
- `docs/site-element-archive/styles/2026-06-30-join-job-offers-selectors.css`
Type: section/page/style

## Why It Was Removed

The public job offers are paused for now. The live join page now shows an empty state with a spontaneous application CTA instead of active offer cards.

## Live References Removed

- `nous-rejoindre/index.html` offer cards and offer-detail links.
- `nous-rejoindre/stage-communication-marketing/index.html`
- `nous-rejoindre/stage-developpement-commercial/index.html`
- `pages.css` selectors for `.join-job-card*` and `.job-offer*`.

## Snapshot

Full HTML snapshots and the removed CSS fragment are stored in the archive locations above.

## Dependencies

- CSS selectors: `.join-job-card*`, `.job-offer*`
- JS hooks: none
- Asset paths: existing shared brand/header/footer assets only
- Related generator/template files: none

## Restore Checklist

- [ ] Restore `nous-rejoindre/index.html` offer cards from the archived page snapshot.
- [ ] Restore the relevant offer detail page snapshot(s) under `nous-rejoindre/`.
- [ ] Restore required CSS from `docs/site-element-archive/styles/2026-06-30-join-job-offers-selectors.css`.
- [ ] Remove or adapt the empty state if active offers are shown again.
- [ ] Update `docs/site-element-archive/manifest.md`.
- [ ] Run `rg -n "join-job-card|job-offer|stage-communication-marketing|stage-developpement-commercial" .`.
- [ ] Run `npm.cmd run build` if rendered pages changed.
