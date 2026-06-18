# 📋 Project Kanban Board

Manage client projects, track tasks, and visualize project pipelines using the interactive Kanban interface.

---

## 📁 Project Directory Folders

Tasks are organized inside project workspace directories:
* **Horizontal Navigation Badge Bar**: Switching folders is facilitated via a scrollable list of active tags.
* **Adding Folders**: Type a project name (e.g. `Client Acme`, `Personal`) and add it to initialize a blank workspace.
* **Folder Operations**: Rename or delete folders via settings commands. If a folder is deleted, all tasks within it are removed to prevent orphaned database records.

---

## 🏗️ Kanban Columns

Tasks move through three standard project stages:
1. **To Do**: Tasks queued for execution.
2. **In Progress**: Active assignments (running tasks here are aggregated on the main dashboard stats card).
3. **Done**: Completed tasks.

---

## 📝 Task Details & Subtasks

* **Description & Checklists**: Outline objectives and break tasks down into actionable subtasks.
* **Interactive Subtask Checkboxes**: Checking off subtasks updates progress directly inside the list card.
* **Priority Levels**: Set task urgency (Low, Medium, High) with visual badges.
* **Due Dates**: Deadlines help highlight overdue tasks.
