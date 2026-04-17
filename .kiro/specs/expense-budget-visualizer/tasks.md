# Implementation Plan: Expense & Budget Visualizer

## Overview

Build a single-page vanilla JS/HTML/CSS expense tracker with no build step. Implementation proceeds in layers: static HTML shell → CSS styling → JS state/render core → feature-by-feature logic → persistence → theme toggle → final wiring and polish.

All code lives in three files: `index.html`, `css/styles.css`, and `js/app.js`.

## Tasks

- [x] 1. Create the HTML shell (`index.html`)
  - Create `index.html` with the full static markup as specified in the design: `app-wrapper`, `app-title`, header card (theme toggle button, balance label, `#total-balance`, `#budget-warning`, monthly-limit row), form card (`#transaction-form` with item-name, item-amount, item-category fields and inline error spans, full-width submit button), bottom-row grid (list card with `#transaction-list`, chart card with `#spending-chart` canvas and `#chart-legend`), and the category modal overlay (`#category-modal`) with name input, color picker, cancel and confirm buttons
  - Load Chart.js from CDN (`https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js`) before `js/app.js`
  - Add `novalidate` to the form element; add all `id` and `aria-label` attributes as specified in the design
  - _Requirements: 9.1, 9.2, 9.5, 1.1, 1.6, 2.4, 4.1, 5.2, 5.3, 6.1, 7.1, 10.1, 10.2_

