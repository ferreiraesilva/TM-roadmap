# User Story: Reject a task with an observation

## Status

Draft

## Product

TaskMe

## Related Epic

No dedicated epic yet. Post-MVP enhancement to TaskMe (see `/rfcs/RFC-0001-taskme-mvp.md`).

## Story

As a task assignee, I want to reject an assigned task with a written observation, so that the assigner knows I will not deliver it and understands the reason.

## Context

Today the assignee can only complete a task or renegotiate its due date. There is no way to decline a task. In practice some tasks are not accepted (wrong person, out of scope, cannot be done), and the assigner currently has no structured signal for that — the task simply lingers as pending until it is charged again.

Rejection must carry a mandatory observation (reason), notify the assigner in real time on the task's channel, and be recorded in the task history. It must also close any open charge for that task so the assignee is not charged again.

## Functional Requirements

- The assignee can reject a task they were assigned.
- A rejection requires a non-empty observation (reason).
- The task transitions to a terminal `rejected` status (new value in the task status model — requires a migration; current statuses are `pendente` and `concluida`).
- The assigner is notified immediately, on the task's channel, with the task code, title, assignee name and the observation.
- The rejection and its observation are stored in the task history (event).
- Any open charge/queue entry for that task is closed on rejection.
- Exposed through a dedicated tool (e.g. `taskme_recusar`) and, where possible, recognized in the deterministic charge-reply hook.

## Acceptance Criteria

- [ ] Given a pending task, when the assignee rejects it with an observation, then the task status becomes `rejected` and the observation is stored in history.
- [ ] Given a task rejected by the assignee, when the rejection is processed, then the assigner receives a real-time notification on the task's channel including the reason.
- [ ] Given a rejection attempt without an observation, when the assignee submits it, then the system asks for the reason and does not reject the task.
- [ ] Given a task with an open charge, when the assignee rejects it, then no further due-date charges are sent for that task.

## Out of Scope

- Reassignment or re-opening of a rejected task (may be a follow-up story).
- Assigner-initiated cancellation of a task (different concept from assignee rejection).

## Dependencies

- Task status model change (`rejected` status + migration).
- Charge/queue flow (close open charge on rejection).
- Notification templates for the assigner.
- Optional hook parsing to detect rejection intent in free text.

## Notes

- Open question: should a rejected task be reopenable or reassignable by the assigner, or is rejection final?
- Distinguish clearly from due-date rescheduling: rejection is a refusal to do the task, not a request for more time.
- Requested by the product owner on 2026-07-02; implementation deferred.
