# Initiative: Hermes Recreational Betting

## Status

Draft

## Product

Hermes Experiments

## Summary

Hermes Recreational Betting is an interactive, token-based prediction game designed for friends within group chats (WhatsApp/Telegram). It allows users to place friendly bets on monitored game outcomes (such as football matches or esports events) using virtual, non-monetary tokens.

The system is managed by a designated group Administrator (Admin), who controls the token supply (deposits/withdrawals). All bets are pooled into a single "bucket." Winning bets split the bucket pool equally, minus an Admin-defined toll/penalty percentage (e.g., 20%). The collected toll tokens are automatically sent to a burn balance (destroyed), ensuring a deflationary token economy where the token supply gradually decreases, requiring the Admin to periodically mint new tokens.

## Problem

Friendly prediction groups (like football match pools or office sweepstakes) are hard to manage manually. Existing sports betting platforms involve real money, which introduces legal complexity, risk, and changes the nature of friendly competition. There is a need for a lightweight, gamified, and completely risk-free prediction platform integrated directly into chat groups where friends already communicate.

## Objective

Deliver a fun, non-monetary, and automated peer-to-peer prediction game for chat groups managed by an Admin, utilizing a deflationary token economy.

## Target Users

- Groups of friends, co-workers, or community members who enjoy predicting sports/game outcomes.
- Group administrators wanting an automated tool to run sweepstakes or friendly betting pools.
- Users looking for a risk-free, gamified social experience.

## Scope

- **Token Ledger:** A simple database ledger tracking token balances for each participant, including a special "burned" address.
- **Admin Control Panel:** Bot commands allowing the group Admin to:
  - Mint new tokens.
  - Deposit tokens to a participant's account.
  - Withdraw/confiscate tokens from a participant's account.
  - Set the winning toll percentage (e.g., 0% to 50%).
- **Bucket Pool Betting Engine:** 
  - Register predictions for an active game event.
  - Pool all bet tokens into a single bucket.
  - Calculate winners and distribute tokens (applying the toll fee and burning the toll amount).
- **Game/Match Monitor:** Simple integration to track match results or manual Admin resolution to declare the winning outcome.

## Out of Scope

- Real money integrations, payment gateways, or cryptocurrency/blockchain tokens (fully simulated virtual tokens only).
- Large-scale public casino games (designed specifically for private friend groups/chats).

## Success Criteria

- Admins can mint and distribute virtual tokens to group members via chat commands.
- Group members can place token bets on a listed match/event.
- When an event is resolved, the system pools the tokens, deducts the Admin toll, distributes the remainder to winners, and permanently logs the tolled tokens as burned.
- System provides balance sheets and ranking charts (e.g., `/ranking`, `/balance`).

## Related Epics

- [ ] Epic: Token Ledger & Admin Supply Management
- [ ] Epic: Event Creation & Bet Placement Engine (Bucket Pools)
- [ ] Epic: Toll Calculation & Deflationary Burn Mechanism
- [ ] Epic: Leaderboard, Match Monitoring & Resolution Interface

## Dependencies

- Database storage (SQLite or PostgreSQL) for ledger and match tracking.
- Notification gateway (WhatsApp/Telegram API) to broadcast odds, bets, and match results.
- External API or Admin interface to fetch/verify match results.

## Risks

- Virtual tokens could trigger platform terms of service issues if perceived as real gambling (mitigated by strict copy highlighting that tokens are free, non-monetary, and have zero real-world value).
- Admin abuse (mitigated by public chat logs showing all Admin mint/burn actions transparently).

## Open Questions

- Should we integrate with free public sports APIs to fetch match results automatically, or rely on manual Admin resolution?
- Should the bot suggest odds, or is the payout ratio strictly determined by the bucket pool ratio (pari-mutuel)?
- What is the default toll percentage for new groups?
