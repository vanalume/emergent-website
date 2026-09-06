# CMS — Migrating the `richtext` type to a WYSIWYG editor (Quill.js)

> Status: **Reference doc** · Applies only if/when we upgrade `richtext` from plain
> multi-line text to a WYSIWYG editor with toolbar buttons (so non-technical admins
> never type `**`/`*` markup).
>
> Current v1 decision (locked): `richtext` is **plain multi-line text** — the admin
> types paragraphs with line breaks; italics/colour come from the component CSS.

---

## 1 · Why this doc exists

- Admins must not learn Markdown. A WYSIWYG editor gives them **Bold / Italic /
  Headings / Lists / Links** buttons.
- This documents exactly what changes in the **schema** and the **frontend
  structure** if we later swap the plain-text `richtext` for Quill.js.

---

## 2 · Schema changes

The `Section` model stays the same shape — the change is **what `value` holds** for
`type == "richtext"`:

```python
# Stage 1 (current plan) — plain text
{ "key": "belief_body", "type": "richtext", "value": "Luxury isn't loud, it is…" }

# After Quill — HTML string
{ "key": "belief_body", "type": "richtext", "value": "<p>Luxury isn't loud, it is…</p>" }
```

Key decisions:

| Topic | Recommendation |
|---|---|
| `value` format | **HTML string** (portable, re-exportable, sanitizable). Quill's native Delta (JSON ops) is Quill-specific — avoid it unless we standardise on Quill forever. |
| `Section.value` type | Already `Any` — no model change needed; `richtext` just becomes HTML. |
| Backward compat | No new field required. If we want to allow *both* plain and HTML during a rollout window, add `format: "plain" | "html"` (default `"html"`) — optional, can be skipped. |
| Validation | Backend does **not** need to parse HTML. Optionally store-as-received; sanitisation happens on render (see §4). |

---

## 3 · Backend changes

Minimal — the backend is storage-agnostic here:

1. `content.py` continues to read/write `value` as an opaque string. No schema change.
2. (Recommended) **Sanitise on write** as a second layer of defence, not the only one:
   a server-side HTML sanitizer (e.g. `bleach`) strips scripts/tags before `PUT`
   persists. The authoritative sanitisation remains client-side on render (§4).
3. The **JSON seed/export format is unchanged** — `value` simply becomes an HTML
   string for `richtext` keys. Backups and production migration work the same way.

---

## 4 · Frontend — retail (rendering)

Today `Home.jsx`/`About.jsx` render body copy inside styled JSX (e.g.
`<p className="font-read italic …">`). After Quill, `richtext` values are HTML, so:

1. New component **`components/RichText.jsx`**:
   - `dangerouslySetInnerHTML` after sanitising with **DOMPurify**.
   - Accepts a `className` so the existing typography styling still applies.
   - Empty/`<p></p>` values render nothing.
2. Home/About replace their hardcoded italic `<p>{body}</p>` with
   `<RichText html={sections.belief_body} className="font-read italic …" />`.
3. The hardcoded fallback (API-down) stays as-is: fallback values are plain text,
   which RichText wraps in `<p>` automatically.

**XSS note:** any admin-entered HTML must be DOMPurify-sanitised before
`dangerouslySetInnerHTML`. Never render raw stored HTML.

---

## 5 · Frontend — admin (editing)

Today the plan uses `FormField as="textarea"` for `richtext`. After Quill:

1. New primitive **`admin/primitives/RichTextEditor.jsx`**:
   - Wraps Quill with a toolbar: bold, italic, H2/H3, bullet list, ordered list,
     link, clean.
   - Props: `value` (HTML string), `onChange(html)`.
   - On mount: `quill.setContents(quill.clipboard.convert({ html: value }))`.
   - On change: emit `quill.root.innerHTML` (or `getSemanticHTML()`).
2. `admin/pages/Content.jsx` uses `RichTextEditor` for `richtext` sections instead
   of the textarea. `text`/`image`/`list_of_text`/`list` sections are unaffected.

---

## 6 · New dependencies

| Package | Purpose | Notes |
|---|---|---|
| `quill` | WYSIWYG core | v2 recommended |
| `dompurify` | Sanitise HTML on render | mandatory for XSS |
| `react-quill-new` (or a custom wrapper) | React binding | see React 19 caveat below |

**React 19 compatibility — the main risk:** the classic `react-quill@2` is stale and
relies on `findDOMNode`, which is removed in React 19 (the app is on React 19.0.0).
Recommend **a thin custom wrapper** around `quill` (`useRef` + `useEffect`), or
`react-quill-new`. Do **not** use `react-quill`.

---

## 7 · Data migration (plain text → HTML)

If/when we flip `richtext` to HTML, existing stored plain-text values are migrated:

1. Split on `\n\n` (paragraphs) and single `\n` (line breaks).
2. Wrap each paragraph in `<p>…</p>`.
3. Re-save via the seed script / export-import, so the current copy renders
   identically after the switch.

The migration is idempotent and can live in the `content_seed.py` script or a
one-off migration command.

---

## 8 · Testing

- **Round-trip:** admin types bold/italic → `PUT` → `GET` returns the HTML → retail
  renders it.
- **Sanitisation:** `<script>`, `onerror=`, `<img onload=…>` are stripped by
  DOMPurify before render.
- **Empty values:** empty string / `<p><br></p>` renders nothing and round-trips
  without error.
- **Fallback:** when the API is down, retail still renders the plain-text fallback.

---

## 9 · Checklist (if we decide to adopt Quill)

- [ ] Add `quill` + `dompurify` (+ React wrapper) to `package.json`.
- [ ] `components/RichText.jsx` (sanitise + render).
- [ ] `admin/primitives/RichTextEditor.jsx` (Quill wrapper).
- [ ] Wire both into `Content.jsx` + Home/About.
- [ ] Migration of existing plain-text `richtext` values → `<p>` HTML.
- [ ] Sanitisation test (XSS) + round-trip test.
