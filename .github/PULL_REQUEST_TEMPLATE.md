# Pull Request

Thanks for opening a PR. The CI runs lint, typecheck, and unit tests; an e2e smoke (Playwright) runs against a Next dev server. Fill in the checklist below — it is what the reviewer reads first.

## What does this PR change?

<!-- One paragraph. Link the issue it closes. -->

Closes #

## How to test it

<!-- Concrete steps: which page, which button, which prompt. -->

1.
2.
3.

## Checklist

- [ ] `pnpm -r test` passes locally (vitest)
- [ ] `pnpm -r exec tsc --noEmit` reports 0 errors
- [ ] `pnpm --filter @whimsy/web build` succeeds
- [ ] `pnpm-lock.yaml` is unchanged (run `pnpm install --frozen-lockfile` to verify)
- [ ] New code has unit tests where the change is non-trivial
- [ ] I have not touched the spec / plan markdown files in `docs/superpowers/`
- [ ] I have not removed or renamed any of the 15 template IDs (`packages/templates/index.ts`)
- [ ] I have not weakened the sandbox denylist (`packages/sandbox/`)
- [ ] Screenshots attached if the change is visual

## CI status

<!-- After you push, the bot will fill this in from the workflow run. -->

- [ ] ci / Lockfile up-to-date — green
- [ ] ci / Typecheck + tests — green
- [ ] ci / e2e (Playwright) — green

## Risk

<!-- What could break? What did you not test? -->

## Notes for reviewer

<!-- Anything that is not obvious from the diff. -->
