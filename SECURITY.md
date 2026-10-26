# Security Policy

## Scope and intended use

SeniorCare Guardian is a portfolio prototype using simulated care and health data. It is not a certified medical device, a clinically validated monitoring service, or an approved system for real resident or patient information.

## Data and privacy

- Use synthetic demonstration data only.
- Do not submit names, national identity numbers, contact details, care notes, measurements linked to an identifiable person, credentials, or other confidential data.
- AI-enabled features may transmit submitted content to the configured AI provider. Do not submit sensitive material unless the deployment, provider terms, lawful basis, and organisational approval have been reviewed.
- Do not assume that clearing a screen deletes server logs, provider-side data, browser storage, backups, or exported files. Verify each storage path before relying on deletion.

## Security boundaries

Automated linting, builds, and dependency scans do not constitute a full security assessment. Before any non-demo use, review authentication and authorisation, network exposure, secrets, logging, retention/deletion, backups, dependency risk, accessibility, clinical validation, and incident response.

Never commit API keys, tokens, passwords, private keys, certificates, environment files, or production data. Rotate any secret that has been exposed.

## Reporting a vulnerability

Report suspected vulnerabilities privately through GitHub's private vulnerability reporting feature if it is enabled. If unavailable, contact the repository owner privately before public disclosure. Include the affected path, impact, and safe reproduction steps. Do not include real patient data or active secrets.
