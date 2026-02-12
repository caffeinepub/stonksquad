# Specification

## Summary
**Goal:** Let anyone view a per-user creator market cap trend over time via a public backend API and a trend graph UI from the Activity (leaderboard) page.

**Planned changes:**
- Add backend storage for per-user creator market cap time-series points, with an initial point at profile creation and appends on market-cap-changing events (at minimum, order placement).
- Add a new public backend query to fetch a specified user’s ordered (timestamp, value) trend series with response size limiting.
- Add a new public backend query to fetch a specified user’s public profile data (without requiring caller==user/admin), leaving existing restricted profile APIs unchanged.
- Add frontend UI on the Activity leaderboard to show a per-user mini trend (sparkline) or “View trend” action and a detailed graph view with labeled axes/values and empty-state handling.
- Add React Query hooks for the public profile and trend-series queries, and update leaderboard rows to use the new public profile query with loading/error states.

**User-visible outcome:** On the Activity leaderboard, viewers can open any user’s trend graph to see how that creator’s market cap has changed over time, without permission errors.
