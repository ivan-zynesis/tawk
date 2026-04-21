# Proposal: migrate-jest-to-vitest

## Problem

ts-jest cannot properly handle TypeScript's `nodenext` moduleResolution with `.js` extension imports in Jest's CommonJS environment. The current workarounds (moduleNameMapper, separate tsconfig.spec.json) are fragile band-aids that break IDE test runners and produce cryptic runtime errors like `TypeError: Cannot read properties of undefined`.

## Solution

Replace Jest + ts-jest with Vitest + SWC. Vitest runs natively in ESM, resolving `.js` imports without hacks. SWC (via unplugin-swc) handles NestJS decorator metadata that esbuild cannot.

## Scope

- Remove Jest, ts-jest, and all Jest config files
- Install Vitest, @swc/core, unplugin-swc
- Create vitest.config.ts with SWC plugin and workspace projects (unit + integration)
- Migrate unit test mocks: `jest.fn()` → `vi.fn()`, `jest.mock()` → `vi.mock()`
- Integration tests: minimal changes (no mocks to migrate)
- Update .vscode/settings.json for Vitest Explorer extension
- Update tsconfig types from `jest` to `vitest/globals`

## Non-goals

- No changes to test logic or assertions
- No changes to TestSetup or testcontainers
- No changes to application source code
