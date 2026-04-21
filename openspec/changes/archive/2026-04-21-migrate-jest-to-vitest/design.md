# Design: migrate-jest-to-vitest

## Vitest Configuration

Single `vitest.config.ts` at project root replaces all Jest config:

```ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,       // describe/it/expect available without imports
    root: './',
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
```

## Workspace Projects

Vitest workspace file `vitest.workspace.ts` separates unit and integration:

```ts
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'unit',
      root: './',
      include: ['src/**/*.spec.ts'],
    },
  },
  {
    test: {
      name: 'integration',
      root: './',
      include: ['test/integration/**/*.integration.spec.ts'],
      testTimeout: 120000,
      hookTimeout: 120000,
      pool: 'forks',
      poolOptions: { forks: { singleFork: true } },
    },
  },
]);
```

## Why SWC over esbuild

NestJS uses `emitDecoratorMetadata` + `experimentalDecorators`. esbuild (Vitest's default transformer) does not support `emitDecoratorMetadata`. SWC does. The `unplugin-swc` Vite plugin is the NestJS-recommended approach.

## Mock Migration

Unit tests use Jest-specific mock APIs. Vitest provides compatible replacements:

| Jest | Vitest |
|---|---|
| `jest.fn()` | `vi.fn()` |
| `jest.mock('module', factory)` | `vi.mock('module', factory)` |
| `jest.clearAllMocks()` | `vi.clearAllMocks()` |
| `jest.Mock` type | `Mock` from vitest |

With `globals: true`, `vi` is available globally — no imports needed in test files.

## VS Code Integration

Replace Orta Jest config with Vitest Explorer:

```json
{
  "vitest.nodeEnv": {
    "PATH": "/Users/ivanlee/.nvm/versions/node/v20.11.0/bin:${env:PATH}"
  }
}
```

Update `extensions.json` to recommend `vitest.explorer` instead of `orta.vscode-jest`.

## Files Removed

- `test/jest-e2e.json`
- `test/jest-integration.json`
- `jest` section from `package.json`
- `@types/jest`, `ts-jest` from devDependencies
