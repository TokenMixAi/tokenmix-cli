# Security Policy

## Supported versions

TokenMix CLI is distributed via npm, and only the latest published version is supported. Please upgrade before reporting:

```bash
npm install -g tokenmix@latest   # or: npx tokenmix@latest
```

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report it privately through [GitHub Security Advisories](https://github.com/TokenMixAi/tokenmix-cli/security/advisories/new), which lets you disclose the issue confidentially to the maintainers. We aim to acknowledge reports within a few business days and will keep you updated as we work on a fix.

## Scope

This repository is the **CLI client**. It stores your TokenMix API key locally with `0600` permissions and forwards it only to the configured gateway - it never transmits credentials anywhere else. Vulnerabilities in the TokenMix gateway or web service itself should be reported through your account dashboard at <https://tokenmix.ai>.
