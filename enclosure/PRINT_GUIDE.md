# PRINT_GUIDE (draft 7, 2026-11-11). Not final: the owner reviews the draft first.

Every value is marked **[Bambu profile]** (take what Bambu Studio sets for the printer and filament you choose; I did not type a number from memory)
or **[estimate]** (my guess from the model; check it on a test print). Printer: Bambu Lab A1 (bed 256 x 256 mm).

## 1. Parts and fit on the bed
| Part (`part=` in init_case.scad) | Size (mm) | Lay it | Supports |
|---|---|---|---|
| base | 215 x 91 x 37 | floor down, as modelled | no, except the small port opening and button window (they are vertical walls: [estimate] none needed) |
| lid | 215 x 91 x about 35 | plate down, bay walls and posts up | [estimate] yes for the cable channel roof and the vent slots only if the slicer asks |
| cover | 113 x 91 x 2.4 | flat | no |
| arm | about 112 x 34 x 20 | on its side, so the foot plate is vertical against the bed edge (try it in Studio) | [estimate] yes, tree supports under the tube and the pod floor |
| podlid | 40 x 26 x 5.4 | plate down | no |
Each fits the 256 mm bed. The base and the lid are the long ones (215): leave room for the skirt.

## 2. Filament and settings
- Final case: **PETG** (not bought yet; the guide will say which one once you have it). Fit tests: PLA (D-040).
- Nozzle 0.4 mm, **[Bambu profile]** for layer height, speeds and temperatures of the chosen filament. Do not change them for the first print.
- Walls: the model walls and floor are 3.2 mm (D-046) = 4 perimeters of a 0.4 mm nozzle **[estimate]**; lid, cover and pod walls are 2.4 mm = 3 perimeters. Infill 15 % to 20 % **[estimate]**; the plates and posts are mostly walls anyway.
- Posts and screw pilots: the 2.1 mm pilot holes are small, so print them with at least 4 perimeters around the post **[estimate]** so the screw does not split it.
- Orientation of the vent slots (2 mm) and the cable channel roof is a bridge: check the preview in Studio.

## 3. Screws (D-044: only what is in your box)
| Where | Screw | Hole in the model | Value status |
|---|---|---|---|
| lid to base (4), cover to bay posts (4), arm foot to rear wall (2) | DIN965 flat head M2.5 x 8 | pilot 2.1 mm, 6.5 deep; through hole 2.7 mm; countersink 5.2 x 1.5 | pilot [estimate]; head size [estimate] (measure one screw head and tell me) |
| OLED to the standoffs (4) | M2.5 x 5 | pilot 2.1 mm, 4.2 deep | [estimate] |
| DHT22 tab to the pod post (1) | M3 x 5 | pilot 2.5 mm, 4.5 deep | [estimate]; the flat head sits on a 3 mm tab hole, tighten gently |
Screw in slowly the first time; the thread cuts its own groove in the plastic. Do not over-tighten PETG.

## 4. Print order (short test first)
1. **Test plate, printed in PETG Basic (D-048; PLA was the first plan) (`part = "testslice"`, `stl/testslice.stl`, 224 x 114 x 38 mm, one plate; see section 8 for the Studio settings):** five cut-outs of the real parts: (a) port-end block of the base (port opening, button window, bank stops; both base blocks are cut at 26 mm high, so the lid-screw posts are not in the test), (b) lid corner (countersinks, screen window, cable channel), (c) rear-end block (arm screw pads, wire bore, rear bank stops), (d) arm foot stub, (e) front-wall strip with the engraved logo. Preview: `preview/draft7_testslice_top.png` and `draft7_testslice_iso.png`. Check: the bank's end fits the opening, a charging plug fits, the power button can be pressed, the screws bite and the countersinks sit flush.
2. **PLA fit pieces:** the pod and podlid with your real DHT22 (leg plug 11.8 x 2 mm, 22 cm jumper); then the cover with the ESP32 board below it (BOOT/EN holes line up?).
3. **Final PETG:** base, lid, cover, arm, podlid.

