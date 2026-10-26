# Security Policy

## Scope
SeniorCare Guardian is a healthcare technology prototype using demonstration data. It is not a certified medical device, clinically validated alarm system, emergency-response service or substitute for approved care procedures.

## Data safety
- Use synthetic data only in public demos and tests.
- Never commit patient names, national identity numbers, addresses, medical records, credentials or production configuration.
- Do not enter real health data into an unapproved deployment or AI service.
- Review logs, exports, browser storage, retention and external requests before any real-world use.

## Operational boundary
A passing test or successful build does not prove clinical safety, availability, privacy compliance or production readiness. Do not rely on simulated alarms or monitoring to make care decisions.

## Reporting
Report suspected vulnerabilities privately through GitHub private vulnerability reporting if available. Otherwise contact the maintainer privately. Redact personal data and secrets from all reports.