# TrueMobile Roadmap (TM-roadmap)

This repository centralizes the roadmap, product planning, technical decisions, RFCs, epics, user stories, spikes and documentation for the TrueMobile portfolio.

TrueMobile encompasses independent projects such as MinhaIncorporadora, tm-infra, and the Hermes Platform (the base agent runtime and its dependents like TaskMe and SemControle).

This repository is not primarily a source-code repository. Its purpose is to organize the evolution of the TrueMobile projects and connect ideas, features, products, issues, repositories and releases in one place.

## Repository Language

All repository content must be written in English.

This includes:

* README files
* Documentation
* Issues
* Pull requests
* Comments
* RFCs
* Decision records
* Epics
* User stories
* Technical tasks
* Spikes
* Templates
* Commit messages, whenever possible

The user may discuss ideas with an AI assistant in any language, but all generated records committed to this repository must be written in English.

## Purpose

The goal of this repository is to serve as the coordination layer for everything related to Hermes-based products, modules, features and experiments.

It should help answer questions such as:

* What are we building?
* Why are we building it?
* Which repository owns each feature or product?
* What is still an idea?
* What is in discovery?
* What is ready for development?
* What depends directly on Hermes?
* What is part of the current roadmap?
* What decisions have already been made?
* What still needs to be decided?

## Repository Role

This repository is used for:

* Product vision
* Roadmap planning
* Feature discovery
* Technical decisions
* Architecture notes
* RFCs
* Initiatives
* Epics
* User stories
* Technical tasks
* Spikes
* Cross-repository planning
* Release planning
* Documentation templates

Actual implementation happens in dedicated repositories. The TrueMobile portfolio consists of:

* `MinhaIncorporadora` — Standalone real estate sales assistant.
* `tm-infra` — Standalone production infrastructure (inventory, environments, database cluster, edge routing).
* `Hermes` — Base agent platform (`hermes-agent`) and its direct plugins/dependents (`hermes-taskme`, `hermes-multgrupo`, `SemControle`, etc.).

## What Belongs Here

This repository should contain records that help organize, explain or govern the Hermes ecosystem.

Examples:

* Product vision documents
* Roadmap items
* RFCs for new features or products
* Architecture and product decision records
* Initiative definitions
* Epic definitions
* User story specifications
* Technical task definitions
* Spikes and research notes
* Templates for planning and execution
* Cross-repository planning documentation

## What Does Not Belong Here

This repository should not become a dumping ground for unrelated content.

Avoid storing:

* Application source code, unless explicitly needed for documentation examples
* Temporary notes without structure
* Unreviewed random ideas with no context
* Implementation details that belong in a product repository
* Secrets, credentials, API keys or private configuration files
* Production data
* Personal or sensitive information

## Project Structure

```text
/
├── README.md
├── AGENTS.md
├── product-vision/
│   └── hermes-ecosystem.md
├── rfcs/
│   ├── RFC-0001-taskme-mvp.md
│   └── RFC-0002-whatsapp-group-personality.md
├── decisions/
│   └── YYYY-MM-DD-decision-title.md
├── templates/
│   ├── initiative-template.md
│   ├── epic-template.md
│   ├── user-story-template.md
│   ├── technical-task-template.md
│   ├── spike-template.md
│   └── rfc-template.md
└── docs/
    └── additional-documentation.md
```

The installation and deployment model adds these files to the project structure:

```text
config/
  product-catalog.md
  hermes-baseline.yaml
  installations.yaml
  product-deployments.yaml

docs/
  hermes-installation-blueprint.md
  product-deployment-model.md

templates/
  hermes-installation-template.md
  product-deployment-template.md
```

## Hermes Installation Model

The **Hermes Baseline** defines the global governance and human-approval rules inherited by every Hermes installation. A **Hermes Installation** is a concrete agent instance with its own identity, environment, permissions and enabled products. The **Product Deployment Model** defines whether each cataloged product is global, limited to selected installations, not deployed or still in draft.

The product catalog defines official names; it does not enable products. Agents should operate and propose changes to the configuration files, while the human reviews and approves installation and deployment decisions instead of configuring every installation manually.

Detailed guidance is available in `/docs/hermes-installation-blueprint.md` and `/docs/product-deployment-model.md`.

## Main Directories

### `/product-vision`

Stores product vision, principles, positioning and long-term direction for the Hermes ecosystem.

Examples:

* Hermes ecosystem vision
* Product principles
* Target users
* Product boundaries
* Long-term roadmap direction

### `/rfcs`

Stores Requests for Comments for relevant product, technical or architectural proposals.

RFCs should be used before implementing larger features, modules or products that require structured discussion.

Examples:

* TaskMe MVP
* WhatsApp Group Personality
* Hermes Contact Resolution
* Reminder Scheduling Strategy
* Group Memory Model

### `/decisions`

Stores product and architecture decision records.

Decision records should be created when an important decision has already been made and should remain traceable.

Decision files must follow this naming pattern:

```text
YYYY-MM-DD-decision-title.md
```

Example:

```text
2026-06-19-use-personal-github-project.md
```

### `/templates`

