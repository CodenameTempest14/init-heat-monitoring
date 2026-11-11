# PRINT_GUIDE (draft 6, 2026-11-11). Not final: the owner reviews the draft first.

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
- Walls: the model is built for 3 perimeters (2.4 mm) **[estimate]**. Infill 15 % to 20 % **[estimate]**; the plates and posts are mostly walls anyway.
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
1. **PLA test (about 1 hour):** a slice of the base that holds the port opening and the button window, plus the arm foot. Check: the bank's end fits the opening, a charging plug fits, the power button can be pressed, the screws bite and the countersinks sit flush.
2. **PLA fit pieces:** the pod and podlid with your real DHT22 (leg plug 11.8 x 2 mm, 22 cm jumper); then the cover with the ESP32 board below it (BOOT/EN holes line up?).
3. **Final PETG:** base, lid, cover, arm, podlid.

## 5. Things I guessed that your review must confirm
the OLED hole orientation and the lit-area length; the ESP32 row spacing (not used for the case); the DHT22 hole distance from the tab end and the grille size; the 14 mm plug length; the port height reading (opening 70 x 14 covers both readings of your "7 mm").

## 6. Logo and paint (D-045)
- The logo is **engraved** 0.8 mm [estimate] into the front wall of the base, 66 x 24 mm. Print the base floor down so the front wall stands up: the engraving faces sideways, so test on the PLA slice first (the thin icon outline is only 1 mm wide: if it prints poorly, the icon can be made bolder).
- Paint: water-based **acrylic** paint (a paint pen with a 1 to 2 mm tip fills a 3 mm channel easily). Lightly scuff the engraving with fine sandpaper first (PETG is slippery), paint it, then wipe the excess off the flat wall with a damp cloth or a plastic card before it dries. [estimate; confirm on the test print]