- [x] 2. Implement base CSS (`css/styles.css`)
  - [x] 2.1 Define CSS custom properties and reset
    - Declare all color tokens (`--bg-page`, `--bg-card`, `--text-primary`, `--text-secondary`, `--color-blue`, `--color-green`, `--color-orange`, `--color-red`, `--border-color`, `--shadow`) with their light-mode values on `:root`
    - Add `body.dark` override block with dark-mode values for each token
    - Apply a minimal box-sizing reset (`*, *::before, *::after { box-sizing: border-box }`) and set `body` background to `var(--bg-page)`, font to system sans-serif
    - _Requirements: 9.3, 9.4, 7.2, 7.3, 7.5_

  - [x] 2.2 Style layout and cards
    - Style `.app-wrapper` (max-width 800px, centered, padding), `.app-title` (centered, bold, 1.5rem), `.card` (white bg, 12px border-radius, box-shadow, 24px padding, 16px bottom margin), `.bottom-row` (CSS Grid 1fr 1fr, 16px gap), and responsive collapse to single column below 600px
    - _Requirements: 9.1, 9.2, 9.4, 9.6_

  - [x] 2.3 Style header card components
    - Style `.header-card` (text-align center, position relative), `.theme-btn` (absolute top-right, no background, 1.25rem), `.balance-label` (0.75rem, uppercase, letter-spacing, secondary color), `.balance-amount` (2.75rem, bold, `var(--color-blue)`), `.balance-amount.over-budget` (color `var(--color-red)`), `.budget-warning` (red, 0.875rem, inline-flex), `.hidden` (display none), `.limit-row` (flex, centered, gap), `#monthly-limit` (120px wide, bordered, rounded)
    - _Requirements: 3.1, 3.2, 6.1, 6.3, 6.4, 7.1, 9.6_

  - [x] 2.4 Style form card and buttons
    - Style `.card-title`, `.field-group` (14px bottom margin), `label` (block, 0.8rem, bold), `input[type=text]`, `input[type=number]`, `select` (full-width, 10px 12px padding, 1px border, 6px radius, bg and color from tokens), `.field-error` (0.75rem, red, block), `.btn-primary` (blue bg, white text, no border, 6px radius, bold), `.btn-full` (width 100%, 12px padding, 8px top margin), `.btn-primary:hover` (#1976D2)
    - _Requirements: 1.1, 1.6, 9.7_

  - [x] 2.5 Style transaction list and chart card
    - Style `.transaction-list` (no list-style, max-height 320px, overflow-y auto), `.transaction-item` (flex, space-between, 10px vertical padding, bottom border), `.transaction-item:last-child` (no border), `.transaction-info` (flex column, 3px gap), `.transaction-name` (0.95rem, bold, primary color), `.transaction-amount` (0.9rem, bold, `var(--color-blue)`), `.category-badge` (inline-block, 0.7rem, 2px 8px padding, 12px radius, #e5e7eb bg), `.btn-delete` (red bg, white text, 6px radius, 6px 14px padding, flex-shrink 0), `.btn-delete:hover` (#c62828)
    - Style `#spending-chart` (max-width 260px, centered), `.chart-legend` (flex, wrap, centered, 12px gap, 12px top margin), `.legend-item` (flex, align-items center, 5px gap, 0.8rem), `.legend-dot` (10px circle, flex-shrink 0)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.5, 9.4_

  - [x] 2.6 Style category modal
    - Style `.modal-overlay` (fixed, inset 0, semi-transparent backdrop, flex centered, z-index 1000), `.modal-box` (white bg, 12px radius, 24px padding, 320px width, 90vw max), `.modal-title`, `.modal-actions` (flex, end-aligned, 10px gap, 16px top margin), `.btn-secondary` (transparent bg, 1px border, rounded, cursor pointer)
    - _Requirements: 5.2, 5.3_

- [x] 3. Implement JS state, persistence, and render core (`js/app.js`)
  - [x] 3.1 Define constants, default data, and state object
    - Define `DEFAULT_CATEGORIES` array with Food (#4CAF50), Transport (#2196F3), Fun (#FF9800)
    - Define `STORAGE_KEYS` constants (`ebv_transactions`, `ebv_categories`, `ebv_monthly_limit`, `ebv_theme`)
    - Define the `state` object with `transactions`, `categories`, `monthlyLimit`, `theme` fields
    - Implement `generateId()` using `Date.now().toString(36)` + random suffix
    - _Requirements: 1.2, 4.4, 8.6_

  - [x] 3.2 Implement `saveState()` and `loadState()`
    - `saveState()`: write each state field to its localStorage key as JSON/string
    - `loadState()`: read each key, parse, and populate state; fall back to defaults (DEFAULT_CATEGORIES, empty transactions, 0 limit, 'light' theme) when key is absent or parse fails
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 3.3 Write property test for persistence round-trip
    - **Property P3: Persistence Round-Trip** — for any state S, `saveState()` then `loadState()` produces S' where `S'.transactions` deep-equals `S.transactions`, `S'.categories` deep-equals `S.categories`, `S'.monthlyLimit === S.monthlyLimit`, and `S'.theme === S.theme`
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

  - [x] 3.4 Implement `renderBalance()`
    - Sum all `state.transactions` amounts; format as `$X.XX` and set `#total-balance` text
    - Toggle `.over-budget` class on `#total-balance` and toggle `.hidden` on `#budget-warning` based on `state.monthlyLimit > 0 && total > state.monthlyLimit`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.3, 6.4, 6.5_

  - [ ]* 3.5 Write property test for balance consistency
    - **Property P1: Balance Consistency** — for any sequence of add/delete operations, `Total_Balance === sum of all transaction amounts in state`
    - **Validates: Requirements 3.3, 3.4, 3.5**

  - [ ]* 3.6 Write property test for budget alert correctness
    - **Property P4: Budget Alert Correctness** — the budget warning is visible if and only if `state.monthlyLimit > 0 && Total_Balance > state.monthlyLimit`
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5**

  - [x] 3.7 Implement `renderCategoryDropdown()`
    - Clear and rebuild `#item-category` options from `state.categories`; always append the `<option value="__new__">+ Add New Category</option>` as the last item
    - _Requirements: 1.2, 5.1, 5.4_

  - [x] 3.8 Implement `renderTransactionList()`
    - Clear `#transaction-list` and re-render one `<li class="transaction-item">` per transaction using the template from the design (transaction-info div with name span, amount span, category-badge span; delete button with `data-id`)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.9 Implement `renderChart()`
    - Aggregate transaction amounts by category name into labels/data/colors arrays (look up color from `state.categories` by name)
    - On first call: create `chartInstance = new Chart(ctx, { type: 'pie', ... })` with `legend: { display: false }`
    - On subsequent calls: update `chartInstance.data` and call `chartInstance.update()`
    - Rebuild `#chart-legend` HTML as `.legend-item` divs (`.legend-dot` + label text) for each category present
    - When no transactions exist, pass empty arrays so the chart shows no segments
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.7_

  - [ ]* 3.10 Write property test for chart–state consistency
    - **Property P2: Chart–State Consistency** — for any state, the sum of all pie chart segment values equals `Total_Balance`; each segment label maps 1-to-1 to a category present in `state.transactions`
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [x] 3.11 Implement `renderTheme()`
    - Toggle `body.dark` class based on `state.theme`; update `#theme-toggle` text content to 🌙 (light mode) or ☀️ (dark mode)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 3.12 Implement `renderAll()` helper
    - Call `renderBalance()`, `renderTransactionList()`, `renderChart()`, `renderCategoryDropdown()`, `renderTheme()` in sequence
    - _Requirements: 8.5_

- [x] 4. Checkpoint — Verify static rendering
  - Ensure all render functions execute without errors when called with default state. Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement transaction mutators and form logic
  - [x] 5.1 Implement form validation and `addTransaction()`
    - Read and trim `#item-name`, `#item-amount`, `#item-category` values
    - Validate: name non-empty → clear/show `#name-error`; amount > 0 → clear/show `#amount-error`; category not empty and not `__new__` → clear/show `#category-error`
    - If any error: display inline error message, do NOT add transaction
    - If all valid: push `{ id: generateId(), name, amount: parseFloat(amount), category }` to `state.transactions`, call `saveState()`, call `renderBalance()`, `renderTransactionList()`, `renderChart()`, then reset the form
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

  - [ ]* 5.2 Write property test for form validation soundness
    - **Property P7: Form Validation Soundness** — a transaction is added to state if and only if all three validation rules pass (non-empty name, amount > 0, valid category selected)
    - **Validates: Requirements 1.3, 1.4**

  - [x] 5.3 Implement `deleteTransaction(id)` and event delegation
    - Filter `state.transactions` to remove the entry with matching `id`; call `saveState()`, `renderBalance()`, `renderTransactionList()`, `renderChart()`
    - Attach a single `click` event listener on `#transaction-list` using event delegation; detect clicks on `.btn-delete` via `event.target.closest('.btn-delete')` and extract `data-id`
    - _Requirements: 2.5, 3.4, 4.3_

  - [ ]* 5.4 Write property test for transaction deletion completeness
    - **Property P6: Transaction Deletion Completeness** — after `deleteTransaction(id)`, no transaction with that `id` exists in `state.transactions`
    - **Validates: Requirements 2.5**

- [x] 6. Implement custom categories and modal logic
  - [x] 6.1 Implement `addCategory(name, color)` and category uniqueness guard
    - Before pushing, check that no existing entry in `state.categories` shares the same name (case-insensitive); if duplicate, do not add
    - Push `{ name, color }` to `state.categories`, call `saveState()`, call `renderCategoryDropdown()`
    - _Requirements: 5.4_

  - [ ]* 6.2 Write property test for category uniqueness
    - **Property P5: Category Uniqueness** — no two entries in `state.categories` share the same name (case-insensitive) after any sequence of `addCategory()` calls
    - **Validates: Requirements 5.4**

  - [x] 6.3 Implement category modal open/close flow and event listeners
    - Declare `let previousCategory = ''` at module scope
    - On `#item-category` change: if value is `__new__`, save current value to `previousCategory`, clear `#new-cat-name`, clear `#new-cat-error`, remove `.hidden` from `#category-modal`
    - On `#modal-cancel` click and on `.modal-overlay` click (but not `.modal-box` click): add `.hidden` to `#category-modal`, restore `#item-category` value to `previousCategory`
    - On `#modal-confirm` click: if `#new-cat-name` is empty, show `#new-cat-error` and keep modal open; else call `addCategory(name, color)`, close modal, set `#item-category` value to the new category name
    - _Requirements: 5.2, 5.3, 5.5, 5.6_

- [x] 7. Implement monthly limit and theme toggle
  - [x] 7.1 Implement `setMonthlyLimit(value)` and input listener
    - Parse the input value as a float; store in `state.monthlyLimit` (0 if empty or NaN); call `saveState()`, `renderBalance()`
    - Attach `input` event listener on `#monthly-limit`; call `setMonthlyLimit` with the current input value
    - On `loadState()`, restore the `#monthly-limit` input field's displayed value from `state.monthlyLimit`
    - _Requirements: 6.1, 6.2, 6.5_

  - [x] 7.2 Implement `toggleTheme()` and theme-toggle listener
    - Flip `state.theme` between `'light'` and `'dark'`; call `saveState()`, `renderTheme()`
    - Attach `click` listener on `#theme-toggle`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.4_

- [x] 8. Wire app initialization
  - At the bottom of `js/app.js`, call `loadState()` then `renderAll()`; also restore `#monthly-limit` input value from `state.monthlyLimit` during init
  - Ensure all event listeners are registered after DOM is ready (place script at end of `<body>` or wrap in `DOMContentLoaded`)
  - _Requirements: 8.5, 8.6_

- [x] 9. Final checkpoint — Ensure all tests pass
  - Verify the full add → display → delete → persist → reload cycle works end-to-end via automated tests. Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at natural breaks
- Property tests (P1–P7) validate universal correctness properties defined in the design document
- Unit tests validate specific examples and edge cases
- All implementation is in three files only: `index.html`, `css/styles.css`, `js/app.js`
