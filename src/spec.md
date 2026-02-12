# Specification

## Summary
**Goal:** Embed a per-asset price chart on each trade screen and simplify trading to a market-only, one-click amount-based flow, while removing the default starting asset balance.

**Planned changes:**
- Add an embedded chart on the asset trade screen (CoinDetailPage) that displays recent historical price data for the currently selected symbol and refreshes on an interval, with an English empty state when data is unavailable.
- Add a backend query API that returns deterministic, time-ordered (timestamp, price) points derived from recent orders for a given symbol (no external market data).
- Replace the existing limit-order buy/sell form with market orders only: a single amount-to-spend (USD/stablecoin) input per side, a live estimated execution preview (market price + estimated quantity), and one prominent button labeled exactly “Buy Market” / “Sell Market”.
- Add backend support for placing market buy/sell orders from an amount input by selecting a market price from the current order book, computing quantity, enforcing existing authorization/balance rules, and returning clear errors when price cannot be determined.
- Remove/reset the arbitrary starting “your assets” balance of 10,000 for new users and migrate existing state so the default balance no longer appears for existing users.
- Update the trade screen layout/styling to cohesively integrate the chart and simplified market-order widgets within the existing terminal/cyber theme, ensuring all new/changed UI text is English.

**User-visible outcome:** On each asset’s trade page, users can view an embedded, auto-updating recent price chart and place simplified market buy/sell orders by entering an amount to spend, seeing an execution estimate, and clicking “Buy Market” or “Sell Market”; users will no longer see a default starting balance of 10,000 units of their own asset.
