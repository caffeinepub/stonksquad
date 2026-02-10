# Specification

## Summary
**Goal:** Shift the UI from a cyberpunk look to a trading/alpha “terminal” aesthetic while keeping all existing features/routes, and ensure newly created assets start with $0 market cap until real price discovery.

**Planned changes:**
- Update global design tokens (colors, typography, radii, shadows/glows) to a trading/alpha palette and apply the look consistently across all existing pages (Landing, AppShell header/footer, Dashboard, People/Coins, Coin Detail, Activity/Leaderboard, Deposit, Withdraw).
- Replace the cyberpunk background implementation by updating the shared background component (currently `frontend/src/components/layout/CyberBackground.tsx`) and its usages so a new trading/alpha background treatment is used across public and authenticated layouts with readable overlays.
- Update backend market price/market-cap logic so assets with no qualifying price-discovery data return current price = 0 and market cap = 0 (including creator aggregated totals).
- Fix backend creator market-cap aggregation and ranking so per-creator totals correctly sum each created coin’s market cap, and rankings iterate over the actual creator/user set.
- Audit and fix coin/asset flows end-to-end (discovery/listing, symbol resolution, coin detail loading, order book loading, order placement), and add/improve frontend English empty/error states when backend data is missing/null.

**User-visible outcome:** The app retains all existing pages and functionality but appears as a trading/alpha terminal experience with a new background; newly created coins show $0 price/market cap until real activity occurs, creator market-cap rankings are correct, and coin pages handle empty/missing data without breaking.