## 5. Things I guessed that your review must confirm
the OLED hole orientation and the lit-area length; the ESP32 row spacing (not used for the case); the DHT22 hole distance from the tab end and the grille size; the 14 mm plug length; the port height reading (opening 70 x 14 covers both readings of your "7 mm").

## 6. Logo and paint (D-045)
- The logo is **engraved** 0.8 mm [estimate] into the front wall of the base, 66 x 24 mm. Print the base floor down so the front wall stands up: the engraving faces sideways, so test on the PLA slice first (the thin icon outline is only 1 mm wide: if it prints poorly, the icon can be made bolder).
- Paint: water-based **acrylic** paint (a paint pen with a 1 to 2 mm tip fills a 3 mm channel easily). Lightly scuff the engraving with fine sandpaper first (PETG is slippery), paint it, then wipe the excess off the flat wall with a damp cloth or a plastic card before it dries. [estimate; confirm on the test print]

## 7. Drop test (D-046; the bank weighs about 670 g)
After the PLA fit pieces fit: put the real bank in the PLA slice with the stops, then drop it from about 30 cm onto a floor mat or carpet, then 60 cm, checking the end walls, the arm foot and the screw posts after each drop. Stop at the first crack and tell me where: that decides what to thicken next. This is a rough check, not a rated test; it does not prove the final PETG case survives a hard fall onto concrete. The foam shim goes in before the test.

## 8. Bambu Studio settings for the PLA test plate
Open `stl/testslice.stl` (Studio asks "single object or multiple parts": answer **single object**; it is one file with five separate pieces, so it stays one plate). Do not scale it: the file is in millimetres. I could not open Studio here, so menu names may differ a little in your version. Anything marked [Bambu profile] is what the preset sets; I did not type a number from memory.

| Setting | Choose | Status |
|---|---|---|
| Printer | Bambu Lab A1, 0.4 mm nozzle | [Bambu profile] |
| Filament | **Bambu PETG Basic (white)**, the roll for the final case (D-048). Studio sets the PETG temperatures and speeds itself. Check which plate and whether glue stick Studio advises for PETG | [Bambu profile] |
| Plate type | the one that matches the plate on the printer (Studio shows it at the top of the plate view) | [Bambu profile] |
| Process preset | the standard 0.20 mm preset for the A1 ("0.20mm Standard @BBL A1") | [Bambu profile] |
| Wall loops (Strength tab) | **4** | [estimate] (3.2 mm model walls) |
| Sparse infill density | 15 % | [estimate] |
| Support | **Off** at first; then look at the preview (see below) | [estimate] |
| Brim and skirt | leave the preset (seen s39: skirt loops 0, brim type Auto; Studio adds a brim only where it wants one, peel it off after). Print sequence "By layer"; fuzzy skin None; prime tower is on but unused with one filament | [Bambu profile] |
| Temperatures, speeds, fan, flow | leave all as the preset sets them | [Bambu profile] |

**Orientation:** leave every piece as loaded. Studio will lay the plate out as the model has it (floor and plate down). The arm foot stub stands with its foot plate on the bed and the tube pointing up: that is on purpose, so the countersinks face up and the bore needs no support.

**What to look for in the Studio preview before you print (scrub the layer slider):**
1. **Port opening, 70 mm wide in the end wall of the port-end block.** Its top edge is a 70 mm horizontal bridge, which is long. If the preview shows bridging over the opening, expect it to sag: that is the first thing this test answers. If it sags, tell me; the fix is a flat top edge cut as an arch or a support under it in draft 8.
2. **Lid corner channel roof** (7.5 mm bridge) and **button window** (11 mm): short, normally fine.
3. **Logo strip:** the engraving faces the front, standing up. Check the thin icon outline (about 1 mm) is not skipped by the slicer. If Studio's preview shows gaps, the icon needs a bolder outline in draft 8.
4. If the Support option, once switched to Auto, adds supports in the bore of the arm stub or the lid cut-outs, tell me and I will tell you which to keep.

