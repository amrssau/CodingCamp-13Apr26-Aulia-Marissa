/**
 * Expense & Budget Visualizer — Main Application Script
 *
 * Single-file vanilla JS app. No build step required.
 * Loads after Chart.js CDN script in index.html.
 *
 * Structure:
 *   1. Constants & default data
 *   2. State object
 *   3. Utility: generateId()
 *   4. Persistence: saveState() / loadState()
 *   5. Render functions: renderBalance, renderTransactionList,
 *      renderChart, renderCategoryDropdown, renderTheme, renderAll
 *   6. Mutator functions: addTransaction, deleteTransaction,
 *      addCategory, setMonthlyLimit, toggleTheme
 *   7. Event listeners
 *   8. App init
 */

/* ─────────────────────────────────────────────
   1. CONSTANTS & DEFAULT DATA
   ───────────────────────────────────────────── */

const DEFAULT_CATEGORIES = [
  { name: 'Food',      color: '#4CAF50' },
  { name: 'Transport', color: '#2196F3' },
  { name: 'Fun',       color: '#FF9800' },
];

const STORAGE_KEYS = {
  TRANSACTIONS:  'ebv_transactions',
  CATEGORIES:    'ebv_categories',
  MONTHLY_LIMIT: 'ebv_monthly_limit',
  THEME:         'ebv_theme',
};

/* ─────────────────────────────────────────────
   2. STATE OBJECT
   ───────────────────────────────────────────── */

const state = {
  transactions: [],                          // { id: string, name: string, amount: number, category: string }
  categories:   DEFAULT_CATEGORIES.map(c => ({ ...c })), // copy, not reference
  monthlyLimit: 0,                           // number, 0 = disabled
  theme:        'light',                     // 'light' | 'dark'
};

/* ─────────────────────────────────────────────
   3. UTILITY
   ───────────────────────────────────────────── */

/**
 * Generate a unique string ID for a transaction.
 * Combines a base-36 timestamp with a random base-36 suffix.
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ─────────────────────────────────────────────
   4. PERSISTENCE  (saveState / loadState)
   ───────────────────────────────────────────── */

/**
 * Persist the full application state to localStorage.
 * Each field is stored under its own key (see STORAGE_KEYS).
 * Transactions and categories are JSON-serialised; monthlyLimit and
 * theme are stored as plain strings.
 */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS,  JSON.stringify(state.transactions));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES,    JSON.stringify(state.categories));
    localStorage.setItem(STORAGE_KEYS.MONTHLY_LIMIT, String(state.monthlyLimit));
    localStorage.setItem(STORAGE_KEYS.THEME,         state.theme);
  } catch (err) {
    // localStorage may be unavailable (private browsing quota exceeded, etc.)
    console.warn('saveState: could not write to localStorage', err);
  }
}

/**
 * Restore application state from localStorage.
 * Falls back to safe defaults for any key that is absent or contains
 * invalid JSON, so the app always starts in a consistent state.
 *
 * Defaults:
 *   transactions  → []
 *   categories    → copy of DEFAULT_CATEGORIES
 *   monthlyLimit  → 0
 *   theme         → 'light'
 */
function loadState() {
  // ── transactions ──────────────────────────────────────────────────
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    state.transactions = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(state.transactions)) state.transactions = [];
  } catch (_) {
    state.transactions = [];
  }

  // ── categories ────────────────────────────────────────────────────
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const parsed = raw ? JSON.parse(raw) : null;
    state.categories = Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : DEFAULT_CATEGORIES.map(c => ({ ...c }));
  } catch (_) {
    state.categories = DEFAULT_CATEGORIES.map(c => ({ ...c }));
  }

  // ── monthlyLimit ──────────────────────────────────────────────────
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MONTHLY_LIMIT);
    const parsed = raw !== null ? parseFloat(raw) : NaN;
    state.monthlyLimit = isNaN(parsed) ? 0 : parsed;
  } catch (_) {
    state.monthlyLimit = 0;
  }

  // ── theme ─────────────────────────────────────────────────────────
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    state.theme = raw === 'dark' ? 'dark' : 'light';
  } catch (_) {
    state.theme = 'light';
  }

  // ── restore #monthly-limit input display ──────────────────────────
  const limitInput = document.getElementById('monthly-limit');
  if (limitInput) {
    limitInput.value = state.monthlyLimit > 0 ? state.monthlyLimit : '';
  }
}

/* ─────────────────────────────────────────────
   5. RENDER FUNCTIONS
   ───────────────────────────────────────────── */

