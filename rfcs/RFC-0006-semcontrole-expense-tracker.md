# RFC-0006: SemControle Expense Tracker

## Status

Implemented — v1 shipped as an auto-loaded backend plugin in `hermes-agent`.

## Summary

SemControle is a Hermes-based personal expense tracking and categorization plugin. It allows users to log expenses via voice or chat messages, automatically categorizes them, and provides deterministic mathematical summaries and queries (without LLM arithmetic hallucinations) with strict multi-user privacy isolation.

## Motivation

To replace legacy OpenFinance integrations with a lightweight, natural-language voice/chat tracker. The plugin runs in shared environments (such as Leonardo's household) where multiple users interact with the same bot, requiring strict data isolation based on their platform identities (e.g., phone numbers).

## Initial Scope

- Record a single expense from a text or voice message (using LLM to extract amount, description, date, and category).
- Record multiple expenses parallelly in a single turn using parallel tool-calling.
- Automatically categorize expenses if none are provided, or let the agent determine a logical category.
- Search expenses with filters (category, date range, description).
- Sum and summarize expenses by category using 100% deterministic database queries.
- Delete expenses by ID with permission checks (users can only delete their own data).
- Strict multi-user data isolation: filter all database operations by `user_id` parsed from the gateway context (`HERMES_SESSION_USER_ID`).
- Dual database support: SQLite for local/testing zero-config, PostgreSQL for production deployments via `hermes-infra`.

## Out of Scope

- Budget limit alerts.
- Bank statement ingestion (CSV/OFX).
- Currency conversion.
- Receipt OCR (to be handled by a separate vision skill if needed).

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY, -- INTEGER PRIMARY KEY AUTOINCREMENT in SQLite
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- TEXT in SQLite
);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);
```

## Acceptance Criteria

- [x] Records expense from user message (amount, description, date, category).
- [x] Automatic category assignment (Alimentação, Transporte, Moradia, Lazer, Compras, Saúde, Educação, Outros).
- [x] Query expenses with filters.
- [x] 100% deterministic category-wise sum and summary.
- [x] User-scoped isolation based on `HERMES_SESSION_USER_ID`.
- [x] Dual connection support: SQLite fallback + PostgreSQL driver.
- [x] Multi-user isolation unit tests and manual verification pass.
