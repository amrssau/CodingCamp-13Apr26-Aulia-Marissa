# Design Document

## Overview

The Expense & Budget Visualizer is a single-page, client-side web application. It is delivered as a single `index.html` file that loads one CSS file (`css/styles.css`) and one JavaScript file (`js/app.js`). Chart.js is loaded from a CDN. No build step, server, or framework is required.

The UI is structured as a vertical stack of white rounded cards on a light-gray background, matching the reference design image exactly.

---

## File Structure

```
/
├── index.html
├── css/
│   └── styles.css
└── js/
    └── app.js
```

---

## Architecture

The app follows a simple **data → render** cycle:

1. **State** — a plain JavaScript object held in memory and mirrored to `localStorage`.
2. **Mutators** — functions that modify state and call `render()`.
3. **Render** — a set of pure render functions that read state and update the DOM and chart.

There are no frameworks, no virtual DOM, and no module bundler. All logic lives in `js/app.js`.

### State Shape

```js
const state = {
  transactions: [
    // { id: string, name: string, amount: number, category: string }
  ],
  categories: [
    // { name: string, color: string }
    { name: 'Food',      color: '#4CAF50' },
    { name: 'Transport', color: '#2196F3' },
    { name: 'Fun',       color: '#FF9800' },
  ],
  monthlyLimit: 0,      // number, 0 = disabled
  theme: 'light',       // 'light' | 'dark'
};
```

### localStorage Keys

| Key                        | Value                        |
|----------------------------|------------------------------|
| `ebv_transactions`         | JSON array of transactions   |
| `ebv_categories`           | JSON array of categories     |
| `ebv_monthly_limit`        | Number string                |
| `ebv_theme`                | `'light'` or `'dark'`        |

---

## HTML Structure (`index.html`)

```
<body>
  <div class="app-wrapper">

    <!-- Page Title -->
    <h1 class="app-title">Expense &amp; Budget Visualizer</h1>

    <!-- Card 1: Header -->
    <div class="card header-card">
      <button id="theme-toggle" class="theme-btn" aria-label="Toggle theme">🌙</button>
      <p class="balance-label">TOTAL BALANCE</p>
      <h2 id="total-balance" class="balance-amount">$0.00</h2>
      <span id="budget-warning" class="budget-warning hidden">⚠️ Over budget!</span>
      <div class="limit-row">
        <label for="monthly-limit">Monthly Limit ($)</label>
        <input type="number" id="monthly-limit" placeholder="0.00" min="0" step="0.01" />
      </div>
    </div>

    <!-- Card 2: Add Transaction Form -->
    <div class="card form-card">
      <h3 class="card-title">Add Transaction</h3>
      <form id="transaction-form" novalidate>
        <div class="field-group">
          <label for="item-name">Item Name</label>
          <input type="text" id="item-name" placeholder="e.g. Coffee" />
          <span class="field-error" id="name-error"></span>
        </div>
        <div class="field-group">
          <label for="item-amount">Amount</label>
          <input type="number" id="item-amount" placeholder="0.00" min="0.01" step="0.01" />
          <span class="field-error" id="amount-error"></span>
        </div>
        <div class="field-group">
          <label for="item-category">Category</label>
          <select id="item-category">
            <!-- options injected by JS -->
            <option value="">Select a category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Fun">Fun</option>
            <option value="__new__">+ Add New Category</option>
          </select>
          <span class="field-error" id="category-error"></span>
        </div>
        <button type="submit" class="btn-primary btn-full">Add Transaction</button>
      </form>
    </div>

    <!-- Card 3: Bottom Row -->
    <div class="bottom-row">

      <!-- Card 3a: Transactions List -->
      <div class="card list-card">
        <h3 class="card-title">Transactions</h3>
        <ul id="transaction-list" class="transaction-list">
          <!-- items injected by JS -->
        </ul>
      </div>

      <!-- Card 3b: Pie Chart -->
      <div class="card chart-card">
        <h3 class="card-title">Spending by Category</h3>
        <canvas id="spending-chart"></canvas>
        <div id="chart-legend" class="chart-legend"></div>
      </div>

    </div>

  </div>

  <!-- Category Modal -->
  <div id="category-modal" class="modal-overlay hidden" role="dialog" aria-modal="true">
    <div class="modal-box">
      <h4 class="modal-title">New Category</h4>
      <div class="field-group">
        <label for="new-cat-name">Category Name</label>
        <input type="text" id="new-cat-name" placeholder="e.g. Health" />
        <span class="field-error" id="new-cat-error"></span>
      </div>
      <div class="field-group">
        <label for="new-cat-color">Color</label>
        <input type="color" id="new-cat-color" value="#9C27B0" />
      </div>
      <div class="modal-actions">
        <button id="modal-cancel" class="btn-secondary">Cancel</button>
        <button id="modal-confirm" class="btn-primary">Add Category</button>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
  <script src="js/app.js"></script>
</body>
```

