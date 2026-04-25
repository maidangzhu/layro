# Contributing

## Development Setup

```bash
pnpm install
pnpm test
pnpm build
```

## Principles

- Keep the CLI surface small and stable
- Prefer predictable output over feature breadth
- Design for agent workflows, not only human terminal usage
- Add tests with every behavior change

## Pull Requests

Please include:

- the problem being solved
- the expected CLI behavior
- tests for new behavior or regressions
- README or command-doc updates when user-facing behavior changes

## Before Opening a PR

Run:

```bash
pnpm test
pnpm build
npm pack --dry-run
```
