# enclosure/

The 3D printed case for the Init device (P07-01, decision D-038): **Option A**, a two-part case plus a sensor pod.
Printed on a Bambu Lab A1 in PETG. **Status: DRAFT 6 (2026-11-11); draft 2 approved as the basis (D-040), draft 6 not yet reviewed, nothing printed.**

The ROMOSS bank sits inside the base tray; its screen shows through a window in the lid; its four ports are on the open
end. The ESP32 custom PCB goes in a raised electronics bay on the lid (30 mm clearance on all sides, the owner's choice);
the DHT22 sits in a vented pod on 150 mm jumper wires.

Files:
- `draw-measure-guide.mjs`: draws `preview/measure_guide.png`, a sketch of where to measure each missing number (draft, not to scale).
- `MEASURE_NEXT.md`: the checklist of what is still to measure, with instructions (2026-11-12).
- `MEASUREMENTS.md`: the owner's measurements and the photo notes (what is still missing is listed at the bottom).
- `init_case.scad`: the parametric model (OpenSCAD). `part` = assembly, base, lid, cover, arm or podlid. Values marked PLACEHOLDER are not measured.
- `draw-dimensions.mjs`: draws the dimensioned top and side views from the same numbers (`node enclosure/draw-dimensions.mjs`).
- `preview/`: draft images (3D views and `draft5_dimensions.png`).
- `stl/`: draft STL files, for a look in Bambu Studio only. **Do not print draft 6 before the owner reviews it.**

Render by hand: `"C:\Program Files\OpenSCAD (Nightly)\openscad.exe" -D "part=\"base\"" -o stl/base.stl init_case.scad`
(OpenSCAD Nightly 2026.10.31; it is on the owner's user PATH, so `openscad` works in a new terminal.)

Later: `PRINT_GUIDE.md` (each value marked as Bambu profile or estimate).

Draft 2 changes (owner, 2026-11-11): OLED window on the FRONT wall of the bay; a 30 mm port vestibule in front of the bank ports and a roofed
cable channel on the lid (the USB cable from a bank port to the ESP32 is hidden, so there is no external USB-C slot: the cover comes off to reflash);
vents (2 mm slots, high on the back wall, low on the far end wall). Overall 215 x 90.8 x 71.7 mm.

Draft 3 (owner's request, 2026-11-11): a **sensor arm** (`part = "arm"`): a hollow 60 mm tube that holds the DHT22 pod beyond the rear end, low (18 mm above the floor)
so heat rises away from it. The jumper wires run inside: from the ESP32 bay down through a hole in the lid plate, through the rear space, out through a hole
in the rear end wall and along the tube to the pod. The arm's foot plate screws to two bosses inside the rear end wall. The electronics bay now sits flush
with the rear end (above the rear space). With the arm the device is about 312 mm long. The wires must be longer than 150 mm (about 20 to 30 cm; to confirm).

Draft 4 (owner, 2026-11-11): everything is held by **screws**. Lid to base: four M3 screws (posts in the base). Cover to the electronics bay: four M3 screws into
four 30 mm posts inside the bay (keep the PCB clear of them). Arm to the rear end wall: two M3 screws. All screw holes in the plates are **countersunk** for the
owner's DIN965 flat-head screws (head about 6.4 mm, 1.7 mm deep). The posts are drilled 2.8 mm as a PLACEHOLDER: the real hole depends on the heat-set insert's data sheet.

Draft 5 (owner, 2026-11-11): the sensor arm now sits **on top of the cover** over the ESP32 bay (it was low on the rear end wall in draft 3/4). The wires rise through a hole in the cover, enter the hollow
arm from below and run 70 mm out past the rear end to the pod. The arm's foot plate lies on the cover and is screwed through it into two extra posts under the cover; with these
the screws need to be about M3 x 10 (foot 3 + cover 2.4 + about 4 into the insert). The owner's box has only M3 x 4 and x 5, so longer M3 screws are needed (also M3 x 6 or more for the cover screws).
**Heat warning:** the top of the bay is where warm air collects, so the pod is higher and warmer than in draft 3; the 70 mm reach and the P07-03 calibration offset are the mitigations.
Material: PETG for the final case; PLA only for fit tests (owner asked, 2026-11-11).

Draft 6 (owner, 2026-11-11, D-042 and D-044): built from the owner's measurements (MEASUREMENTS.md, 2026-11-11 batch). Changes:
- The sensor arm is **low again** (axis 18 mm above the base bottom), a separate part screwed to the rear end wall; the wires drop through a hole in the lid plate in the rear space and leave through the rear wall (jumper 220 mm).
- **No inserts, no purchases:** all screws come from the owner's box. Case screws are M2.5 x 8 flat head into 2.1 mm pilot holes (D-044); OLED M2.5 x 5; DHT22 M3 x 5.
- Port opening 70 x 14 in the end wall (bank panel 68 x 11, ports 6 high); finger window for the bank power button on the BACK wall (y = width; moved from the front, owner s38); screen window from the new numbers (67.4 across, 9.9 from the port end).
- BOOT/EN holes over the ESP32 buttons (7 from the USB end, 5 from the long edge, board centred in the bay). OLED standoffs behind a 24 x 14.7 window (hole spacing 15.3 x 18.25, orientation assumed).
- Pod 40 x 26 x 16 with a post for the DHT22 tab and a press-fit lid (`podlid`).
Conflicts in the measurements are listed in MEASUREMENTS.md; each guess is marked EST in the .scad. Print order and settings: `PRINT_GUIDE.md`.
- **Logo (D-045):** the Init logo is engraved 0.8 mm deep on the front wall of the base (66 x 24 mm, drawn in OpenSCAD from `design/brand`) to be filled with paint; `part="logo"` shows it alone (`preview/draft6_logo.png`).
