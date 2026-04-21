# Tasks: migrate-jest-to-vitest

- [x] 1. Install vitest, @swc/core, unplugin-swc; uninstall jest, ts-jest, @types/jest
- [x] 2. Create vitest.config.ts with SWC plugin and projects (unit + integration)
- [x] 3. Update package.json scripts and remove jest config section
- [x] 4. Migrate unit test files: jest.fn() → vi.fn(), vi.mock() with function constructors
- [x] 5. Update tsconfig.json types: "jest" → "vitest/globals"
- [x] 6. Update .vscode/settings.json for Vitest Explorer, extensions.json recommendation
- [x] 7. Remove test/jest-e2e.json and test/jest-integration.json
- [x] 8. Add .nvmrc (lts/iron) and upgrade to Node 20.20.2 (vitest 4 requires >= 20.19)
- [x] 9. Verify: build compiles, 11/11 unit tests pass
