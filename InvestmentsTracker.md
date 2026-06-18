# 📈 Investments Tracker (WIP 🚧)

The **Investments Tracker** allows freelancers to monitor and evaluate their asset portfolios. It compiles transaction history, visualizes allocations, and fetches live asset prices.

> [!WARNING]
> **Active Development (WIP)**
> This module is currently under active development. If you experience ticker synchronization issues, price mismatch errors, or have suggestions for additional charts, please let us know by opening a GitHub issue!

---

## 💼 Core Features

### 1. Recording Trades
Log transactions for both **Stocks** and **Cryptocurrencies**:
* **Input Fields**: Asset Ticker (e.g., `BTC`, `AAPL`), Buy/Sell Order Type, Purchase Price, Share/Token Quantity, and Date.
* **Automatic Category Tagging**: Differentiates assets automatically based on ticker profiles.

### 2. Live Market Prices & Fetching
* **Public Ticker API**: Integrates a keyless public price fetching system connecting directly to public exchange APIs (e.g. Binance).
* **Multi-Currency FX Translation**: Since public crypto APIs return price feeds in USD (`$`), the app queries current exchange rates to automatically translate valuations to your profile's native currency (e.g. INR `₹`), keeping the overall portfolio integrated.
* **Simulated Valuation Fallbacks**: For markets where direct browser CORS access is restricted (e.g. Traditional Stocks), the app executes simulated updates utilizing volatility indices relative to your purchase basis.

### 3. Allocation & Historical Performance Charts
* **Portfolio Split Donut Chart**: Toggle between **Asset** (individual holdings distribution) and **Category** (total Stock vs Crypto allocation ratio).
* **Performance Valuation History**: Renders a dynamic SVG line chart mapping historical portfolio valuation over time, computed chronologically from your trade logs.

---

## 📱 Mobile Optimizations

The Investments module features tailored styling for mobile screen layouts (widths $\le$ 600px):
* **Holdings & Ledger Cards**: Multi-column tables are replaced by cards. Instead of wide horizontal rows, you see aggregated listings showing key data (Ticker, Market Value, Cost Basis, Quantity, Current Price, and P/L ratio) styled dynamically in clear segments.
* **Balanced Input Form**: The trade recorder layout switches to a 2-column grid. Small fields (Ticker/Name, Category/Action, and Quantity/Price) align horizontally in pairs, while the log trade button fills the entire width.
