# Decisions

One line of context per decision, with who decided and when. Newest at the bottom.

| ID | Decision | Decided by / date | Why / notes |
|---|---|---|---|
| D-001 | Hardware: ESP32 38-pin, DHT22, 0.96″ SSD1306 OLED, 2 × 18650 in series, 5 V buck converter | Owner, 2026-10-30 | Owner's parts. Rev A schematic in `hardware/schematic.html`. |
| D-002 | Stack Option A: Arduino-framework firmware (PlatformIO), HTTPS to Supabase, free static hosting (Cloudflare Pages or Vercel), PWA front end | Owner, 2026-10-30 | Fastest path, one codebase for desktop and phone, free tiers. |
| D-003 | Scope: one room, public read-only viewing, free hosting, battery only | Owner, 2026-10-30 | Admin edits settings (including Wi-Fi) from the web app. |
| D-004 | Internet: pocket 4G router or phone hotspot; ESP32 is a Wi-Fi client | Owner, 2026-10-30 | Classroom has no Wi-Fi. Cellular module rejected for now. |
| D-005 | Cells: 18650, no markings | Owner, 2026-10-30 | Real capacity unknown; measure before trusting runtime numbers. |
| D-006 | Buck set to 5.20 V, D1 (1N5819) in series to the ESP32 5V/VIN pin; no on-board charger | Agent proposal in schematic Rev A, accepted with the schematic | D1 prevents back-feeding USB. Awaiting owner review (P00-10). |
| D-007 | Brand name: **Init** (Tagalog for "heat"); wordmark `init.`; tagline "Know the heat before it hits the classroom." | Agent, at owner's request, 2026-10-30 | Trademark and domain not checked. Easy to change; owner may veto. |
