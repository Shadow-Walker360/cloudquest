# Legacy reference

`cloudready/` is the original vanilla HTML/CSS/JS "CloudReady AZ-900" dashboard that
CloudQuest was started from. It is kept **unchanged and unmaintained** as a reference for the
original look, behaviour and question wording. It is not built, linted, formatted or tested, and
nothing in `src/` imports it.

Known issues in the legacy code (reasons it was not extended in place): hardcoded sample
metrics shown before any activity, an invented "readiness" formula, revision items that are
deleted instead of rescheduled, and no tests or build tooling. Its nine questions were ported
into `src/content/packs/azure-fundamentals-legacy.ts` as **draft, unreviewed** content.

Open `cloudready/index.html` directly in a browser to view it.
