# Security policy

## Supported version

Only the latest `main` branch is maintained. The package is built for portfolio validation and is
not automatically published to a public registry.

## Reporting

Do not open a public issue containing exploit details or credentials. Use GitHub's private security
advisory workflow for the repository owner.

## Security boundaries

- Components render caller-supplied React nodes but do not evaluate HTML strings.
- No component stores credentials, transmits data, or performs authentication.
- GitHub Actions use least privilege and are pinned to immutable commit SHAs.
- Dependency review, production audit, CodeQL, and secret-pattern checks run in CI.
- Consumers remain responsible for content security policy, server sanitization, authorization, and
  dependency patching in their application.