### Transaction List Item Template

Each `<li>` in `#transaction-list` renders as:

```html
<li class="transaction-item" data-id="{id}">
  <div class="transaction-info">
    <span class="transaction-name">{name}</span>
    <span class="transaction-amount">${amount}</span>
    <span class="category-badge">{category}</span>
  </div>
  <button class="btn-delete" data-id="{id}" aria-label="Delete {name}">Delete</button>
</li>
```

---

## CSS Design (`css/styles.css`)

### Color Tokens

| Token              | Light Mode Value | Dark Mode Value  | Usage                          |
|--------------------|------------------|------------------|--------------------------------|
| `--bg-page`        | `#f0f2f5`        | `#1e293b`        | Page background                |
| `--bg-card`        | `#ffffff`        | `#0f172a`        | Card background                |
| `--text-primary`   | `#1a1a2e`        | `#f1f5f9`        | Headings, item names           |
| `--text-secondary` | `#6b7280`        | `#94a3b8`        | Labels, secondary text         |
| `--color-blue`     | `#2196F3`        | `#2196F3`        | Balance amount, amounts, button|
| `--color-green`    | `#4CAF50`        | `#4CAF50`        | Food category                  |
| `--color-orange`   | `#FF9800`        | `#FF9800`        | Fun category                   |
| `--color-red`      | `#e53935`        | `#e53935`        | Delete button, budget alert    |
| `--border-color`   | `#e5e7eb`        | `#334155`        | Input borders, dividers        |
| `--shadow`         | `0 2px 8px rgba(0,0,0,0.08)` | `0 2px 8px rgba(0,0,0,0.4)` | Card shadow |

### Layout

- `.app-wrapper`: `max-width: 800px`, centered with `margin: 0 auto`, `padding: 24px 16px`
- `.app-title`: centered, bold, dark, `font-size: 1.5rem`, `margin-bottom: 20px`
- `.card`: `background: var(--bg-card)`, `border-radius: 12px`, `box-shadow: var(--shadow)`, `padding: 24px`, `margin-bottom: 16px`
- `.bottom-row`: CSS Grid with `grid-template-columns: 1fr 1fr`, `gap: 16px`
- On screens `< 600px`: `.bottom-row` collapses to `grid-template-columns: 1fr`

### Header Card

- `.header-card`: `text-align: center`, `position: relative`
- `.theme-btn`: `position: absolute`, `top: 16px`, `right: 16px`, background-less icon button, `font-size: 1.25rem`, cursor pointer
- `.balance-label`: `font-size: 0.75rem`, `letter-spacing: 0.1em`, `text-transform: uppercase`, `color: var(--text-secondary)`
- `.balance-amount`: `font-size: 2.75rem`, `font-weight: 700`, `color: var(--color-blue)`, `margin: 4px 0 12px`
- `.balance-amount.over-budget`: `color: var(--color-red)`
- `.budget-warning`: `color: var(--color-red)`, `font-size: 0.875rem`, `display: inline-flex`, `align-items: center`, `gap: 4px`
- `.hidden`: `display: none`
- `.limit-row`: `display: flex`, `align-items: center`, `justify-content: center`, `gap: 8px`, `margin-top: 12px`
- `#monthly-limit`: `width: 120px`, `padding: 6px 10px`, `border: 1px solid var(--border-color)`, `border-radius: 6px`

### Form Card

