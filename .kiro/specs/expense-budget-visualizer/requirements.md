# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application built with HTML, CSS, and Vanilla JavaScript. It allows users to track personal expenses by adding transactions with a name, amount, and category. The app displays a running total balance, a scrollable transaction list with delete capability, and a real-time pie chart showing spending distribution by category. Additional features include custom categories, a monthly budget limit with overspend alerts, and a light/dark theme toggle. All data is persisted in the browser's Local Storage — no backend or build tooling is required.

The visual design follows a specific reference layout: a light-gray page background (`#f0f2f5`), white rounded cards with subtle box shadows, a page title "Expense & Budget Visualizer" in bold dark text centered at the top, and a strict 3-card vertical stack. The Total Balance amount is rendered in a large bold blue (`#2196F3`) font. Transaction amounts in the list are also blue. The Delete button per transaction is red (`#e53935`). The pie chart uses green (`#4CAF50`) for Food, blue (`#2196F3`) for Transport, and orange (`#FF9800`) for Fun. The "Add Transaction" submit button spans the full width of the form card and is solid blue.

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single expense entry consisting of an item name, a monetary amount, and a category.
- **Transaction_List**: The scrollable UI component that displays all recorded transactions.
- **Category**: A label assigned to a transaction (e.g., Food, Transport, Fun) used to group spending.
- **Custom_Category**: A user-defined category with a name and a chosen color, created via the category modal.
- **Category_Modal**: The dialog UI component used to create a new custom category.
- **Total_Balance**: The aggregate sum of all transaction amounts displayed in the header card.
- **Monthly_Limit**: A user-configurable spending threshold entered in the header card.
- **Budget_Alert**: A visual warning triggered when Total_Balance exceeds the Monthly_Limit.
- **Pie_Chart**: The Chart.js-powered chart that visualizes spending distribution by category.
- **Theme_Toggle**: The moon/sun icon control that switches the App between light mode and dark mode.
- **Local_Storage**: The browser's Web Storage API used to persist all App data client-side.
- **Input_Form**: The UI form component used to enter a new transaction.
- **Validator**: The client-side logic that checks Input_Form fields before submission.
- **Category_Badge**: The small pill/tag element shown beneath each transaction's amount in the Transaction_List, displaying the category name.
- **Legend**: The row of colored dot + label pairs shown beneath the Pie_Chart identifying each category.

---

## Requirements

### Requirement 1: Add a Transaction

**User Story:** As a user, I want to fill in a form with an item name, amount, and category and submit it, so that the transaction is recorded and visible in the list.

#### Acceptance Criteria

1. THE Input_Form SHALL contain a text field labeled "Item Name", a numeric field labeled "Amount", and a dropdown labeled "Category", stacked vertically in that order.
2. THE Input_Form SHALL pre-populate the category dropdown with the options: Food, Transport, and Fun.
3. WHEN the user submits the Input_Form, THE Validator SHALL verify that the item name field is not empty, the amount field contains a positive numeric value, and a category is selected.
4. IF the Validator detects a missing or invalid field, THEN THE Input_Form SHALL display an inline error message identifying the invalid field and SHALL NOT add a transaction.
5. WHEN the Input_Form passes validation, THE App SHALL append a new Transaction to the Transaction_List and SHALL clear the Input_Form fields.
6. THE submit button SHALL be labeled "Add Transaction", SHALL span the full width of the Input_Form card, and SHALL use a solid blue background (`#2196F3`) with white text.

---

### Requirement 2: View and Delete Transactions

**User Story:** As a user, I want to see all my transactions in a scrollable list and remove individual ones, so that I can review and correct my expense history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each Transaction as a row containing: the item name in dark bold text at the top, the amount in blue (`#2196F3`) bold text below the name, and a Category_Badge below the amount.
2. THE Category_Badge SHALL be a small rounded pill element displaying the category name in dark text on a light gray background.
3. WHILE the number of transactions exceeds the visible area of the Transaction_List, THE Transaction_List SHALL be scrollable.
4. THE Transaction_List SHALL display a red Delete button (`#e53935`, white text, rounded corners) aligned to the right of each transaction row.
5. WHEN the user clicks the Delete button for a Transaction, THE App SHALL remove that Transaction from the Transaction_List.

---

### Requirement 3: Display and Update Total Balance

**User Story:** As a user, I want to see the total of all my expenses at the top of the page, so that I always know how much I have spent.

#### Acceptance Criteria

1. THE App SHALL display the Total_Balance in the header card, centered, with a small uppercase label "TOTAL BALANCE" in gray above it.
2. THE Total_Balance amount SHALL be rendered in a large (≥2.5rem), bold, blue (`#2196F3`) font, formatted as a dollar amount (e.g., `$3.56`).
3. WHEN a Transaction is added, THE App SHALL recalculate and update the Total_Balance to reflect the new sum.
4. WHEN a Transaction is deleted, THE App SHALL recalculate and update the Total_Balance to reflect the new sum.
5. THE Total_Balance SHALL equal the arithmetic sum of the amounts of all current Transactions.

---

### Requirement 4: Visualize Spending with a Pie Chart

**User Story:** As a user, I want to see a pie chart of my spending broken down by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE App SHALL render a Pie_Chart using Chart.js that displays one segment per Category present in the Transaction_List.
2. WHEN a Transaction is added, THE Pie_Chart SHALL update in real time to reflect the new category totals.
3. WHEN a Transaction is deleted, THE Pie_Chart SHALL update in real time to reflect the revised category totals.
4. THE Pie_Chart SHALL use the following colors for default categories: green (`#4CAF50`) for Food, blue (`#2196F3`) for Transport, and orange (`#FF9800`) for Fun.
5. THE App SHALL render a Legend beneath the Pie_Chart showing a colored dot and label for each category present in the chart.
6. WHEN the Transaction_List contains no transactions, THE Pie_Chart SHALL display an empty state (no segments).