/**
 * Render the total balance display and budget-warning indicator.
 *
 * - Sums all transaction amounts in state.transactions.
 * - Formats the total as "$X.XX" and sets it as the text content of
 *   #total-balance.
 * - If a monthly limit is set (state.monthlyLimit > 0) and the total
 *   exceeds it, adds the .over-budget class to #total-balance and
 *   removes .hidden from #budget-warning.
 * - Otherwise removes .over-budget and ensures #budget-warning is hidden.
 */
function renderBalance() {
  const total = state.transactions.reduce((sum, t) => sum + t.amount, 0);

  const balanceEl  = document.getElementById('total-balance');
  const warningEl  = document.getElementById('budget-warning');

  balanceEl.textContent = '$' + total.toFixed(2);

  const overBudget = state.monthlyLimit > 0 && total > state.monthlyLimit;

  balanceEl.classList.toggle('over-budget', overBudget);
  warningEl.classList.toggle('hidden', !overBudget);
}

/**
 * Re-render the full transaction list from state.transactions.
 *
 * Clears #transaction-list and appends one <li class="transaction-item">
 * per transaction. Each item contains:
 *   - a .transaction-info div with name, amount ($X.XX), and category-badge
 *   - a .btn-delete button with data-id and an accessible aria-label
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
function renderTransactionList() {
  const list = document.getElementById('transaction-list');

  // Clear existing items
  list.innerHTML = '';

  state.transactions.forEach(function (transaction) {
    // <li class="transaction-item" data-id="{id}">
    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.dataset.id = transaction.id;

    // <div class="transaction-info">
    const info = document.createElement('div');
    info.className = 'transaction-info';

    // <span class="transaction-name">{name}</span>
    const nameSpan = document.createElement('span');
    nameSpan.className = 'transaction-name';
    nameSpan.textContent = transaction.name;

    // <span class="transaction-amount">${amount}</span>
    const amountSpan = document.createElement('span');
    amountSpan.className = 'transaction-amount';
    amountSpan.textContent = '$' + transaction.amount.toFixed(2);

    // <span class="category-badge">{category}</span>
    const badgeSpan = document.createElement('span');
    badgeSpan.className = 'category-badge';
    badgeSpan.textContent = transaction.category;

    info.appendChild(nameSpan);
    info.appendChild(amountSpan);
    info.appendChild(badgeSpan);

    // <button class="btn-delete" data-id="{id}" aria-label="Delete {name}">Delete</button>
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.dataset.id = transaction.id;
    deleteBtn.setAttribute('aria-label', 'Delete ' + transaction.name);
    deleteBtn.textContent = 'Delete';

    li.appendChild(info);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

/**
 * Rebuild the Chart.js pie chart and the custom HTML legend from
 * state.transactions and state.categories.
 *
 * Aggregation:
 *   - Sum transaction amounts by category name.
 *   - Look up each category's color from state.categories.
 *   - When no transactions exist, pass empty arrays so the chart
 *     renders an empty state (no segments).
 *
 * Chart lifecycle:
 *   - First call: create a new Chart instance and store it in
 *     chartInstance.
 *   - Subsequent calls: update chartInstance.data in-place and call
 *     chartInstance.update() to avoid re-creating the canvas context.
 *
 * Legend:
 *   - Rebuild #chart-legend as one .legend-item div per category that
 *     has at least one transaction.  Each item contains a .legend-dot
 *     (colored circle) and a text label.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.7
 */

/** @type {Chart|null} Module-level Chart.js instance. */
let chartInstance = null;

function renderChart() {
  // ── 1. Aggregate amounts by category ──────────────────────────────
  /** @type {Map<string, number>} category name → total amount */
  const totals = new Map();

  state.transactions.forEach(function (t) {
    totals.set(t.category, (totals.get(t.category) || 0) + t.amount);
  });

  // Build parallel arrays for Chart.js (only categories with > 0 total)
  const labels = [];
  const data   = [];
  const colors = [];

  totals.forEach(function (amount, categoryName) {
    // Look up color from state.categories; fall back to a neutral gray
    const catEntry = state.categories.find(function (c) {
      return c.name === categoryName;
    });
    labels.push(categoryName);
    data.push(amount);
    colors.push(catEntry ? catEntry.color : '#9e9e9e');
  });

  // ── 2. Create or update the Chart.js instance ─────────────────────
  const canvas = document.getElementById('spending-chart');
  const ctx    = canvas.getContext('2d');

  if (!chartInstance) {
    // First call — create the chart
    chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels:   labels,
        datasets: [{
          data:            data,
          backgroundColor: colors,
          borderWidth:     2,
        }],
      },
      options: {
        responsive:        true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }, // custom HTML legend used instead
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed;
                return ' $' + value.toFixed(2);
              },
            },
          },
        },
      },
    });
  } else {
    // Subsequent calls — update data in-place
    chartInstance.data.labels                        = labels;
    chartInstance.data.datasets[0].data              = data;
    chartInstance.data.datasets[0].backgroundColor   = colors;
    chartInstance.update();
  }

  // ── 3. Rebuild the custom HTML legend ─────────────────────────────
  const legendEl = document.getElementById('chart-legend');
  legendEl.innerHTML = '';

  labels.forEach(function (label, i) {
    // <div class="legend-item">
    const item = document.createElement('div');
    item.className = 'legend-item';

    // <div class="legend-dot" style="background: {color}"></div>
    const dot = document.createElement('div');
    dot.className = 'legend-dot';
    dot.style.background = colors[i];

    // text label
    const text = document.createTextNode(label);

    item.appendChild(dot);
    item.appendChild(text);
    legendEl.appendChild(item);
  });
}
/**
 * Rebuild the #item-category <select> options from state.categories.
 *
 * Option order:
 *   1. Placeholder: <option value="">Select a category</option>
 *   2. One <option> per entry in state.categories (value = name, text = name)
 *   3. Always last: <option value="__new__">+ Add New Category</option>
 */