- `.card-title`: `font-size: 1.1rem`, `font-weight: 600`, `color: var(--text-primary)`, `margin-bottom: 16px`
- `.field-group`: `margin-bottom: 14px`
- `.field-group label`: `display: block`, `font-size: 0.8rem`, `font-weight: 600`, `color: var(--text-primary)`, `margin-bottom: 4px`
- `input[type=text], input[type=number], select`: `width: 100%`, `box-sizing: border-box`, `padding: 10px 12px`, `border: 1px solid var(--border-color)`, `border-radius: 6px`, `font-size: 0.95rem`, `background: var(--bg-card)`, `color: var(--text-primary)`
- `.field-error`: `font-size: 0.75rem`, `color: var(--color-red)`, `margin-top: 3px`, `display: block`
- `.btn-primary`: `background: var(--color-blue)`, `color: #fff`, `border: none`, `border-radius: 6px`, `padding: 10px 20px`, `font-size: 0.95rem`, `font-weight: 600`, `cursor: pointer`
- `.btn-full`: `width: 100%`, `padding: 12px`, `margin-top: 8px`
- `.btn-primary:hover`: `background: #1976D2`

### Transaction List

- `.transaction-list`: `list-style: none`, `padding: 0`, `margin: 0`, `max-height: 320px`, `overflow-y: auto`
- `.transaction-item`: `display: flex`, `align-items: center`, `justify-content: space-between`, `padding: 10px 0`, `border-bottom: 1px solid var(--border-color)`
- `.transaction-item:last-child`: `border-bottom: none`
- `.transaction-info`: `display: flex`, `flex-direction: column`, `gap: 3px`
- `.transaction-name`: `font-size: 0.95rem`, `font-weight: 600`, `color: var(--text-primary)`
- `.transaction-amount`: `font-size: 0.9rem`, `font-weight: 700`, `color: var(--color-blue)`
- `.category-badge`: `display: inline-block`, `font-size: 0.7rem`, `padding: 2px 8px`, `border-radius: 12px`, `background: #e5e7eb`, `color: var(--text-primary)`, `width: fit-content`
- `.btn-delete`: `background: var(--color-red)`, `color: #fff`, `border: none`, `border-radius: 6px`, `padding: 6px 14px`, `font-size: 0.8rem`, `font-weight: 600`, `cursor: pointer`, `flex-shrink: 0`
- `.btn-delete:hover`: `background: #c62828`

### Chart Card

- `#spending-chart`: `max-width: 260px`, `margin: 0 auto`, `display: block`
- `.chart-legend`: `display: flex`, `flex-wrap: wrap`, `justify-content: center`, `gap: 12px`, `margin-top: 12px`
- `.legend-item`: `display: flex`, `align-items: center`, `gap: 5px`, `font-size: 0.8rem`, `color: var(--text-secondary)`
- `.legend-dot`: `width: 10px`, `height: 10px`, `border-radius: 50%`, `flex-shrink: 0`

### Category Modal

- `.modal-overlay`: `position: fixed`, `inset: 0`, `background: rgba(0,0,0,0.5)`, `display: flex`, `align-items: center`, `justify-content: center`, `z-index: 1000`
- `.modal-box`: `background: var(--bg-card)`, `border-radius: 12px`, `padding: 24px`, `width: 320px`, `max-width: 90vw`
- `.modal-title`: `font-size: 1rem`, `font-weight: 700`, `margin-bottom: 16px`, `color: var(--text-primary)`
- `.modal-actions`: `display: flex`, `justify-content: flex-end`, `gap: 10px`, `margin-top: 16px`
- `.btn-secondary`: `background: transparent`, `border: 1px solid var(--border-color)`, `border-radius: 6px`, `padding: 8px 16px`, `cursor: pointer`, `color: var(--text-primary)`

### Dark Mode

Applied via `body.dark` class toggled by JS:

```css
body.dark {
  --bg-page:        #1e293b;
  --bg-card:        #0f172a;
  --text-primary:   #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color:   #334155;
  --shadow:         0 2px 8px rgba(0,0,0,0.4);
}
```

---

## JavaScript Logic (`js/app.js`)

### Module Structure (single file, IIFE or top-level)

```
1. Constants & default data
2. State initialization (load from localStorage or defaults)
3. localStorage helpers: saveState(), loadState()
4. Render functions:
   - renderBalance()
   - renderTransactionList()
   - renderChart()
   - renderCategoryDropdown()
   - renderTheme()
5. Mutator functions:
   - addTransaction(name, amount, category)
   - deleteTransaction(id)
   - addCategory(name, color)
   - setMonthlyLimit(value)
   - toggleTheme()
6. Event listeners:
   - form submit
   - delete button (event delegation on #transaction-list)
   - category dropdown change (detect __new__)
   - modal confirm / cancel
   - monthly-limit input (debounced)
   - theme-toggle click
7. App init: loadState() → renderAll()
```

