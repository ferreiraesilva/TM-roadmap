# AGENTS.md

## Purpose

This repository is used to organize the Hermes ecosystem roadmap, product planning, technical decisions, RFCs, initiatives, epics, user stories, technical tasks, spikes, bugs and related documentation.

AI agents working in this repository must follow the structure, templates, catalog files and writing rules defined here.

The main goal is to keep all records consistent, useful, traceable and ready for human review.

## Core Rule

Do not create unstructured planning documents.

Whenever a new record is needed, choose the correct template from `/templates` and follow it.

If the user provides incomplete information, make reasonable assumptions only when safe and clearly mark them as assumptions or open questions.

## Repository Language

All repository records must be written in English.

The human user may discuss ideas with the AI assistant in any language, but all generated records committed to this repository must be written in English.

## Repository Scope

This repository does not primarily store application source code.

It stores:

* Product vision
* Roadmap planning
* Initiatives
* Epics
* User stories
* Technical tasks
* Spikes
* Bugs
* RFCs
* Architecture and product decisions
* Cross-repository planning
* Documentation templates
* Operational catalogs

Implementation happens in dedicated repositories under the **TrueMobile Portfolio**:

* `MinhaIncorporadora` — standalone real estate sales assistant.
* `tm-infra` — standalone production infrastructure manager.
* `Hermes` — base platform and its direct plugins/dependents:
  * `hermes-agent` — core agent platform.
  * `hermes-taskme` — TaskMe product.
  * `hermes-multgrupo` — WhatsApp Group Personality module.
  * `hermes-benchmark` — LLM benchmarking tool.
  * `hermes-infra` — legacy infrastructure (being decommissioned/integrated).

## Product Catalog Rule

The file `/config/product-catalog.md` is the single source of truth for product names in this repository.

AI agents must use the product names defined in that file when filling the `Product` field in initiatives, epics, user stories, technical tasks, spikes, bugs, RFCs and decision records.

AI agents must not create product name variations directly inside records.

If the human describes a new product, module or experiment that does not fit the existing catalog, the AI agent must:

1. Use `Other` temporarily if a record must be created immediately.
2. Add an open question asking whether a new product should be added to `/config/product-catalog.md`.
3. Propose the exact new product name.
4. Wait for human approval before treating the new product name as official.

Templates must not hardcode the full product list.

Templates must reference `/config/product-catalog.md` instead.

## How to Choose the Correct Record Type

Use the following rules.

### Initiative

Use an Initiative when the subject is a large product, module or strategic effort.

Examples:

* TaskMe MVP
* WhatsApp Group Personality
* Hermes Contact Resolution
* Hermes Memory Management
* Hermes SDK

Use the template:

```text
/templates/initiative-template.md
```

### Epic

Use an Epic when the subject is a major functional block inside an initiative or product.

Examples:

* Task Creation Flow
* Weekly Reminder Engine
* WhatsApp Contact Resolution
* Due Date Rescheduling
* Group Personality Configuration

Use the template:

```text
/templates/epic-template.md
```

### User Story

Use a User Story when the subject describes a user-facing behavior or expected user outcome.

Examples:

* As a user, I want to create a task by sending an audio message.
* As an admin, I want to define the personality of a WhatsApp group.
* As an assignee, I want to receive a reminder before the due date.

Use the template:

```text
/templates/user-story-template.md
```

### Technical Task

Use a Technical Task when the subject is implementation work that does not need to be expressed as a user story.

Examples:

* Create task database schema
* Implement WhatsApp message adapter
* Add task status enum
* Create contact lookup service
* Configure repository CI

Use the template:

```text
/templates/technical-task-template.md
```

### Spike

Use a Spike when the subject is investigation, validation or research before deciding how to implement something.

Examples:

* Investigate WhatsApp contact access options
* Evaluate audio transcription alternatives
* Validate scheduling strategy for recurring reminders
* Compare storage options for task history

Use the template:

```text
/templates/spike-template.md
```

### Bug

Use a Bug when an expected or previously working behavior is incorrect.

Examples:

* Task creation fails for audio messages.
* Hermes sends a reminder to the wrong person.
* Group personality is not applied in a WhatsApp group.
* A scheduled task reminder runs more than once.
* Contact resolution returns the wrong contact.

Use the template:

```text
/templates/bug-template.md
```

Severity describes the actual impact of the bug.

Priority describes how soon the bug should be addressed.

If the cause is unknown, create or link a Spike when investigation is needed.

### RFC

Use an RFC when the subject is a relevant product, technical or architectural proposal that needs structured discussion before implementation.