function renderCategoryDropdown() {
  const select = document.getElementById('item-category');

  // Clear all existing options
  select.innerHTML = '';

  // 1. Placeholder option
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select a category';
  select.appendChild(placeholder);

  // 2. One option per category in state
  state.categories.forEach(function (cat) {
    const option = document.createElement('option');
    option.value = cat.name;
    option.textContent = cat.name;
    select.appendChild(option);
  });

  // 3. "Add New Category" option — always last
  const addNew = document.createElement('option');
  addNew.value = '__new__';
  addNew.textContent = '+ Add New Category';
  select.appendChild(addNew);
}
/**
 * Apply the current theme to the document and update the toggle button.
 *
 * - Adds `body.dark` class when state.theme === 'dark'; removes it otherwise.
 * - Sets #theme-toggle text content to '🌙' in light mode (inviting a switch
 *   to dark) and '☀️' in dark mode (inviting a switch back to light).
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
function renderTheme() {
  document.body.classList.toggle('dark', state.theme === 'dark');

  const toggleBtn = document.getElementById('theme-toggle');
  toggleBtn.textContent = state.theme === 'dark' ? '☀️' : '🌙';
}

/**
 * Call all render functions in sequence to fully refresh the UI.
 *
 * Invoked during app initialisation (after loadState()) and can be
 * used any time a full re-render is needed.
 *
 * Requirements: 8.5
 */
function renderAll() {
  renderBalance();
  renderTransactionList();
  renderChart();
  renderCategoryDropdown();
  renderTheme();
}

/* ─────────────────────────────────────────────
   6. MUTATOR FUNCTIONS
   ───────────────────────────────────────────── */

/**
 * Validate the Add Transaction form and, if valid, push a new transaction
 * to state, persist, and re-render.
 *
 * Reads and trims #item-name, #item-amount, #item-category.
 * Shows inline errors in #name-error, #amount-error, #category-error.
 * Resets the form on success.
 *
 * Requirements: 1.3, 1.4, 1.5, 1.6
 */
function addTransaction() {
  const nameInput     = document.getElementById('item-name');
  const amountInput   = document.getElementById('item-amount');
  const categoryInput = document.getElementById('item-category');

  const nameEl     = document.getElementById('name-error');
  const amountEl   = document.getElementById('amount-error');
  const categoryEl = document.getElementById('category-error');

  const name     = nameInput.value.trim();
  const amount   = amountInput.value.trim();
  const category = categoryInput.value;

  let valid = true;

  // Validate name
  if (name === '') {
    nameEl.textContent = 'Item name is required.';
    valid = false;
  } else {
    nameEl.textContent = '';
  }

  // Validate amount
  const parsedAmount = parseFloat(amount);
  if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
    amountEl.textContent = 'Enter a valid amount greater than 0.';
    valid = false;
  } else {
    amountEl.textContent = '';
  }

  // Validate category
  if (category === '' || category === '__new__') {
    categoryEl.textContent = 'Please select a category.';
    valid = false;
  } else {
    categoryEl.textContent = '';
  }

  if (!valid) return;

  // All valid — add transaction
  state.transactions.push({
    id:       generateId(),
    name:     name,
    amount:   parsedAmount,
    category: category,
  });

  saveState();
  renderBalance();
  renderTransactionList();
  renderChart();

  // Reset form fields
  document.getElementById('transaction-form').reset();
}

/**
 * Remove a transaction from state by its ID, then persist and re-render.
 *
 * Uses Array.filter to produce a new array without the matching entry.
 * After mutation, calls saveState(), renderBalance(), renderTransactionList(),
 * and renderChart() to keep the UI in sync.
 *
 * @param {string} id - The unique ID of the transaction to remove.
 * Requirements: 2.5, 3.4, 4.3
 */
