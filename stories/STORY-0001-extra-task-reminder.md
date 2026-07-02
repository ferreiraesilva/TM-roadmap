# User Story: Extra task reminder requested by assigner or assignee

## Status

Draft

## Product

TaskMe

## Related Epic

No dedicated epic yet. Post-MVP enhancement to TaskMe (see `/rfcs/RFC-0001-taskme-mvp.md`). If the reminder/scheduling surface grows, promote to an epic (candidate: "Task Reminder Engine").

## Story

As a task assigner or assignee, I want to set an extra reminder on a chosen day (day X) for a task due on a later day (day Y), so that I am proactively warned about the upcoming task before its due date.

## Context

Today TaskMe only notifies through the Monday digest and the due-date charge. Users want an ad-hoc, per-task reminder: "warn me on day X that this task is due on day Y." Both the person who created the task and the person who must deliver it may want this, independently. The reminder is a personal aid — it is delivered to the requester, not to the other party.

This must respect the channel-scoping model already in place: the reminder is delivered on the requester's channel (`whatsapp` | `telegram`).

## Functional Requirements

- Either the assigner or the assignee of a task can request an extra reminder for that task.
- The requester provides a target date (day X) using natural language, resolved with the existing `dates.resolve_due` logic (timezone `America/Sao_Paulo`).
- Day X must be today or later and should be on or before the task due date (day Y). Reject dates after the due date, or treat them as an open question (see below).
- On day X, the system sends a reminder message to the requester, on the requester's channel, referencing the task code, title and due date (day Y).
- The reminder is skipped/cancelled automatically if the task is completed or rejected before day X.
- The reminder request is recorded in the task history.
- A dedicated tool (e.g. `taskme_lembrete`) exposes this to the agent; the daily cron delivers due reminders (reuse the existing dispatch/cron infrastructure).

## Acceptance Criteria

- [ ] Given a pending task due on day Y, when the assignee asks to be reminded on an earlier day X, then the system stores the reminder scoped to the assignee and their channel and confirms it.
- [ ] Given a stored extra reminder for day X, when day X arrives, then the requester receives a reminder message on their channel referencing the task code, title and due date.
- [ ] Given a task with a pending extra reminder, when the task is completed or rejected before day X, then the reminder is not sent.
- [ ] Given an assigner and an assignee who each set their own reminder for the same task, when each day X arrives, then each person receives only their own reminder on their own channel.

## Out of Scope

- Recurring reminders (daily/weekly repetition).
- Reminders addressed to a third party (only the requester is reminded).
- Reminder editing UI beyond create/cancel (may be a follow-up).

## Dependencies

- Cron/scheduler infrastructure (existing TaskMe cron jobs and `dispatch.py`).
- Channel scoping (implemented — task and delivery are already channel-aware).
- Natural-language date resolution (`taskme/dates.py`).
- New persistence for scheduled reminders (new table/migration).

## Notes

- Open question: should day X after the due date (day Y) be rejected, or allowed as a late follow-up reminder?
- Open question: cap on the number of extra reminders per task per person?
- Requested by the product owner on 2026-07-02; implementation deferred ("depois implementamos").
