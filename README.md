# gryndset // Unified Freelancer Dashboard

[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Architecture](https://img.shields.io/badge/Architecture-Local--First-000000?style=for-the-badge&logo=webauthn&logoColor=white)]()
[![Privacy](https://img.shields.io/badge/Privacy-100%25--Local-10B981?style=for-the-badge&logo=securityscorecard&logoColor=white)]()

A premium, local-first dashboard shell built for freelancers. **gryndset** is styled with a sleek glassmorphic dark-mode interface and fully optimized for desktop, tablet, and mobile viewports. It provides a suite of productivity and finance tracking tools while keeping 100% of user data strictly on their local device.

For detailed guides, usage instructions, and features of each tool, check out the **[Documentation Wiki](wiki/Home.md)** folder in this repository.

---

## Key Features

### 📊 System Dashboard
* **Quick Stats Overview**: Live metrics aggregating project tasks, active habit streaks, and financial account balances in one view.
* **Scratchpad Widget**: A quick note-taking canvas that auto-saves as you type.
* **Command Palette (⌘K)**: A global command center for quick navigation and quick actions (like adding a note or logging a transaction) from anywhere in the OS.

### 💰 Finance Tracker
* **Ledger Ledger**: Log income and expenses with descriptions, categories, and account names.
* **Summary Cards**: Track total income, total expenses, and net savings.
* **Target Budgets**: View a visual progress bar for monthly spending budgets.

### 📈 Investments Tracker (WIP 🚧)
* **Stock & Crypto Orders**: Record buy/sell trades with ticker symbols, purchase prices, and share quantities.
* **Binance API Integration**: Fetch current market prices for cryptocurrencies in real-time.
* **Portfolio Analytics**: View asset distributions via donut charts and performance history via dynamic SVG graphs.
* > [!NOTE]
  > The Investment Tracker is currently a **Work In Progress (WIP)**. If you run into any issues, encounter price fetching bugs, or have feature ideas, please let me know by opening an issue!

### 📋 Project Kanban
* **Folder/Board Directory**: Group tasks by clients or projects.
* **Kanban Columns**: Drag-and-drop tasks across "To Do", "In Progress", and "Done" columns.
* **Task Details**: Manage checklists, subtasks, priorities, and deadlines.

### ⚡ Habit Checklist
* **Progress Streaks**: Track daily checklists with interactive checkboxes.
* **Visual Grid Matrix**: View habit consistency over the year.
* **Adaptive Streaks**: Auto-calculates active streaks and completion rates.

### 📝 Notes Organizer
* **Live Markdown Preview**: A split-screen editor parsing raw markdown to formatted HTML in real-time.
* **Folder Structure**: Organize notes by folders and quickly search contents.
* **Pinning**: Pin critical notes to the top of the list for quick access.

### ⚙️ Settings & Database Maintenance
* **Data Management**: View exact database storage size in real-time.
* **Portable Backups**: Export your entire database to a single `.json` file, or import it to sync across devices.
* **Factory Reset**: Wipe local state to start fresh.

---

## 🔒 Local-First & Privacy Architecture

Unlike modern web applications that sync your credentials and data to cloud servers, **gryndset** operates with a **strict local-first architecture**:
1. **Zero Database Servers**: All data is stored in the browser's `localStorage` API.
2. **Offline Ready**: The app runs completely offline. No network requests are made, and no analytical trackers are loaded.
3. **No Login Required**: The dashboard is instantly usable out of the box.

### Database Backups
To prevent data loss (e.g. from clearing browser cookies/cache), you can use the **Database Maintenance** panel in the **Settings App** to export your entire data profile as a portable JSON file. You can import this JSON file on any browser or device running gryndset to restore your workspace.

---

## 🚀 Getting Started

### Development Setup (Node.js & npm)
To run the project in development mode:

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/your-username/gryndset.git
   cd gryndset
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite local server:
   ```bash
   npm run dev
   ```
4. Access the dashboard:
   * **On your computer**: `http://localhost:5173/`
   * **On your phone/tablet**: Connect your mobile device to the same Wi-Fi network and navigate to the `http://192.168.x.x:5173/` network URL printed in your terminal.

---

## 📦 Sharing & Portable Running (No Node.js Required)

If you want to share this app with clients or freelancers who do not have developer tools (Node/npm) installed, they can run it locally:

### Option A: Portable Local Web Server (Releases Zip)
1. Download the pre-built static package (e.g., `gryndset-release.zip`) from the **GitHub Releases** page.
2. Extract the ZIP file folder on your computer.
3. **Run a local static server**:
   * **Using Python** (pre-installed on macOS/Linux): Open the terminal inside the folder and run:
     ```bash
     python -m http.server 8000
     ```
     Then open `http://localhost:8000` in your browser.
   * **Using a browser extension**: Install a lightweight local server extension (like *Live Server* for VS Code, or *Web Server for Chrome*) and select the extracted folder.
   * **Double-Click Portable Executables**: You can also use a tiny single-file web server executable (like Caddy or serve-local) placed inside the folder.

### Option B: Free Cloud Hosting & Netlify Deployment
Since **gryndset** compiles into clean, static HTML/JS/CSS assets, you can deploy the dashboard on Netlify or similar free static hosts.

#### How to Deploy on Netlify:
1. **Direct Upload (No Git required)**:
   - Run `npm run build` locally to compile the production bundle.
   - Go to [Netlify Drop](https://app.netlify.com/drop) and log in.
   - Drag and drop your compiled `dist/` folder directly onto the page.
   - Netlify will instantly deploy your static site and provide a custom URL!
2. **Continuous Deployment via GitHub**:
   - Push your repository to GitHub.
   - Go to Netlify, click **Add new site** > **Import an existing project** and connect your GitHub account.
   - Select the `gryndset` repository.
   - Set the following build settings:
     * **Build command**: `npm run build`
     * **Publish directory**: `dist`
   - Click **Deploy site**. Netlify will now automatically rebuild and redeploy your dashboard whenever you push updates to GitHub.

---

## 🛠️ Tech Stack
* **Framework**: React 19 + Vite 8
* **Icons**: [Lucide React](https://lucide.dev)
* **Styling**: Vanilla CSS (Modern custom variables, Glassmorphism, and full mobile flex/grid responsiveness)

---

## 🎨 Built by On The Pieces
**gryndset** is designed and maintained by **On The Pieces**. We build bespoke, highly functional, and visually premium tools and designs.

* **Website**: [onthepieces.in](https://onthepieces.in/)
* **Platform**: Local-First Product Suite
