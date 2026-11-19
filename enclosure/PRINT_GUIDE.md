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

## 11. Draft 8 so far: side rails (D-049)
The owner reported about 10 mm of play in the port block (model: 6.4 mm sideways) and wants the bank to come out easily. The base now has four chamfered side rails (2.5 mm thick, 30 mm long, 20 mm high) with 0.5 mm clearance on each side of the bank, so about 1 mm of play in total. They sit at x 70 to 100 mm and 150 to 180 mm, clear of the button window. `stl/base.stl` is regenerated (147.0 cm3). `lidfit.stl` now also holds a 26 mm high **rail block** (a cut of the base through the first rail pair and the logo): put the real bank between the rails and check (1) it drops in and lifts out without force, (2) how much it moves sideways (should be about 1 mm), (3) the button window is still reachable. If it jams, tell me; the clearance is one number (`rail_clear`) in the .scad. Preview: `preview/draft8_base_rails.png`.
**Fix to `lidfit.stl` (s39, after Studio's "floating cantilever" warning):** the two base corners now stop where the port opening starts (11.2 mm from each side) instead of being 26 mm square. The 26 mm cut had gone through the opening and left the wall above it hanging with a free edge. Re-import `stl/lidfit.stl` (now 37.0 cm3).

## 12. Draft 8 cable route (D-050), supersedes sections 10 and 11 where they mention the channel and the side rails
The lid channel and the back rails are gone. The bank sits against the back wall (button window side, 0.6 mm clearance); the strip on the front side (about 5.4 mm, about 6.4 mm minus the clearance) carries the USB cable, about 30 cm long, from the bank's port, through a 4 x 5 mm tunnel in the front port stop, along the bank, over two low (12 mm) stop blocks, and up through a 10 x 5 mm hole in the lid plate at the start of the bay (x 107 mm). `stl/base.stl` is 144.5 cm3, `stl/lid.stl` 83.6 cm3. Arm, cover and pod lid are byte-identical to the ones printing now.
**New `lidfit.stl` (53.7 cm3, 140 x 126 x 38 mm, same Studio settings as section 8, support off):** A front corner with a full-height post; B the front port stop with its cable tunnel; C a 70 mm slice of the base (button window, logo, floor, walls at 26 mm, the first low stop block); D plain lid corner; E lid piece with the cable hole, a bay wall corner and a cover post. Check: (1) lid corner sits on corner A and an M2.5 x 8 screw goes through the countersink into the post, flush and firm; (2) your 30 cm cable (plug and bulk) goes through the tunnel in B and lies in the strip in C; the plug fits the hole in E; (3) the real bank lies against the back wall of C with about 0.6 mm of play and the button is reachable through the window; (4) the bank cannot slide into the strip (front block, 0.5 mm from it). Preview: `preview/draft8_lidfit_iso.png`, `draft8_base_top.png`, `draft8_lid_top.png`.

## 13. Results of the arm, cover and pod lid print (owner's photos, s40)
Four photos, all with the parts held in the hand (not assembled in the case). **Seen:** (1) the cover plate is flat and clean, with the four screw holes and the two larger BOOT/EN holes open; (2) the pod lid sits on the pod with its four vent slots; the arm is straight; the side vent slots of the pod and the arm foot show support residue and rough, stringy layers (the support was not cleaned off yet, or is fused); (3) the arm foot face has the two screw holes and the wire bore; a white cable passes through the bore, so it is open; the top edge shows layer ripple; (4) the pod without its lid: the DHT22 sits in its pocket, the M3 screw is in, the vent slots open. **Not seen, so not claimed:** the ESP32 under the cover (BOOT/EN hole alignment), the arm against the rear wall in the case, the pod lid pressed in with the sensor under it, the one unsupported overhang, the real inside width of a block (model 86 mm), the 30 cm USB cable.
**Three more photos (s40), the arm screwed to a mounting piece (looks like part of the first test plate; the owner did not say):** the arm is held by its two screws (black screw heads visible) and the wire slot is open; the arm is straight with its two foot gussets. In the pod's side vent slots there are still support columns (coil-like residue), which would partly block the airflow to the DHT22 until removed; one pod wall has a ragged, chipped edge where support was torn off. Photo 3 is blurred, so no fit conclusion was drawn from it. Still open: fit against a real base wall, and everything in the "Not seen" list above.
**Owner's answers (s40):** BOOT and EN can be pressed through the cover holes (PASS); the pod lid presses in firmly (PASS); a 30 cm USB cable is available (plug sizes not given yet); the inside width of the "block" was not measured (the owner asked which block: it is the port block of the first test plate, `testslice`, the pocket the bank sat in).

**Amendment (s40, D-051):** the owner measured the USB-C plug head (11.3 x 6.5 mm) and the cable (3.4 mm). The lid hole in section 12 is therefore **12.5 x 7.5 mm at x 106.2 mm**, not 10 x 5 mm at x 107 mm; `stl/lidfit.stl` and `stl/lid.stl` were re-exported. The 4 x 5 mm tunnel suits the 3.4 mm cable. The 5.4 mm strip is narrower than the plug head, so only the cable lies in it; thread the cable through the lid hole (plug first, lid off the base) before closing. Check (2) now also asks: does the plug head pass through the hole in piece E, with the cable lying in the strip?
**Assembly diagram for these checks:** `preview/lidfit_assembly.png` (`node enclosure/draw-lidfit-assembly.mjs`).

## 14. lidfit results (owner's photos, s41)
**Check 1 Lid corner (A + D): FAIL.** The M2.5 x 8 would not go all the way into the post; the head stayed proud. The printed pilot in the post top was a tiny dimple. The 2.7 mm through hole in D is already wider than the screw (about 2.49 mm, owner's caliper), so it stays. **Fix (D-052):** `pilot_d` 2.1 to 2.3 mm in `init_case.scad`. `stl/lidfit.stl` was re-exported on the desktop (s41, OpenSCAD Nightly 2026.11.17); reprint A and D to verify. The other STLs (base, lid, cover, arm, testslice) still hold the old 2.1 mm pilots until they are re-exported. **Checks 2, 3, 4 (cable, bank in C, stop and lift): PASS** (B, C, E unchanged).
**Port-block pocket (s41):** the owner says the bank fits the first plate port block well, so the 86 mm model width stays and no caliper reading is needed.
**Pilot test plate (s41, D-052):** `stl/pilottest.stl` (`part="pilottest"`, preview `preview/pilottest.png`, about 4 g): a base plate with three 8 mm posts labelled 2.2, 2.3 and 2.4 (pilot diameter in mm) and a separate 2.4 mm cap plate with three countersunk 2.7 mm holes. Print both as loaded. Lay the cap on a post, drive one M2.5 x 8 per post, and tell me which size bites firmly without splitting and seats the head flush. Then I set `pilot_d` to that value and re-export every STL.

**Pilot test result (s42, D-052 settled):** the owner printed the pilot plate; the **2.4 mm** post took the M2.5 x 8 as a perfect fit (head flush). `pilot_d` = 2.4 mm. `base`, `lid`, `testslice` and `lidfit` were re-exported (`arm` and `cover` hold no pilots, so they are byte-identical).