### Key Function Signatures

```js
// Generate a unique ID for each transaction
function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// Persist full state to localStorage
function saveState() { ... }

// Load state from localStorage, falling back to defaults
function loadState() { ... }

// Recalculate total and update #total-balance DOM + budget alert
function renderBalance() { ... }

// Re-render the full transaction list from state.transactions
function renderTransactionList() { ... }

// Rebuild Chart.js pie chart from state.transactions + state.categories
function renderChart() { ... }

// Rebuild the category <select> options from state.categories
function renderCategoryDropdown() { ... }

// Apply or remove body.dark class and update toggle icon
function renderTheme() { ... }

// Validate form, create transaction object, push to state, save, render
function addTransaction(name, amount, category) { ... }

// Filter out transaction by id, save, render
function deleteTransaction(id) { ... }

// Push new category to state.categories, save, re-render dropdown
function addCategory(name, color) { ... }

// Update state.monthlyLimit, save, re-render balance
function setMonthlyLimit(value) { ... }

// Flip state.theme, save, renderTheme()
function toggleTheme() { ... }
```

### Chart.js Integration

- Chart instance stored in a module-level variable `let chartInstance = null`.
- On first render: `chartInstance = new Chart(ctx, { type: 'pie', ... })`.
- On subsequent renders: update `chartInstance.data.labels`, `chartInstance.data.datasets[0].data`, `chartInstance.data.datasets[0].backgroundColor`, then call `chartInstance.update()`.
- Category colors are looked up from `state.categories` by name.
- The custom Legend beneath the chart is rendered as HTML (not Chart.js built-in legend) to match the reference design's dot + label style.

### Form Validation Rules

| Field     | Rule                                      | Error message                        |
|-----------|-------------------------------------------|--------------------------------------|
| Item Name | Non-empty string after trim               | "Item name is required."             |
| Amount    | Positive number > 0                       | "Enter a valid amount greater than 0."|
| Category  | Not empty string, not `__new__`           | "Please select a category."          |

### Category Modal Flow

1. User selects `__new__` in dropdown → `previousCategory` saved → modal opens.
2. User types name + picks color → clicks "Add Category":
   - If name empty: show error, stay open.
   - Else: `addCategory(name, color)` → close modal → set dropdown to new category.
3. User clicks "Cancel" or overlay: close modal → restore dropdown to `previousCategory`.

### Budget Alert Logic

```js
function renderBalance() {
  const total = state.transactions.reduce((sum, t) => sum + t.amount, 0);
  balanceEl.textContent = '$' + total.toFixed(2);
  const overBudget = state.monthlyLimit > 0 && total > state.monthlyLimit;
  balanceEl.classList.toggle('over-budget', overBudget);
  warningEl.classList.toggle('hidden', !overBudget);
}
```

---

## Correctness Properties

The following properties define the formal correctness of the application and serve as the basis for property-based testing:

### P1 — Balance Consistency
For any sequence of add/delete operations, `Total_Balance === sum of all transaction amounts in state`.

### P2 — Chart–State Consistency
For any state, the sum of all pie chart segment values equals `Total_Balance`. Each segment label maps 1-to-1 to a category present in `state.transactions`.

### P3 — Persistence Round-Trip
For any state S, after `saveState()` followed by `loadState()`, the resulting state S' satisfies `S'.transactions deep-equals S.transactions`, `S'.categories deep-equals S.categories`, `S'.monthlyLimit === S.monthlyLimit`, and `S'.theme === S.theme`.

### P4 — Budget Alert Correctness
The budget warning is visible if and only if `state.monthlyLimit > 0 && Total_Balance > state.monthlyLimit`.

### P5 — Category Uniqueness
No two entries in `state.categories` share the same name (case-insensitive).

### P6 — Transaction Deletion Completeness
After `deleteTransaction(id)`, no transaction with that `id` exists in `state.transactions`.

### P7 — Form Validation Soundness
A transaction is added to state if and only if all three validation rules pass (non-empty name, amount > 0, valid category selected).
