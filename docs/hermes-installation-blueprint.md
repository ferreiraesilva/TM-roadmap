# Hermes Installation Blueprint

## Purpose

This blueprint defines a reusable model for configuring multiple Hermes Agent installations without requiring the human user to configure each instance manually.

## Three-Layer Model

### 1. Hermes Baseline

The global operating model inherited by every installation. It defines human approval gates, work classification, workflow statuses, agent rules, project fields and governance requirements.

Every Hermes installation must inherit the Hermes Baseline unless the human explicitly approves an exception.

### 2. Hermes Installation

A concrete Hermes Agent instance with its own identity, purpose, owner, environment, enabled products, channels, repositories, permissions and runtime context. Known installations are registered in `/config/installations.yaml`.

### 3. Product / Module Deployment

The decision about where a cataloged product is available. Deployment may be global, limited to selected installations, not deployed or still in draft. The source of truth is `/config/product-deployments.yaml`.

A product being present in the product catalog does not mean it is enabled in every Hermes installation.

## Configuration Ownership

The baseline contains rules shared by all installations, including human-in-the-loop approval, issue classification, sprint approval, pull request acceptance and closure requirements.

Installation-specific configuration contains identity, environment, owner, permissions, channels, repositories, runtime details and the resulting list of enabled products.

Deployment configuration contains the product, deployment scope, target installation IDs, status and deployment notes. It does not contain product-specific implementation behavior.

## New Installation Setup Flow

1. Draft an installation record using `/templates/hermes-installation-template.md`.
2. Select a unique kebab-case installation ID and define its purpose and owner.
3. Confirm baseline inheritance or document a human-approved exception.
4. Select enabled products from `/config/product-catalog.md`.
5. Confirm each product's deployment in `/config/product-deployments.yaml`.
6. Document permissions, channels, repositories and open questions.
7. Obtain human approval for installation creation and deployment changes.
8. Add the approved installation to `/config/installations.yaml` and automate provisioning from the declared configuration.

## Human Approval Requirements

Human approval is required for installation creation, baseline exceptions, product catalog changes, deployment changes, sprint commitment, pull request merge and issue closure. Draft configuration is not authorization to deploy or implement a product.

## Agent Responsibilities

Agents must validate product names and installation IDs against their source files, distinguish baseline work from installation and deployment work, use the provided templates, expose unresolved decisions as open questions and wait for human approval at required gates.

## Example Scenarios

- A personal installation inherits the baseline and enables Hermes Core and TaskMe after both configuration files are approved.
- A business installation inherits the baseline and enables Hermes Core while TaskMe remains unavailable there.
- An experimental installation inherits the baseline and permits Hermes Experiments only for that selected installation.
- A proposed baseline exception remains inactive until the human documents explicit approval.

## Open Questions

- Which official installations should replace the `default` placeholder?
- Which permission and runtime fields should become mandatory?
- How should automated provisioning validate configuration changes?
- Where should evidence of human approval be recorded?
