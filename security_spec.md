# Security Specification: PartyStack

## Data Invariants
- A session must have at least 1 player (though 2 is required by UI).
- `spiceLevel` must be one of 'family', 'friends', 'savage'.
- `status` must be one of 'setup', 'playing', 'recap'.

## The Dirty Dozen (Potential Attacks)
1. Creating a session with 1000 players (DoS).
2. Updating a session's status to 'finished' without owner permission.
3. Injecting a 1MB string into a player's name.
4. Deleting someone else's active session.
5. Setting self as admin (no admin field exists in blueprint, but check anyway).
6. Rapidly updating a session to exhaust quota.
7. Reading PII (email/phone not stored, but check).
8. Creating a session with negative score.
9. Spoofing timestamps.
10. ID poisoning (very long IDs).
11. Bypassing spice level checks.
12. Relational sync bypass.

## Test Runner (Simplified for rules verification)
See `firestore.rules.test.ts`.
