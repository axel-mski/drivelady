# Site Element Archive

This folder is the parking area for site elements we remove from the live Drive Lady website but may want to reuse later.

It is intentionally outside the public route map:

- Do not add `index.html` files here.
- Do not add this folder to `STATIC_ROUTES`.
- Do not reference archived assets from live HTML, CSS, or JS unless an element is restored.

## Folder Map

- `sections/` - reusable HTML sections, cards, nav blocks, banners, CTAs, and page modules.
- `pages/` - full-page snapshots when an entire route is removed or rebuilt.
- `copy/` - text blocks, headlines, testimonials, claims, FAQs, or CTA wording.
- `styles/` - CSS fragments that were removed from `styles.css`, `pages.css`, or component CSS.
- `assets/` - images, icons, and other media removed from the live site.
- `notes/` - decision notes for upcoming changes.
- `templates/` - reusable archive entry templates.

## Workflow

1. Before removing a live element, copy its source into the closest archive folder.
2. Create an archive note from `templates/removed-element.md`.
3. Add a row to `manifest.md`.
4. Remove the element from the live HTML, CSS, JS, and generator files.
5. Search for leftovers with `rg`.
6. Run `npm.cmd run build` when the change affects site behavior or rendered pages.

## Naming

Use date-prefixed filenames:

```text
YYYY-MM-DD-short-element-name.md
YYYY-MM-DD-short-element-name.html
YYYY-MM-DD-short-element-name.css
```

Keep source paths and restore notes inside each archive note so the element can be reintroduced without guessing.