**Time (sliced by the owner in s39, 0.4 mm nozzle, PETG Basic, 0.20mm Standard @BBL A1, 4 wall loops, 15 % infill, no support):** first slice (blocks 37 mm high): total 3 h 20 min, about 107 g. After cutting both base blocks to 26 mm: **total 2 h 58 min (model 2 h 47 min), 89.4 g**. My first guess of 1 to 2 hours was too low.

**Known doubt (not a setting):** the lid screw at the corner next to the cable channel sits under the channel roof (channel interior 7.5 mm tall). The lid-corner piece will show whether a screwdriver reaches it. Try it with the real screw and driver.

## 9. How to test the printed plate (map: `preview/testslice_checks.png`)
Have ready: the real power bank, a charging plug, 2 M2.5 x 8 screws and your screwdriver, a caliper, a phone for photos. For each number say PASS or FAIL and what you saw.
1. **Port opening (left wall of the port block):** is the top edge flat or sagging? Slide the bank's port end against it: does the 68 x 11 mm port panel line up? Push the charging plug in: does it fit? Measure the opening with the caliper (model: 70 x 14 mm).
2. **Button window (back wall of the port block):** hold the bank in the block as in the case; can a fingertip reach and press the power button?
3. **Bank stops (two blocks):** put the bank's end against them: how much is the play along the length and sideways (mm)? The model leaves 0.3 mm. Does the bank go in and come out without force?
4. **Lid corner:** drive one M2.5 x 8 screw through the countersink into a scrap or the rear-block pad: does the head sit flush or sink too deep or stand proud? The big hole is the screen window: put the bank's screen under it and check the alignment. Also check that a screwdriver reaches the screw next to the cable channel (see "Known doubt" in section 8).
5. **Rear block (arm pads on the right wall):** screw an M2.5 x 8 into a pilot: does it bite firmly without splitting the plastic? Do not over-tighten. Is the wire bore through the wall open?
6. **Arm foot stub:** set its foot plate against the rear block's outer face: do the two holes line up with the pilots? Screw it on: does it sit flat and feel solid? Try to bend it by hand.
7. **Logo strip:** look at the front face: is the engraving there, including the thin icon outline (about 1 mm)? Then try the paint: scuff lightly, fill with the acrylic paint pen, wipe the excess off before it dries. How clean is the result?
Also photograph all pieces from above and the front, and write down any warping, stringing, the elephant-foot at the bottom edge, and how hard the brim was to remove.
**Drop test:** the plate cannot do it (the slice holds only one end of the bank). Do the drop test described in section 7 on the full printed base later.

## 10. Results of the first test plate (owner's photos and words, s39) and the lid-screw fit test
**Seen / said:** the 70 mm port-opening bridge came out flat (no sag); the bank's power button shows fully through the back-wall window; the screen shows through the lid-corner window; the logo and its thin thermometer outline print clearly; the arm foot stub is screwed on with two M2.5 x 8 screws and the owner says **"the screws fit perfectly"** (pilot 2.1 mm, arm pads: PASS). Bank measured with a caliper: 33.15 mm thick, 79.38 and 79.79 mm wide (model 33.3 and 80: no change made, the difference is clearance for printing tolerance).
**Not tested, and why:** the lid could not be screwed on. The test blocks were cut at 26 mm, which cut off the lid-screw posts (the full base posts reach 37.7 mm), so there was an 11.7 mm gap between the lid corner and the post tops. That was a mistake in the test plate, not in the case.
**Next test: `part = "lidfit"` (`stl/lidfit.stl`, 64 x 92 x 38 mm, about 20 cm3, same Studio settings as section 8):** two base corners at full height with the real posts, and two lid corners: the plain front corner and the back corner under the cable channel. Check: (1) each lid corner sits flat on its base corner; (2) an M2.5 x 8 screw goes through the countersink into the post, head flush, firm; (3) **at the channel corner, can a screwdriver reach the screw?** If not, draft 8 moves that screw or opens the channel roof. Preview: `preview/draft7_lidfit_iso.png`.