function deleteTransaction(id) {
  state.transactions = state.transactions.filter(function (t) {
    return t.id !== id;
  });
  saveState();
  renderBalance();
  renderTransactionList();
  renderChart();
}
/**
 * Add a new category to state.categories if no existing category shares
 * the same name (case-insensitive). Persists state and rebuilds the
 * category dropdown on success.
 *
 * @param {string} name  - Display name for the new category.
 * @param {string} color - Hex color string (e.g. "#9C27B0").
 * Requirements: 5.4
 */
function addCategory(name, color) {
  const normalised = name.toLowerCase();
  const isDuplicate = state.categories.some(function (cat) {
    return cat.name.toLowerCase() === normalised;
  });

  if (isDuplicate) return;

  state.categories.push({ name: name, color: color });
  saveState();
  renderCategoryDropdown();
}

/**
 * Update the monthly spending limit from user input.
 *
 * Parses `value` as a float. Stores 0 in `state.monthlyLimit` when the
 * value is empty, NaN, or negative. Persists state and re-renders the
 * balance display so the over-budget indicator updates immediately.
 *
 * @param {string|number} value - Raw value from the #monthly-limit input.
 * Requirements: 6.1, 6.2, 6.5
 */
function setMonthlyLimit(value) {
  const parsed = parseFloat(value);
  state.monthlyLimit = (isNaN(parsed) || parsed < 0) ? 0 : parsed;
  saveState();
  renderBalance();
}

/**
 * Toggle the application theme between 'light' and 'dark'.
 *
 * Flips state.theme, persists the new value via saveState(), and
 * updates the UI via renderTheme().
 *
 * Requirements: 7.2, 7.3, 7.4, 8.4
 */
function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  saveState();
  renderTheme();
}

/* ─────────────────────────────────────────────
   7. EVENT LISTENERS
   ───────────────────────────────────────────── */

// ── Form submit — Add Transaction (task 5.1) ──────────────────────
document.getElementById('transaction-form').addEventListener('submit', function (event) {
  event.preventDefault();
  addTransaction();
});

// ── Delete Transaction — event delegation on #transaction-list (task 5.3) ──
document.getElementById('transaction-list').addEventListener('click', function (event) {
  const btn = event.target.closest('.btn-delete');
  if (!btn) return;
  const id = btn.dataset.id;
  if (id) {
    deleteTransaction(id);
  }
});

// ── Category dropdown change — detect __new__ (task 6.3) ─────────
let previousCategory = '';

document.getElementById('item-category').addEventListener('change', function () {
  if (this.value === '__new__') {
    // previousCategory was set on the last non-__new__ selection (see below)
    document.getElementById('new-cat-name').value = '';
    document.getElementById('new-cat-error').textContent = '';
    document.getElementById('category-modal').classList.remove('hidden');
  } else {
    // Keep previousCategory in sync with the last valid selection
    previousCategory = this.value;
  }
});

// ── Modal cancel button (task 6.3) ───────────────────────────────
document.getElementById('modal-cancel').addEventListener('click', function () {
  document.getElementById('category-modal').classList.add('hidden');
  document.getElementById('item-category').value = previousCategory;
});

// ── Modal overlay click — close on backdrop, not on modal-box (task 6.3) ──
document.getElementById('category-modal').addEventListener('click', function (event) {
  if (!event.target.closest('.modal-box')) {
    document.getElementById('category-modal').classList.add('hidden');
    document.getElementById('item-category').value = previousCategory;
  }
});

// ── Modal confirm button (task 6.3) ──────────────────────────────
document.getElementById('modal-confirm').addEventListener('click', function () {
  const nameInput  = document.getElementById('new-cat-name');
  const errorEl    = document.getElementById('new-cat-error');
  const colorInput = document.getElementById('new-cat-color');
  const name       = nameInput.value.trim();

  if (name === '') {
    errorEl.textContent = 'Category name is required.';
    return;
  }

  errorEl.textContent = '';
  addCategory(name, colorInput.value);
  document.getElementById('category-modal').classList.add('hidden');
  document.getElementById('item-category').value = name;
});

// ── Monthly limit input (task 7.1) ───────────────────────────────
document.getElementById('monthly-limit').addEventListener('input', function () {
  setMonthlyLimit(this.value);
});

// ── Theme toggle button (task 7.2) ───────────────────────────────
document.getElementById('theme-toggle').addEventListener('click', function () {
  toggleTheme();
});

/* ─────────────────────────────────────────────
   8. APP INIT
   ───────────────────────────────────────────── */

// Restore persisted state (also restores #monthly-limit input value)
// then do a full UI render. The script tag is placed at the end of
// <body> in index.html, so the DOM is fully available at this point.
loadState();
renderAll();
