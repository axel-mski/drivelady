# Home App Preview And Ride Search

Status: archived
Date archived: 2026-06-24
Original source: `index.html`
Archive locations:

- `docs/site-element-archive/sections/2026-06-24-home-hero-app-showcase.html`
- `docs/site-element-archive/sections/2026-06-24-home-ride-search-band.html`

## Why It Was Removed

The homepage app preview and the "Trouver ou proposer" ride-search form were removed from the live homepage because the corresponding app experience is not ready and connected yet.

Update: the removed phone/app preview was temporarily replaced on the live homepage by a bottom-anchored photo strip (`.hero-trip-strip`). This replacement is only a holding state while waiting for the real app screenshots.

## Temporary Live Replacement

Current live placeholder:

- `index.html` `.hero-trip-strip`
- `styles.css` `.hero-trip-strip`
- `styles.css` `.hero-trip-card`
- `styles.css` `.hero::before` temporary circular backdrop (now removed from the live homepage)
- `styles.css` `.hero` bottom ellipse radial-gradient (now removed from the live homepage)
- `assets/hero-trip-night-generated.webp`
- `assets/hero-trip-daily-generated.webp`
- `assets/hero-trip-weekend-generated.webp`

Intent of the placeholder:

- Keep the homepage visually complete after removing the phone mockups.
- Avoid showing app screenshots or ride-search UI before the real connected app is ready.
- Use realistic, diverse ride-share lifestyle photography as a temporary brand-safe visual.

Recent live changes:

- Removed the old `.hero__showcase` phone/app mockup from `index.html`.
- Removed the old `.search-band` ride-search/propose form from `index.html`.
- Added the bottom-anchored `.hero-trip-strip` photo row in the homepage hero.
- Removed the visible tag/pill labels from those hero photos.
- Removed the old hero down-arrow link `.hero__scroll` because the next section is already visible.
- Regenerated the three temporary hero photos to avoid duplicating the `#trajets` card imagery below: exterior night pickup, open-trunk daily/campus prep, and outdoor weekend meetup.
- Removed the large temporary pink circular backdrop behind the homepage photo strip so the photos sit directly on the hero background.

Temporary hero photo direction:

- Realistic documentary/lifestyle photography, not app screenshots.
- Diverse women and varied color accents.
- Real carpool situations with visible texture, grain, focus falloff, and natural lighting.
- Avoid duplicating the existing `#trajets` images and avoid in-car laughing-driver/passenger compositions as the only visual pattern.

## Live References Removed

- `index.html` `.hero__showcase`
- `index.html` `.search-band`
- `index.html` `[data-ride-form]`
- Homepage copy: "Trouver ou proposer"
- Homepage copy: "Prépare ton trajet"
- Homepage sample route values: "Lorient", "Saint-Denis", "22:30"

## Dependencies

- CSS selectors: `.hero__showcase`, `.app-panel`, `.phone-frame`, `.search-band`, `.ride-form`, `.address-field`, `.ride-time-field`
- JS hooks: `[data-ride-form]`, `[data-form-message]`, `[data-address-input]`, `[data-address-suggestions]`, `buildAppSearchUrl`
- Asset paths: `./assets/drive-lady-logo.png`, `./assets/drive-lady-hero.avif`

The phone-style selectors are now kept only for archive/restore safety; `comment-ca-marche/index.html` uses a temporary photo card instead of the phone mockup. The ride-search JS also remains safe because it already guards against a missing `[data-ride-form]`.

## Restore Checklist

- [ ] Restore the `.hero__showcase` snippet below the homepage hero copy.
- [ ] Restore the `.search-band` snippet before `#trajets`.
- [ ] Remove the temporary `.hero-trip-strip` markup from `index.html`.
- [ ] Remove or ignore the temporary `.hero-trip-strip` and `.hero-trip-card` CSS in `styles.css`.
- [ ] Restore or ignore the archived circular backdrop only if the temporary homepage photo strip needs that visual support again.
- [ ] Confirm the real app route/search flow is live.
- [ ] Verify `app.localhost` and production app URLs.
- [ ] Run `rg -n "data-ride-form|hero__showcase|Trouver ou proposer" .`.
- [ ] Run `npm.cmd run build`.
