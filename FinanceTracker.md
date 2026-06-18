# 💰 Finance Tracker

The **Finance Tracker** is a comprehensive, local-first double-entry ledger optimized for freelancers. It allows you to monitor income channels, manage multiple currency accounts, track monthly budget utilization, and get smart warnings regarding cash flow deficits.

---

## 🏦 Multi-Account Tracking System

Freelancers can allocate transactions to separate financial repositories:
* **Default Accounts**: Comes preconfigured with **Cash** and **Bank Account**.
* **Manage Accounts Modal**: Open the accounts overlay card in the right column to:
  * Create new accounts (e.g., Credit Card, Business Savings) with custom initial balances.
  * Modify existing account names or adjust their starting funds.
  * **Safe Account Deletion**: When deleting an account, the app prompts you to select a transfer target account. All historical transactions associated with the deleted account are automatically migrated to the destination account to ensure your ledger history remains intact.
* **Dynamic Calculations**: Account balances are dynamically calculated in real time:
  $$\text{Balance} = \text{Initial Balance} + \sum \text{Income (Received)} - \sum \text{Expenses (Paid)}$$

---

## 📝 Logging Transactions

Use the form to record financial records:
* **Fields**: Description, Amount, Date, Category, Account, and Type/Status.
* **Transaction Types**:
  * **Expense (Paid)**: Immediately deducts from the designated account balance.
  * **Expense (Due)**: Logged as outstanding. Does not affect active balances until marked "paid".
  * **Income (Received)**: Instantly adds to the designated account balance.
  * **Income (Due)**: Marked as pending collection. Does not affect active balances until marked "received".
* **Interactive Status Toggles**: Click the status badge (e.g. `paid`/`due`) in the transaction ledger table to instantly toggle its payment state.

---

## 💡 Smart Financial Advisor Insights

The app reads your active monthly ledger to generate context-aware suggestions:
* **Deficit Warning**: Triggers if paid monthly expenses exceed income, showing the exact difference.
* **Surplus Opportunity**: Suggests allocating 50% of monthly savings surplus to the Investments Tracker.
* **Spending Sector Alert**: Analyzes your highest expense category and warns you if it consumes a high percentage of total monthly spending.
* **Limit Exceeded**: Warns if monthly expenditures exceed the budget cap set in Settings.

---

## 🔄 Subscription Renewals

Track monthly recurring costs (e.g., software SaaS, cloud hosting):
* **Automatic Logging**: Subscriptions check the current date on load. If a subscription renewal date has passed for the current month, a transaction is automatically appended to the ledger (`[Sub] Netflix`) under the default `Bank Account`.
* **Prevention**: The system scans the active month to ensure a subscription is never logged twice for the same billing cycle.
