# Initiative: Hermes Flashcards (English Learning Game)

## Status

Draft

## Product

Hermes Experiments

## Summary

Hermes Flashcards is an interactive, gamified flashcard system integrated into WhatsApp and Telegram to help users study and improve their English vocabulary and grammar. 

The system leverages spaced repetition (SRS) algorithms to schedule cards dynamically based on user performance. Users receive periodic flashcard challenges directly in their preferred messaging app and respond by selecting multiple-choice answers, writing translations, or rating their own recall. The assistant tracks progress and provides feedback, making vocabulary building a natural part of daily messaging interactions.

## Problem

Learning a language requires consistent practice and spaced repetition, but dedicated language learning apps are often forgotten or feel like chores. Users struggle to maintain a daily habit of opening external apps (like Anki or Duolingo). However, users open messaging apps like WhatsApp and Telegram multiple times a day, making it the perfect friction-free interface for quick micro-learning sessions.

## Objective

Create a friction-free, text/media-based flashcard game inside WhatsApp and Telegram that helps users consistently study and retain English vocabulary through daily messaging habits.

## Target Users

- Language learners looking to build or maintain a consistent vocabulary study habit.
- Busy individuals who prefer micro-learning sessions (1-2 minutes) throughout the day.
- Users who are already active on Telegram or WhatsApp.

## Scope

- **Spaced Repetition Engine:** Simple Leitner system or basic SRS algorithm to schedule card reviews.
- **Interactive Messaging Flows:** 
  - Daily challenge push notifications.
  - Multiple-choice buttons or quick text replies for answers.
  - Audio card support (pronouncing words/phrases using Text-to-Speech).
- **Personal Decks:** Support for default vocabulary decks (Common Phrasal Verbs, Business English, Idioms) and custom user-added words.
- **Statistics & Gamification:** Daily streaks, total cards mastered, and level/xp progression metrics.

## Out of Scope

- Full-fledged grammar courses or interactive speech evaluation.
- Live video lessons or peer-to-peer sharing (initial scope).
- Offline mode (messaging platform relies on active connection).

## Success Criteria

- User receives daily vocabulary challenges via WhatsApp/Telegram.
- System dynamically updates card intervals based on correct/incorrect answers.
- User can add a new word to their personal deck by messaging the bot (e.g., "Add word: leverage - alavancar").
- Streaks and statistics are updated and accessible via a command (e.g., `/stats`).

## Related Epics

- [ ] Epic: Flashcard Deck Management & Custom Inputs
- [ ] Epic: Spaced Repetition Scheduling Engine
- [ ] Epic: Interactive WhatsApp/Telegram Game Flows (Push & Answers)
- [ ] Epic: Statistics, Streaks and Gamification Ledger

## Dependencies

- Text-to-Speech (TTS) integration for pronunciation (e.g., OpenAI TTS or Google TTS).
- State/database storage for user progress and scheduled intervals (SQLite or PostgreSQL).
- Active WhatsApp/Telegram gateway connectors.

## Risks

- Messaging platform rate limits for daily notification pushes.
- User friction if notifications are too frequent or intrusive (needs customizable quiet hours and frequency settings).

## Open Questions

- What spaced repetition algorithm is best suited for a lightweight database (e.g. SQLite)?
- Should we support user deck import via CSV or JSON?
- How do we handle multi-language translation source/target decks?
