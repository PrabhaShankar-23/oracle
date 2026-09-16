# Responsive guide

Rules for every page and component in this app. The breakpoints and layout constants live in
`src/theme/theme.ts` — never hard-code different values.

## Breakpoints (M3 window size classes)

| Key  | Min width | M3 class     | Layout                                                     |
| ---- | --------- | ------------ | ---------------------------------------------------------- |
| `xs` | 0         | Compact      | One column. Hamburger → `NavDrawer`. Search opens a full-screen dialog. |
| `sm` | 600       | Medium       | Two-column card grids. Filters/controls can sit in a row.  |
| `md` | 840       | Medium+      | App bar shows `SectionMenus` dropdowns and inline search.  |
| `lg` | 1200      | Expanded     | Sticky side rails appear (table of contents, pattern list). |
| `xl` | 1600      | Large        | Content stays capped at `CONTENT_MAX_WIDTH` (1280px).      |

Test at **360, 390, 600, 840, 1024, 1280 and 1440px** wide. There must never be horizontal page
scroll: `document.documentElement.scrollWidth === window.innerWidth` at every width.

## Layout rules

1. **Wrap every page in `PageContainer`.** It sets the max width and the side gutters
   (16px compact, 24px medium, 32px expanded). Don't add page-level horizontal padding yourself.
2. **Use `PageHeader`** for breadcrumbs, the title (`h3` variant, scales with `clamp()`) and subtitle.
3. **Grids:** `Grid` with `size={{ xs: 12, sm: 6, lg: 4 }}` for cards, or CSS grid with
   `gridTemplateColumns` responsive values. Always give grid/flex children `minWidth: 0` when they
   hold code, tables or long words, or they will overflow.
4. **Side rails only at `lg` and up.** Below `lg`, move the same content into a `Drawer`
   opened by a button (see `CaseStudyPage` → Contents).
5. **Sticky elements** use `top: HEADER_HEIGHT + n`. Keep only the app bar and side rails sticky —
   a tall sticky toolbar hides deep-linked content on short screens.
6. **Decide layout-changing behaviour with `useMediaQuery(theme.breakpoints.up('md'))`**, and
   purely visual changes with responsive `sx` values (`{ xs: …, md: … }`). Don't mix both for the same thing.

## Content rules

- **Tables** must scroll inside their own box, never widen the page. `HtmlContent` wraps every
  `<table>` in `.table-scroll` automatically; React tables need `overflowX: 'auto'` on a wrapper.
- **Code blocks** use `overflowX: 'auto'`, smaller font on `xs` (`0.75rem`–`0.78rem`).
- **Diagrams** (Mermaid SVG) get `maxWidth: 100%` and their `figure` scrolls horizontally.
- **Long titles** use `textWrap: 'balance'`; long unbroken strings rely on `overflowWrap: 'anywhere'`.
- **Label/value rows** stack on `xs` (`gridTemplateColumns: { xs: '1fr', sm: '92px 1fr' }`).

## Touch and accessibility

- Minimum touch target **44×44px** (menu items, list buttons and chips are set in the theme).
- Every icon-only button has an `aria-label`; tooltips are not a substitute.
- Nothing may rely on hover alone — hover effects must have a tap equivalent
  (e.g. recall answers reveal on tap).
- Respect `prefers-reduced-motion` (handled globally in `MuiCssBaseline`).
- Use `100dvh`, not `100vh`, so mobile browser toolbars don't cut content off.

## Colour and theming

- Read colours from `theme.vars.palette.*` inside `sx={(t) => …}` so light/dark switch without re-rendering.
- Use M3 roles: `surface.container*` for backgrounds, `container.primary` / `container.onPrimary`
  for emphasis, `divider` / `surface.outlineVariant` for borders. Don't introduce raw hex values in components.

## Checklist before finishing a UI change

- [ ] `npm run build` and `npm run lint` pass
- [ ] No horizontal scroll at 360px and 390px
- [ ] Drawer, search dialog and dropdown menus work at compact width
- [ ] Deep links (`/page#id`) land below the app bar
- [ ] Checked in both light and dark mode
