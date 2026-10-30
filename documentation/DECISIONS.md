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
| D-008 | Power: USB power bank into the ESP32 USB port. **Supersedes** D-001 (cells, buck), D-005 (unmarked 18650s) and D-006 (buck + D1). No BMS, fuse, switch, buck or battery divider. | Owner, 2026-10-30 | More portable, nothing to build on the power side, protection is inside the bank. Risks: the bank may auto-off at low load (test first); no battery-level readout (the app shows "offline" instead). Schematic Rev B. |
| D-009 | ESP32 board: 30-pin DevKit (ESP32-WROOM-32). OLED: 0.96″ SSD1306, 128×64 (listed as "128x63"). BMS: none needed (agent's call, owner delegated) | Owner / agent, 2026-10-30 | All used GPIOs (4, 21, 22, 33) exist on the 30-pin layout. The power bank has its own protection. OLED pin order still to be read off the module. |
| D-010 | Feature list F-01…F-20 approved in full, **conditional on being open source** | Owner, 2026-10-31 | Condition's exact meaning to be confirmed: code and libraries open source (agent's reading), or also the hosting services. |
| D-011 | Wi-Fi setup: device keeps credentials in `secrets.h` and opens its own setup page when it can't connect; the app never stores a Wi-Fi password | Owner, 2026-10-31 | Option 1 in FEATURES.md. Amends D-003's "admin edits Wi-Fi from the web app". |
| D-012 | Confirmed hardware: ESP32 30-pin with Type-C port; OLED pin order GND, VCC, SCK (SCL), SDA; power bank ROMOSS Sense 8P+ 30 000 mAh (5 V 3 A / 9 V 2 A / 12 V 1.5 A out) | Owner, 2026-10-31 | Low-current mode not confirmed for this model. Test before building (bring-up step 1). |
| D-007 | Brand name: **Init** (Tagalog for "heat"); wordmark `init.`; tagline "Know the heat before it hits the classroom." | Agent, at owner's request, 2026-10-30 | Trademark and domain not checked. Easy to change; owner may veto. |
