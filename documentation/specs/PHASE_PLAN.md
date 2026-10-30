# Init: proposed phase plan (PROPOSAL, nothing approved)

Status: **proposed 2026-10-31, waiting for the owner.** Only P00 exists as a checklist today. If you approve this plan, I create one checklist file per phase (`documentation/phases/phase-NN-*.md`) and the Phase Progress table then lists them all. Each phase opens only after the one before it is verified on the real thing.

| Phase | Name | Features (FEATURES.md) | Why in this order | Suggested model |
|---|---|---|---|---|
| P01 | Heat index core and bench bring-up | F-01 and F-02 logic only (the formula and PAGASA bands, test-first), power bank low-load test, breadboard build, sensor and OLED read | Everything depends on a correct heat index and on proving the power bank works | Sonnet 5.5 |
| P02 | Backend and secure upload | F-06, F-07, F-20 (Supabase tables, row-level rules, device key, server-side checks, retention) | The device and the app both need it; security is easiest to get right first | Opus 5.5 |
| P03 | Device firmware | F-08, F-11, D-011 (Wi-Fi, upload, deep sleep, OLED, wake button, offline buffer, setup page) | Needs P01 hardware and P02 endpoint | Sonnet 5.5 (Opus 5.5 for the security parts) |
| P04 | Web app core | F-01 to F-05, F-12 (live cards, categories, online/offline, charts, PWA, daily summary) | Needs real data from P03 | Sonnet 5.5 |
| P05 | Admin, alerts, device health | F-09, F-10, F-17 | Builds on a working app and a working device | Opus 5.5 |
| P06 | Display and sharing extras | F-13, F-14, F-15, F-16, F-18 | Low risk, independent of each other | Sonnet 5.5 |
| P07 | Field trial and hardening | Enclosure, placement away from heat sources, a week in a real room, measured runtime, security review, accessibility check | Real-world checks that no earlier phase can do | Opus 5.5 |
| P08 | Over-the-air updates (optional) | F-19 | Only after P07; a bad update bricks the device | Opus 5.5 |

## Notes
- Each phase ends with a close report and a ticked checklist with evidence. A feature is done only when I've seen it work in the running app or on the device.
- P03 and P04 can overlap once P02 is verified. I'd keep them separate so one unverified change is open at a time.
- Open-source rule (D-010, reading 1): code and libraries must have open licences; hosting may be a free closed service. I'll record each library's licence in the phase that adds it.
- Timing is not estimated: I don't know your weekly time, and the hardware tests depend on parts arriving.
