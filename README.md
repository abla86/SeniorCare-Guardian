# SeniorCare Guardian

Healthcare technology prototype for senior-care monitoring, safety workflows, simulated health data and privacy/security demonstrations.

## What it demonstrates

- React + TypeScript + Vite
- Component-based frontend architecture
- Interactive workflow views
- Environment-based configuration
- Simulation and demonstration workflows
- Privacy and security boundaries appropriate to a portfolio prototype

## Scope

The repository uses demonstration data. It is not a clinically validated alarm, monitoring or decision-support system and must not be used as a substitute for approved clinical equipment or procedures.

The repository is intended as inspectable engineering portfolio evidence. Claims about clinical effectiveness, regulatory compliance or production deployment are deliberately outside the project scope.

## Local development

Requirements:

- Node.js 20+
- npm

Install dependencies:

```bash
npm install
```

For features requiring an AI API, create a local `.env` file using the variables documented in `.env.example`. Never commit secrets.

Start the application:

```bash
npm run dev
```

## Verification

```bash
npm run lint
npm run build
```

GitHub Actions runs the TypeScript and production-build checks on pushes and pull requests.

## Security UI boundary

The security, consent, audit, hardware, export, and deletion screens are **demonstration-only**. They do not implement or verify LUKS/TPM encryption, Secure Boot, HelseID/VKP/mTLS, real role-based access control, legally valid consent, an immutable audit trail, a complete GDPR access export, or cryptographic erasure. The demo PIN is not authentication. Example people, contact details, measurements, audit entries, retention periods, and legal-basis labels are synthetic placeholders. Do not use this prototype to protect or process real care data.

## Data protection

Use synthetic demonstration data only. Do not place patient names, national identity numbers, addresses, phone numbers, journal content, credentials or other confidential information in the repository or an unapproved deployment.

## License

Apache License 2.0. See [LICENSE](LICENSE).


## Disclaimers and limitations

- **Project status:** Features may be incomplete, experimental, or unverified. Confirm behavior against the current code, tests, and configuration before relying on it.
- **No warranty:** Provided as-is, without guarantees of correctness, availability, security, or production readiness. Review and test changes before production use.
- **Security and data:** Never commit credentials, API keys, personal information, or confidential data. Review permissions, external services, logging, retention, and dependency risks. Automated checks are not a complete security audit.
- **Testing and deployment:** Passing tests or static checks does not prove all behavior is correct or deployment is safe. Verify functionality, access controls, dependencies, backups, monitoring, and operational requirements independently.
- **Domain-specific limitation:** This project is not a certified medical device or substitute for clinical assessment, professional judgment, emergency services or local care procedures. Validate all clinical content, thresholds, alerts, privacy safeguards and workflows with qualified professionals before any real-world use.
