# TransFIRA: Transfer Learning for Face Image Recognizability Assessment

Website source for [TransFIRA](https://transfira.github.io/).

Built as plain HTML, CSS and JavaScript — no framework and no build step, so what is in the
repository is what the browser gets. The notes below cover the parts that are not obvious from
reading the markup.

---

## Credits

**Template.** This site began as the excellent academic paper template by the authors of  
**Nerfies**  
https://github.com/nerfies/nerfies.github.io

Huge thanks to them for open-sourcing a clean, well-structured starting point. The page has since
been substantially rewritten — the stylesheets, the JavaScript and the media pipeline are our own —
but the page architecture and much of the class vocabulary (`publication-title`,
`publication-authors`, `author-block`, the footer glyph row) are still theirs, and these pages
would not look the way they do without it.

**Libraries.** [Bulma](https://bulma.io/) (MIT), purged to the rules this page uses;
[Font Awesome](https://fontawesome.com/) and [Academicons](https://jpswalsh.github.io/academicons/)
(SIL OFL 1.1), subset to the glyphs in use; [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans)
(SIL OFL 1.1), self-hosted; [MathJax](https://www.mathjax.org/) and
[PDF.js](https://mozilla.github.io/pdf.js/) (Apache 2.0), both loaded from a CDN on demand.

**Licence.** The Nerfies template is released under
[CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/), so this site is offered under the
same terms. If you build on it, please credit both Nerfies and this repository, and pass the same
terms along.

---

## Performance

- **Purged Bulma.** Only the rules this page actually uses are shipped — 11 KB of the
  framework's ~200 KB. jQuery, bulma-carousel and the full Font Awesome bundle are gone
  entirely. Because the purge is per-site, each of these pages carries a slightly different
  subset.
- **Self-hosted, subset fonts.** Noto Sans is served as a variable font subset from this repo
  rather than from Google's CDN, which removed a third-party round-trip before any text could
  paint. The icon fonts are subset to only the glyphs in use — 13 of Font Awesome's ~2000
  and Academicons' ~150, about 3 KB in total. Regenerate with `tools/build-webfonts.sh`, which
  scans the markup and JavaScript for the classes actually referenced, so no list needs
  maintaining by hand, and refuses to finish if a glyph is missing an outline or a stylesheet
  rule.
- **`cache_bust.py`** stamps a version query on every local asset — in the HTML, in `url()`
  inside our own stylesheets, and in versioned URLs built in JavaScript. Covering all three
  matters: a `<link rel="preload">` and the `@font-face` `url()` it preloads must agree
  byte-for-byte, query string included, or the browser treats them as two resources and the
  preload is wasted.

## Light and dark themes

- **`theme.css` + `theme-switcher.js`.** Every colour resolves through a custom property, so a
  theme is one attribute on `<html>` rather than a cascade of overrides. The sun/moon glyph in
  the footer colophon toggles it and the choice persists in `localStorage`.
- **Light is the default, deliberately.** There is no `prefers-color-scheme` detection: these
  are paper pages usually reached from a link and read once, and the light rendering is the one
  the figures were authored against. Dark is opt-in.
- **No flash.** A small inline script at the very top of `<head>` sets the theme before the
  first paint. A deferred file would let the page paint light and then correct itself.
- **Dark is a palette, not an inversion.** Inverting a page turns drop shadows into glows and
  makes the link blue vibrate. The dark values are chosen against the surface each one actually
  sits on, and every text colour clears WCAG AA with room to spare.
- **Paper figures get a light card in dark mode.** Plots and tables lifted from the paper have a
  white background baked into the image; on a dark page they would become glowing rectangles
  whose black text you had to read out of a bright panel. They are set on a light card instead,
  so the white reads as a sheet of paper laid on the page — which is how the figure looks in the
  PDF anyway. Inverting them was rejected: it would wreck the colour-coded cells and highlight
  swatches that carry meaning.

## Accessibility

- Landmarks and a heading outline that follows the document, one `<h1>` per page.
- Every image has a meaningful `alt`; every link and control has a discernible name.
- Visible focus rings on everything focusable, in both themes.
- `prefers-reduced-motion` disables the hover polish and the theme transition.
- Long words wrap rather than overflow: Bulma sets `html { overflow-x: hidden }`, so an
  overflowing word is clipped and unreachable rather than merely off-screen.
- Display equations shrink to fit a narrow screen instead of scrolling. MathJax writes its own
  `font-size` inline, so the scaling is a transform on the inner box; a scroll container is
  retained underneath for anything the scaling cannot rescue, so nothing is ever unreachable.

## Repository layout

```text
.
├── index.html
├── static/
│   ├── css/
│   │   ├── bulma.min.css         # purged to this page's rules
│   │   ├── icons.css             # @font-face + the glyphs in use
│   │   ├── index.css             # this page's own styles
│   │   ├── interactions.css      # hover and focus polish
│   │   ├── noto-sans.css         # self-hosted body typeface
│   │   ├── pdf-modal.css         # shared with the sibling sites
│   │   ├── rhythm.css            # vertical spacing scale, footer layout
│   │   └── theme.css             # colour tokens, both themes, the colophon
│   ├── js/
│   │   ├── math-fit.js           # scales display equations to narrow screens
│   │   ├── pdf-modal.js          # focus-trapped PDF overlay, PDF.js on demand
│   │   ├── script.js             # BibTeX copy button
│   │   └── theme-switcher.js     # light/dark, persisted in localStorage
│   ├── webfonts/            # subset icon fonts + Noto Sans
│   ├── images/              # stills, figures, favicons
│   └── files/               # poster PDF + its scaled-down viewer copy
├── tools/
│   ├── build-webfonts.sh    # rebuild the font subsets
│   └── build-media.sh       # re-encode video from the HQ masters
├── cache_bust.py            # stamp ?v= on every local asset
├── run_server.sh
├── robots.txt
└── sitemap.xml
```

## The moving parts

- **In-page PDF viewer** (`pdf-modal.js`)  
  Opens any PDF link in a focus-trapped overlay, loading PDF.js from cdnjs on first use rather than shipping it, and falling back to the browser's own viewer on mobile. A poster link is rewritten to its `_viewer.pdf` twin before being handed to the iframe — a conference poster is authored at print resolution, so the original is several megabytes that no on-screen reader needs.
- **Footer colophon** (`.colophon` in `theme.css`)  
  Copyright, theme toggle and source link on one line, after the row of paper glyphs. The two `&middot;` separators are literal text in the markup: they are punctuation between three peers, not decoration. The toggle is a `<button>` rather than an `<a>` because it acts on this page instead of going anywhere, and it inherits its `font-size` from the line rather than being pinned to the glyph row's 25px, so it stays the size of the copyright beside it at every breakpoint. The source glyph takes the glyph row's lift-and-glow on hover rather than the sliding underline that every other link inside a `.content` paragraph gets — hence the `:not(.colophon)` on those prose selectors. The toggle is excluded from the lift, since it already answers a hover by setting the sun and raising the moon. The copyright year is the paper's publication year, not the current one: these pages are archival, so a fixed year needs no yearly re-stamping and cannot drift.

## Related project websites

These paper pages share this foundation — the same purged Bulma, the self-hosted font subsets,
the theme switcher, `cache_bust.py` and the `tools/` scripts. Where a fix applies
to all of them it is made in each, so the shared files are byte-identical once the version query
strings are normalised. Read any of them as reference code, and borrow freely:

- **[PUP 3D-GS](https://pup3dgs.github.io/)** — [source](https://github.com/pup3dgs/pup3dgs.github.io)
- **[Speedy-Splat](https://speedysplat.github.io/)** — [source](https://github.com/speedysplat/speedysplat.github.io)
- **[SpeeDe3DGS](https://speede3dgs.github.io/)** — [source](https://github.com/speede3dgs/speede3dgs.github.io)
- **[SplatSuRe](https://splatsure.github.io/)** — [source](https://github.com/splatsure/splatsure.github.io)

My personal site, **[tuallen.github.io](https://tuallen.github.io/)**
([source](https://github.com/tuallen/tuallen.github.io)), is a separate lineage — a different
template, no Bulma, its own component system — but the carousel behaviour, the theme toggle and
the cache-busting approach here were all worked out there first, so it is the closest thing to a
reference implementation for those.

If you are starting a paper page from scratch, take Nerfies as the base and treat these as worked
examples of where to go next. Anything from these repositories carries the CC BY-SA 4.0 terms
noted above.

## Local development

```sh
./run_server.sh          # serve at http://localhost:8000
python3 cache_bust.py    # dry run: show which asset versions would change
python3 cache_bust.py --apply
tools/build-webfonts.sh  # regenerate the font subsets after adding an icon
```
