# ADR 0004: Draft content is previewable but never presented as reviewed

- Status: accepted (2026-10-21)

## Context

The spec says every published scenario must be reviewed and that a track is available only when
reviewed content exists. At the same time, the Scenario Lab cannot be evaluated, demonstrated or
improved without playable content, and nobody has yet reviewed any content.

## Decision

- Content has a status (`draft`, `reviewed`, `archived`). Nothing is reviewed today.
- Draft scenarios are **playable as a preview**, always behind a visible "Draft preview" notice
  and a "Draft · unreviewed" chip. The notice appears on the list and on each scenario.
- A track becomes `available` only when a reviewed pack with content exists
  (`trackAvailability`). Draft content gives `in-development` at most.
- The Scenario Lab nav entry is `in-development`, not `available`.
- Archived packs and scenarios are never listed or playable.
- Marking content `reviewed` is a human act: the validator requires reviewers and a review date,
  and refuses a reviewed pack that contains draft scenarios.

## Consequences

- The product never claims a quality it has not earned, while remaining demonstrable.
- When content is first reviewed, the notices and chips disappear automatically (they are driven by
  `status`), and the Azure track becomes available without UI changes.
- Reviewers must be recorded by hand in the pack file; there is no review tooling yet.