Stores reusable templates for structured planning records.

Templates should be used when creating:

* Initiatives
* Epics
* User stories
* Technical tasks
* Spikes
* RFCs

### `/docs`

Stores additional documentation that does not fit into product vision, RFCs, decisions or templates.

### `/config`

Stores the official product catalog, global Hermes baseline, installation catalog and product deployment matrix used by agents and future automation.

## AI Agent Instructions

AI agents working in this repository must follow the instructions defined in `AGENTS.md`.

All initiatives, epics, user stories, technical tasks, spikes, RFCs and decision records should be created using the templates available in `/templates`.

The goal is to keep planning records structured, traceable and consistent across the Hermes ecosystem.

AI agents must not create unstructured planning documents when a template exists for the intended record type.

## Working Model

Ideas should start as lightweight roadmap items.

When an idea becomes relevant, it should move through the following flow:

```text
Idea → Discovery → Spec → Ready → In Development → Review → Testing → Done
```

Large initiatives should be represented as initiatives or epics and broken down into smaller records.

Preferred hierarchy:

```text
Initiative
└── Epic
    ├── User Story
    ├── Technical Task
    └── Spike
```

Do not create unnecessary hierarchy. Small items may be created directly as user stories, technical tasks or spikes when no initiative or epic is needed.

## Record Types

### Initiative

Use an Initiative when the subject is a large product, module or strategic effort.

Examples:

* TaskMe MVP
* WhatsApp Group Personality
* Hermes Contact Resolution
* Hermes Memory Management
* Hermes SDK

### Epic

Use an Epic when the subject is a major functional block inside an initiative or product.

Examples:

* Task Creation Flow
* Weekly Reminder Engine
* WhatsApp Contact Resolution
* Due Date Rescheduling
* Group Personality Configuration

### User Story

Use a User Story when the subject describes user-facing behavior or an expected user outcome.

Example:

```text
As a user, I want to create a task by sending an audio message, so that I can assign tasks quickly without typing.
```

### Technical Task

Use a Technical Task when the subject is implementation work that does not need to be expressed as a user story.

Examples:

* Create task database schema
* Implement WhatsApp message adapter
* Add task status enum
* Create contact lookup service
* Configure repository CI

### Spike

Use a Spike when the subject is investigation, validation or research before deciding how to implement something.

Examples:

* Investigate WhatsApp contact access options
* Evaluate audio transcription alternatives
* Validate scheduling strategy for recurring reminders
* Compare storage options for task history

### RFC

Use an RFC when the subject is a relevant product, technical or architectural proposal that needs structured discussion before implementation.

Examples:

* TaskMe MVP
* WhatsApp Group Personality
* Hermes Contact Resolution Strategy
* Task Reminder Scheduling Architecture
* Group Memory Model

### Decision Record

Use a Decision Record when a relevant product or technical decision has already been made.

Examples:

* Use personal GitHub Project for TrueMobile roadmap
* Treat TaskMe as a standalone Hermes-based product
* Store planning records in English
* Use RFCs before large product changes

## GitHub Project

The Hermes ecosystem should be managed through a GitHub Project connected to this repository and other Hermes-based repositories.

Project name (in use):

```text
Hermes Ecosystem
```

Recommended views:

* Roadmap
* Backlog
* Kanban
* By Product
* By Repository
* By Release
* By Priority
* By Status

Recommended fields:

```text
Product
Type
Status
Priority
Maturity
Hermes Dependency
Target Repository
Release
Owner
```

Recommended product values (source of truth: `/config/product-catalog.md`):

```text
Hermes Core
TaskMe
MinhaIncorporadora
Investimentos
Governança
WhatsApp Group Personality
Hermes Experiments
Other
```

Recommended type values:

```text
Idea
Initiative
Epic
User Story
Technical Task
Spike
RFC
Decision
Bug
Documentation
Technical Debt
```

Recommended status values:

```text
Idea
Discovery
Spec
Ready
In Development
Review
Testing
Done
Parked
Blocked
```

Recommended priority values:

```text
P0 - Critical
P1 - High
P2 - Medium
P3 - Low
```

Recommended Hermes dependency values:

```text
Low
Medium
High
Blocking
```

Dependency definitions:

* Low: Can work with minimal Hermes integration.
* Medium: Depends on Hermes for some flows.
* High: Depends on Hermes for most core behavior.
* Blocking: Cannot operate without Hermes changes or Hermes availability.

## Initial Initiatives

### TaskMe

TaskMe is a Hermes-based task control system that allows users to create, assign, remind and follow up on tasks through text or audio messages.

Initial scope may include:

* Create tasks from text messages
* Create tasks from audio messages
* Transcribe audio before processing
* Identify the assigned person
* Validate the task due date
* Send the task to the assigned person
* Send weekly reminders until completion
* Allow due date rescheduling with justification
* Store task history and follow-up records

### WhatsApp Group Personality

WhatsApp Group Personality is a Hermes feature or module that allows each WhatsApp group to have its own behavior, tone, rules and contextual instructions.

Initial scope may include:

