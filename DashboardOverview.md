# 📊 System Dashboard & Overview

The **System Dashboard** serves as the central command shell of **gryndset**, aggregating quick indicators from all applications to give freelancers an instant overview of their day.

---

## 📈 Widgets & Core Panels

### 1. Global Status Bar & Filters
* **Month & Year Filters**: Located in the status bar header, these dropdown selectors globally filter all transaction logs, savings targets, and outstanding dues across the application.
* **Unified Digital Clock**: Displays active local time (automatically hidden on small mobile headers to optimize horizontal space).

### 2. Live Stats Cards
* **Tasks Tracker**: Displays the count of tasks currently marked "In Progress" in the Projects Kanban app.
* **Habits Consistency**: Shows the count of active habit streaks checked off today.
* **Net Balance**: Aggregates all financial account balances (Initial Balances + Income - Expenses) to display your current real-time net worth.

### 3. Scratchpad Widget
* An auto-saving notepad canvas located directly on the main dashboard.
* Great for brain dumps, daily schedules, draft checklist items, or temporary copy-paste buffers.
* Contents are automatically serialized and saved to your local storage database on every keystroke.

---

## ⌨️ Command Palette (⌘K)

Press `Ctrl + K` (Windows/Linux) or `Cmd + K` (macOS) from anywhere in the app to open the floating command terminal:
* **Fuzzy Search**: Quickly search for app pages, settings, or trigger direct system operations.
* **Actions Available**:
  * Navigate to Dashboard, Finance, Projects, Habits, Notes, Investments, or Settings.
  * Direct short-cuts to: "Add Transaction", "Create Note", "Add Task", "Toggle Theme", etc.

---

## ⚙️ Settings App & Backups

Accessible via the gear icon in the navigation dock:
* **Username & Currency**: Customize your profile name and BCP 47 locale currency (`₹`, `$`, `€`, `£`, `¥`, `₽`).
* **Financial Objectives**: Modify monthly budget caps, monthly savings goals, and yearly saving milestones.
* **Database Maintenance**:
  * Displays rough browser storage footprint.
  * **Export Backup**: Downloads your active workspace state as a formatted `gryndset-backup-YYYY-MM-DD.json` file.
  * **Import Backup**: Uploads a previously saved JSON backup to completely restore your settings, transactions, tasks, notes, and habits.
  * **Hard Reset**: Wipes local storage to restore factory settings.
