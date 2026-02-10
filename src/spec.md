# Specification

## Summary
**Goal:** Reduce impersonation risk during profile creation and remove crypto-like naming/jargon throughout the app.

**Planned changes:**
- Add a required “name claim” step during first-time profile setup, persist name-claim/verification metadata, and enforce at least one anti-impersonation rule on profile writes with clear plain-English errors.
- Show the user’s current name-claim/verification status in the authenticated profile area using non-crypto wording.
- Remove the automatic “_COIN” suffix from per-user asset naming everywhere (backend creation/lookup and all frontend displays), using only the person’s name/identifier.
- Update user-facing copy on key screens (landing, profile setup, dashboard, list/detail/order book) to replace crypto terminology with plain-English alternatives while keeping functionality unchanged.
- Update backend-generated per-user asset strings/metadata (e.g., name/description and any modified error text) to avoid crypto-themed terms, phrases, or emojis.

**User-visible outcome:** Users can create profiles only after explicitly claiming their name, see their claim/verification status, and use the app with non-crypto terminology and per-user assets labeled without “_COIN”.