---

### Requirement 5: Custom Categories

**User Story:** As a user, I want to create my own expense categories with a custom name and color, so that I can organize spending beyond the default options.

#### Acceptance Criteria

1. THE Input_Form category dropdown SHALL include a "+ Add New Category" option as the last item.
2. WHEN the user selects "+ Add New Category" from the dropdown, THE App SHALL open the Category_Modal.
3. THE Category_Modal SHALL contain a text field for the category name and a color picker for the category color.
4. WHEN the user confirms the Category_Modal with a non-empty category name and a selected color, THE App SHALL add the new Custom_Category to the category dropdown and SHALL select it as the current value.
5. IF the user confirms the Category_Modal with an empty category name, THEN THE Category_Modal SHALL display an error message and SHALL remain open.
6. WHEN the user cancels or dismisses the Category_Modal, THE App SHALL close the modal and SHALL restore the dropdown to its previously selected value.
7. WHEN a Custom_Category is used in a Transaction, THE Pie_Chart SHALL render the Custom_Category segment using the color chosen during creation.

---

### Requirement 6: Monthly Budget Limit and Alerts

**User Story:** As a user, I want to set a monthly spending limit and be warned when I exceed it, so that I can stay within my budget.

#### Acceptance Criteria

1. THE App SHALL display a Monthly_Limit numeric input field in the header card, below the Total_Balance.
2. WHEN the user enters a positive numeric value in the Monthly_Limit field, THE App SHALL store that value as the active spending threshold.
3. WHEN the Total_Balance exceeds the Monthly_Limit, THE App SHALL render the Total_Balance amount in red (`#e53935`) and SHALL display a warning icon (⚠️) adjacent to the Total_Balance.
4. WHEN the Total_Balance is less than or equal to the Monthly_Limit, THE App SHALL render the Total_Balance in blue (`#2196F3`) and SHALL hide the warning icon.
5. IF the Monthly_Limit field is empty or zero, THEN THE App SHALL disable budget alert evaluation and SHALL display the Total_Balance in its default blue color.

---

### Requirement 7: Light and Dark Theme Toggle

**User Story:** As a user, I want to switch between a light and dark visual theme, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE App SHALL display a Theme_Toggle icon button in the top-right area of the header card: a moon icon (🌙) when in light mode, a sun icon (☀️) when in dark mode.
2. WHEN the user activates the Theme_Toggle while the App is in light mode, THE App SHALL switch to dark mode: page background becomes dark slate (`#1e293b`), cards become dark (`#0f172a`), and all text becomes white or light gray.
3. WHEN the user activates the Theme_Toggle while the App is in dark mode, THE App SHALL switch to light mode: page background returns to `#f0f2f5`, cards return to white, and text returns to default dark colors.
4. WHEN the theme changes, THE Theme_Toggle icon SHALL update to reflect the new mode.
5. THE Total_Balance blue color, red Delete buttons, and category colors SHALL remain consistent in both light and dark modes.

---

### Requirement 8: Data Persistence

**User Story:** As a user, I want my transactions, categories, monthly limit, and theme preference to be saved automatically, so that my data is still available when I reopen the app.

#### Acceptance Criteria

1. WHEN a Transaction is added or deleted, THE App SHALL write the updated Transaction_List to Local_Storage.
2. WHEN a Custom_Category is created, THE App SHALL write the updated category list to Local_Storage.
3. WHEN the Monthly_Limit is changed, THE App SHALL write the new value to Local_Storage.
4. WHEN the theme is toggled, THE App SHALL write the active theme preference to Local_Storage.
5. WHEN the App initializes, THE App SHALL read all persisted data from Local_Storage and SHALL restore the Transaction_List, category list, Monthly_Limit, and theme to their last saved state.
6. IF Local_Storage contains no data on initialization, THEN THE App SHALL load with the default categories (Food, Transport, Fun), an empty Transaction_List, no Monthly_Limit, and light mode active.

---

### Requirement 9: Layout and Visual Design

**User Story:** As a user, I want a clean, well-structured interface that matches the reference design, so that the app is easy to read and navigate.

#### Acceptance Criteria

1. THE App SHALL render a page title "Expense & Budget Visualizer" in bold dark text, centered at the top of the page, outside any card.
2. THE App SHALL render three cards stacked vertically in this order: (1) Header card with Total_Balance centered and Monthly_Limit input below it, (2) "Add Transaction" card with the Input_Form, (3) a bottom row with the Transactions card on the left and the Spending by Category card on the right, side by side at approximately equal widths.
3. THE App SHALL use a light gray page background (`#f0f2f5`) in light mode.
4. ALL cards SHALL have a white background, rounded corners (≥8px radius), and a subtle box shadow in light mode.
5. THE App SHALL use a single CSS file located at `css/styles.css` and a single JavaScript file located at `js/app.js`.
6. THE App SHALL use the system sans-serif font stack with clear label/value hierarchy: small gray uppercase labels above large bold values.
7. ALL form fields (Item Name, Amount, Category) SHALL have visible border outlines, full-width within the card, and consistent padding.

---

### Requirement 10: Browser Compatibility

**User Story:** As a user, I want the app to work in any modern browser without installation, so that I can use it anywhere.

#### Acceptance Criteria

1. THE App SHALL function correctly in the current stable releases of Chrome, Firefox, Edge, and Safari without requiring any build step, server, or framework.
2. THE App SHALL be openable directly as a standalone HTML file from the local filesystem.
