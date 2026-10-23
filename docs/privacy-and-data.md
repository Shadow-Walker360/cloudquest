# Privacy and data

CloudQuest is a client-side prototype. It has **no server, no accounts, and no analytics**. This
page describes exactly what it stores, where, and how a learner can take it or erase it.

## What is stored

Everything lives in one entry in the browser's `localStorage` (key `cloudquest.v1`), on the
learner's own device:

| Data                | Fields                                                                              | Why                                  |
| ------------------- | ----------------------------------------------------------------------------------- | ------------------------------------ |
| Profile (optional)  | display name, what they are studying for, preferred track, weekly goal, short bio   | Personalise the notebook             |
| Attempts            | scenario, option chosen, outcome, hints used, misconception, timestamp              | Progress evidence and analytics      |
| Revision items      | mistakes added from the lab, and sticky-note cards the learner writes, with schedule | Spaced revision                      |

Minimal by design: no email, no password, no age, no location, no device identifiers. The profile
form asks the learner not to enter anything sensitive. Nothing is sent anywhere.

## Limits

At most 1,000 attempts and 200 revision items are kept, so storage cannot grow without bound.
Oldest attempts are dropped first.

## Export and deletion

- **Export:** My notebook → *Download my data* produces a JSON file of the whole store.
- **Delete:** My notebook → *Delete all my data* (with a confirmation step) removes the store and
  any recovery copy from the browser. Clearing the browser's site data has the same effect.

## Failure behaviour

Saved data is validated on every load, because `localStorage` can be edited, truncated or
corrupted. The app never crashes on bad data:

- **Unreadable or wrong-version data:** the app starts empty, tells the learner, and keeps the
  unreadable text under `cloudquest.v1.unreadable-backup` instead of destroying it.
- **Some entries damaged:** only those entries are skipped; the rest are kept, and the learner is told.
- **Storage blocked or full:** the app keeps working in memory and says plainly that progress
  will not be saved.
- **Two tabs open:** a change in one tab is adopted by the other.

## What this is not

`localStorage` is not secure account storage. Anyone with access to the browser profile can read
it, and it is not backed up. It is suitable for a guest learning prototype, not for sensitive
records. Real accounts would need a trusted authentication provider and server-side ownership
checks, which are not configured.