* Define a personality per WhatsApp group
* Store tone and behavior instructions
* Apply the correct personality when responding in a group
* Allow authorized users to change group personality settings
* Define default behavior when no custom personality exists

## Suggested Issue Title Prefixes

Use clear prefixes for GitHub issues:

```text
[INITIATIVE] TaskMe MVP
[EPIC] Weekly Reminder Engine
[STORY] Create task from audio message
[TASK] Create task database schema
[SPIKE] Investigate WhatsApp contact access
[RFC] TaskMe MVP
[DECISION] Use personal GitHub Project
```

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

RFCs must use this pattern:

```text
RFC-0001-title.md
RFC-0002-title.md
RFC-0003-title.md
```

Decision records must use this pattern:

```text
YYYY-MM-DD-title.md
```

Example:

```text
2026-06-19-use-personal-github-project.md
```

## Contribution Workflow

When creating or updating a planning record:

1. Discuss the idea.
2. Identify the correct record type.
3. Use the appropriate template from `/templates`.
4. Write the content in English.
5. Keep the scope clear and focused.
6. Mark missing information as `To be defined` or `Open question`.
7. Add assumptions only when they are safe and explicit.
8. Link related initiatives, epics, issues, RFCs or repositories when available.
9. Add acceptance criteria when the record describes work to be completed.
10. Update the GitHub Project with the correct fields.

## Writing Standards

All records must be:

* Written in English
* Clear
* Specific
* Actionable
* Easy to review
* Structured according to the selected template
* Traceable to a product, initiative, epic, issue or decision whenever possible

Avoid:

* Generic descriptions
* Overly broad scope
* Missing acceptance criteria
* Unclear dependencies
* Mixed product and technical decisions without separation
* Empty sections without explanation
* Unstructured planning notes

When information is missing, use:

```text
To be defined.
```

or:

```text
Open question: ...
```

or:

```text
Assumption: ...
```

Use assumptions only for low-risk details.

Use open questions for decisions that affect scope, architecture, data, security, integration or user experience.

## Acceptance Criteria

Acceptance criteria should preferably use the following format:

```text
Given [context], when [action], then [expected result].
```

Example:

```text
Given a user sends an audio message with a task request, when Hermes receives the message, then the system must transcribe the audio before extracting the task details.
```

## Guiding Principles

* Keep Hermes as the base platform.
* Treat large initiatives as products.
* Treat reusable capabilities as modules.
* Avoid creating repositories for every small idea.
* Use this repository to centralize roadmap, planning and decisions.
* Keep implementation details connected to the correct repository.
* Prefer clear specifications before development.
* Prefer small, focused issues over broad and vague issues.
* Prefer open questions over invented decisions.
* Prefer spikes when implementation is unclear.
* Prefer RFCs when a decision has architectural or product impact.
* Prefer decision records when a relevant decision has already been made.
* Keep the roadmap simple, visible and actionable.

## Current Status

Two products shipped and in homologation: **TaskMe** and **MinhaIncorporadora**.
For Leonardo's MAC02 HML environment, only the personal TaskMe profile is active
for now; the Leonardo corretores profile is parked until it is explicitly
reintroduced. Deployment is managed by `hermes-infra` (inventory-driven; profile
= container = bot). Naming standard adopted across the ecosystem — see
`decisions/2026-06-21-hermes-naming-standard.md` and
`decisions/2026-06-23-personal-hml-only.md`. The personal HML Hermes image is
now configured for daily digest-based updates with rollback; see
`decisions/2026-06-25-auto-update-hml-hermes-image.md`.

## Human-in-the-Loop Delivery Model

This repository follows a human-in-the-loop delivery model.

The AI agent is responsible for organizing, structuring and managing the product and delivery workflow, but the human user remains the final authority for approval, prioritization, sprint commitment, code acceptance and item closure.

### Human Role

The human contributor acts as:

* The client
* The primary user
* The source of product intent
* The final approver of generated documentation
* The person responsible for approving items into a sprint
* The reviewer of generated code
* The person who may modify generated code when needed
* The final acceptance authority for closing project items

The human explains what is needed in natural language. The AI agent must interpret that input and determine whether the request should become an initiative, epic, user story, technical task, spike, bug, RFC or decision record.

After the AI generates the required documentation and project records, the human reviews and approves them before they are considered ready for sprint execution.

The human may review, modify or reject AI-generated code.

A work item should only be closed when the human determines that the result is acceptable.

### AI Role

The AI agent acts as the operational product and delivery layer.

The AI agent may act as:

* Product Owner
* Project Manager
* Scrum Master
* Business Analyst
* Technical Writer
* Backlog Manager
* Coding Assistant

The AI agent is responsible for:

* Understanding informal user requests
* Asking for clarification when needed
* Classifying work into the correct record type
* Creating structured documentation
* Maintaining backlog clarity
* Breaking down initiatives into epics, stories, tasks and spikes
* Drafting bugs, RFCs and decision records
* Suggesting priorities and dependencies
* Preparing items for sprint review
* Generating implementation code when requested
* Supporting code refinement and review

The AI agent must not close project items without human acceptance.

The AI agent must not assume sprint commitment without human approval.

The AI agent must keep all repository records written in English.
