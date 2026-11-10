# enclosure/

The 3D printed case for the Init device (P07-01, decision D-038): **Option A**, a two-part case plus a sensor pod.
Printed on a Bambu Lab A1 in PETG. **Status: DRAFT 2 (2026-11-11), not approved, nothing printed.**

The ROMOSS bank sits inside the base tray; its screen shows through a window in the lid; its four ports are on the open
end. The ESP32 custom PCB goes in a raised electronics bay on the lid (30 mm clearance on all sides, the owner's choice);
the DHT22 sits in a vented pod on 150 mm jumper wires.

Files:
- `MEASUREMENTS.md`: the owner's measurements and the photo notes (what is still missing is listed at the bottom).
- `init_case.scad`: the parametric model (OpenSCAD). `part` = assembly, base, lid, cover or pod. Values marked PLACEHOLDER are not measured.
- `draw-dimensions.mjs`: draws the dimensioned top and side views from the same numbers (`node enclosure/draw-dimensions.mjs`).
- `preview/`: draft images (3D views and `draft2_dimensions.png`).
- `stl/`: draft STL files, for a look in Bambu Studio only. **Do not print draft 2.**

Render by hand: `"C:\Program Files\OpenSCAD (Nightly)\openscad.exe" -D "part=\"base\"" -o stl/base.stl init_case.scad`
(OpenSCAD Nightly 2026.10.31; it is on the owner's user PATH, so `openscad` works in a new terminal.)

Later: `PRINT_GUIDE.md` (each value marked as Bambu profile or estimate).

Draft 2 changes (owner, 2026-11-11): OLED window on the FRONT wall of the bay; a 30 mm port vestibule in front of the bank ports and a roofed
cable channel on the lid (the USB cable from a bank port to the ESP32 is hidden, so there is no external USB-C slot: the cover comes off to reflash);
vents (2 mm slots, high on the back wall, low on the far end wall). Overall 215 x 90.8 x 71.7 mm.