Examples:

* TaskMe MVP
* WhatsApp Group Personality
* Hermes Contact Resolution Strategy
* Task Reminder Scheduling Architecture
* Group Memory Model

Use the template:

```text
/templates/rfc-template.md
```

### Decision Record

Use a Decision Record when a relevant product or technical decision has already been made.

Decision files must be stored in:

```text
/decisions
```

File naming pattern:

```text
YYYY-MM-DD-decision-title.md
```

Example:

```text
2026-06-19-use-personal-github-project.md
```

## Preferred Hierarchy

Use this hierarchy when organizing work:

```text
Initiative
└── Epic
    ├── User Story
    ├── Technical Task
    ├── Spike
    └── Bug
```

Do not create unnecessary hierarchy.

Small items may be created directly as user stories, technical tasks, spikes or bugs when no initiative or epic is needed.

## Writing Standards

All records must be:

* Clear
* Specific
* Actionable
* Easy to review
* Written in professional English
* Structured according to the selected template
* Free from vague statements when possible

Avoid:

* Generic descriptions
* Overly broad scope
* Missing acceptance criteria
* Mixing product decisions with technical implementation without separation
* Creating documents with empty sections unless the section is explicitly marked as `To be defined`
* Creating product name variations outside `/config/product-catalog.md`

## Handling Missing Information

When information is missing, do not invent critical details.

Use one of the following:

```text
To be defined.
```

or

```text
Assumption: ...
```

or

```text
Open question: ...
```

Use assumptions only for low-risk details.

Use open questions for decisions that affect scope, architecture, data, security, integration or user experience.

## Required Fields by Record Type

### Initiative

Must include:

* Status
* Product
* Summary
* Problem
* Objective
* Scope
* Out of Scope
* Success Criteria
* Related Epics
* Dependencies
* Risks
* Open Questions
* Target Repositories

### Epic

Must include:

* Status
* Product
* Parent Initiative
* Problem
* Objective
* Scope
* Out of Scope
* User Flow
* Target Repository
* Dependencies
* User Stories
* Technical Tasks
* Acceptance Criteria

### User Story

Must include:

* Status
* Product
* Related Epic
* Story
* Context
* Functional Requirements
* Acceptance Criteria
* Out of Scope
* Dependencies
* Notes

Acceptance criteria should preferably use the following format:

```text
Given [context], when [action], then [expected result].
```

### Technical Task

Must include:

* Status
* Product
* Related Epic or Story
* Objective
* Technical Details
* Requirements
* Acceptance Criteria
* Dependencies
* Notes

### Spike

Must include:

* Status
* Product
* Related Epic or Initiative
* Question
* Context
* Research Scope
* Out of Scope
* Expected Output
* Timebox
* Findings
* Recommendation
* Follow-up Issues

### Bug

Must include:

* Status
* Product
* Severity
* Priority
* Related Area
* Environment
* Summary
* Current Behavior
* Expected Behavior
* Steps to Reproduce
* Evidence
* Impact
* Workaround
* Suspected Cause
* Proposed Fix
* Regression Risk
* Acceptance Criteria
* Related Issues
* Notes

### RFC

Must include:

* Status
* Product
* Summary
* Motivation
* Scope
* Out of Scope
* User Flow
* Functional Requirements
* Non-Functional Requirements
* Dependencies
* Risks
* Open Questions
* Acceptance Criteria

## Status Values

Use these status values when possible:

```text
Draft
Discovery
Ready
In Progress
Review
Testing
Done
Parked
Blocked
```

## Priority Values

Use these priority values when needed:

```text
P0 - Critical
P1 - High
P2 - Medium
P3 - Low
```

## Dependency Classification

When relevant, classify Hermes dependency as:

```text
Low
Medium
High
Blocking
```

Definitions:

* Low: Can work with minimal Hermes integration.
* Medium: Depends on Hermes for some flows.
* High: Depends on Hermes for most core behavior.
* Blocking: Cannot operate without Hermes changes or Hermes availability.

## File Naming Rules

Use lowercase filenames.

Use hyphens between words.

Avoid spaces.

Examples:

```text
taskme-mvp.md
whatsapp-group-personality.md
hermes-contact-resolution.md
weekly-reminder-engine.md
```

RFCs must use:

```text
RFC-0001-title.md
RFC-0002-title.md
```

Decision records must use:

```text
YYYY-MM-DD-title.md
```

## Issue Title Rules

Use clear prefixes:

