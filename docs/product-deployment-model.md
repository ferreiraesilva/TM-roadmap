# Product Deployment Model

## Product Catalog and Deployment Matrix

`/config/product-catalog.md` defines official product names. `/config/product-deployments.yaml` independently defines where those products are available. Catalog membership is not deployment approval.

Agents must not assume a product is available in the current Hermes installation only because the product exists in `/config/product-catalog.md`.

## Deployment Scopes

- **Global:** available in every Hermes installation. Use `all` as the installation target.
- **Selected Installations:** available only in explicitly listed installation IDs.
- **Not Deployed:** recognized in the catalog but not active in any installation.
- **Draft:** deployment has not been finalized and must not be treated as active.

## Choosing a Scope

Use Global only for capabilities intended for every installation. Use Selected Installations when purpose, environment, permissions, risk or user context limits availability. Use Not Deployed when the product is recognized but intentionally inactive. Use Draft while scope or approval remains unresolved.

## Agent Availability Check

Before proposing or executing work, an agent must:

1. Confirm the product name in `/config/product-catalog.md`.
2. Identify the current installation in `/config/installations.yaml`.
3. Read the product entry in `/config/product-deployments.yaml`.
4. Confirm that the scope includes the installation and that status is active.
5. Add an open question when the installation or deployment decision is unclear.
6. Wait for human approval before changing deployment configuration.

## From Idea to Deployed Capability

1. Capture and classify the idea.
2. Add or approve the official product name when necessary.
3. Define the installation and deployment scope.
4. Obtain human approval for the deployment decision.
5. Plan and implement product behavior in the appropriate repository.
6. Validate acceptance criteria and deployment readiness.
7. Activate the deployment entry only after human acceptance.

## Examples

- **TaskMe in one installation:** use Selected Installations and list the approved installation ID.
- **Multichannel in all installations:** first add `Multichannel` to the product catalog through human approval, then use Global scope.
- **Hermes Investments in a personal investment installation:** first approve the product and installation records, then use Selected Installations with only that installation ID.

The last two names are illustrative proposals, not current official catalog entries or approved deployments.