```text
[INITIATIVE] TaskMe MVP
[EPIC] Weekly Reminder Engine
[STORY] Create task from audio message
[TASK] Create task database schema
[SPIKE] Investigate WhatsApp contact access
[BUG] Reminder is sent to the wrong assignee
[RFC] TaskMe MVP
[DECISION] Use personal GitHub Project
```

## When Creating GitHub Issues

When generating GitHub issues, always:

1. Select the correct type.
2. Use the correct template.
3. Fill every relevant section.
4. Select the product from `/config/product-catalog.md`.
5. Mark missing details as `To be defined` or `Open question`.
6. Add clear acceptance criteria.
7. Link to related initiative, epic, RFC or repository when available.
8. Avoid creating duplicate issues.
9. Keep the issue focused on one objective.

## When Updating Existing Records

When updating a document or issue:

1. Preserve the existing structure.
2. Do not remove useful context unless asked.
3. Add new information in the correct section.
4. Update status only when the user clearly indicates progress.
5. Add new open questions instead of hiding uncertainty.
6. If a decision was made, create or update a decision record.
7. If a new official product is approved, update `/config/product-catalog.md`.

## When Discussing With the User

During conversation with the user, the AI agent should help transform informal ideas into structured records.

The agent should identify whether the conversation is producing:

* A new idea
* An initiative
* An epic
* A user story
* A technical task
* A spike
* A bug
* An RFC
* A decision

Before generating a record, the agent should organize the information into:

* Product
* Problem
* Objective
* Scope
* Out of scope
* Dependencies
* Risks
* Acceptance criteria
* Open questions

## Quality Bar

A generated record is acceptable only if another person can read it and understand:

* What is being proposed
* Why it matters
* What product it belongs to
* What is included
* What is excluded
* What depends on Hermes
* Where implementation should happen
* What still needs to be decided
* How completion will be verified

## Default Behavior

When in doubt:

* Prefer clarity over completeness.
* Prefer a smaller, well-defined issue over a broad issue.
* Prefer open questions over invented decisions.
* Prefer a spike when implementation is unclear.
* Prefer a bug when expected behavior is broken.
* Prefer an RFC when a decision has architectural or product impact.
* Prefer a decision record when a decision has already been made.
* Prefer updating `/config/product-catalog.md` over spreading new product names across records.

## Human Approval and Acceptance Rules

AI agents must follow a human-in-the-loop workflow.

The human user is the final authority for:

* Product intent
* Scope approval
* Documentation approval
* Sprint commitment
* Code acceptance
* Final item closure

The AI agent may draft, organize, refine and recommend, but must not treat an item as approved until the human explicitly approves it.

### Work Classification

When the human describes a need, the AI agent must classify it as one of the following:

* Initiative
* Epic
* User Story
* Technical Task
* Spike
* Bug
* RFC
* Decision Record

The AI agent should then create or update the appropriate record using the correct template.

### Sprint Readiness

An item may only be considered ready for sprint execution when:

* The correct template has been used.
* The product was selected from `/config/product-catalog.md`.
* The scope is clear.
* Acceptance criteria are defined.
* Dependencies are identified.
* Open questions are either resolved or explicitly accepted.
* The human has approved the item for sprint execution.

### Item Closure

The AI agent must not close an item only because implementation was generated.

An item may be closed only when the human accepts the result.

Before closure, the AI agent should confirm that:

* The requested behavior was implemented.
* Acceptance criteria were met.
* Relevant documentation was updated.
* Known bugs or limitations were documented.
* The human explicitly approved the result.

### Code Generation

The AI agent may generate code, tests, scripts, configuration files and documentation.

The human may:

* Review generated code
* Modify generated code
* Reject generated code
* Request changes
* Accept the result
* Close the item after validation
Generated code should be treated as a proposed implementation until accepted by the human.

## LLM Selection Guidelines

Whenever the human requests to execute a task (e.g., using "executar"), the AI agent must analyze the task's complexity and suggest the most cost-efficient LLM from the available list to balance token consumption with implementation quality:

*   **Gemini 3.5 Flash (Low / Medium / High):** Suggest for low-complexity tasks, code generation scaffolding, simple refactoring, or running/parsing scripts.
*   **Gemini 3.1 Pro (Low / High):** Suggest for medium-complexity coding, database schema designs, API endpoints development, and test suite writing.
*   **Claude Sonnet 4.6 (Thinking):** Suggest for highly complex logic, UI/UX prompting instructions, structural refactorings, or debug tasks requiring deep reasoning.
*   **Claude Opus 4.6 (Thinking) / GPT-OSS 120B (Medium):** Suggest for critical architectural reviews or complex design decisions.
