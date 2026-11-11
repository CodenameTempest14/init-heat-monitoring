# Measurement sheet (all in mm)

Use calipers if you have them. Measure each number **twice** and write the larger one.
Where a number is hard to read, add a phone photo of the part next to a ruler.
Axes used below: **L** = long side, **W** = short side, **H** = height (thickness).

## 1. ESP32 38-pin dev board (with Type-C port)
| # | What | mm |
|---|---|---|
| 1.1 | Board length (L), PCB only | |
| 1.2 | Board width (W), PCB only | |
| 1.3 | PCB thickness | |
| 1.4 | Total height with pin headers soldered or fitted (underside to highest point) | |
| 1.5 | How far the pins stick out below the PCB | |
| 1.6 | Distance between the two pin rows (hole to hole) | |
| 1.7 | USB-C port: width x height of the opening | |
| 1.8 | USB-C port: how far it sticks out past the PCB edge | |
| 1.9 | USB-C port: height of its centre above the PCB top | |
| 1.10 | BOOT and EN buttons: distance from the USB end and from the side edge (each) | |
| 1.11 | BOOT and EN button height above the PCB | |
| 1.12 | Mounting holes? Yes / No. If yes: diameter and positions | |
| 1.13 | Antenna end: any metal or keep-out area (note which end) | |

## 2. OLED module (SSD1306 128x64, 4-pin: GND, VCC, SCL, SDA)
| # | What | mm |
|---|---|---|
| 2.1 | Board length x width | |
| 2.2 | Board thickness (PCB only) | |
| 2.3 | Total thickness including the glass | |
| 2.4 | Glass area: length x width of the whole glass | |
| 2.5 | **Active display area** (the lit pixels only): length x width | |
| 2.6 | Active area position: distance from the left, right, top and bottom board edges | |
| 2.7 | Mounting holes: diameter, and distance between them (L and W) | |
| 2.8 | Pin header: position from the board edge, height above the board, and the wires' plug size | |

## 3. DHT22 temperature and humidity sensor (4-pin)
| # | What | mm |
|---|---|---|
| 3.1 | Body length x width x thickness | |
| 3.2 | Leg length and the gap between two legs | |
| 3.3 | Is it the bare 4-pin sensor, or on a small board (3-pin module)? | |
| 3.4 | Grille side: which face has the slots (note it) | |
| 3.5 | Mounting hole on the body? Diameter and position | |

## 4. ROMOSS Sense 8P+ power bank (30 000 mAh)
| # | What | mm |
|---|---|---|
| 4.1 | Length x width x thickness (at the thickest point) | |
| 4.2 | Corner radius (roughly) | |
| 4.3 | USB output port used for Init: which edge, distance from the end, port size | |
| 4.4 | Any button, LED or display: position on the face | |
| 4.5 | The bank's own USB-A or USB-C input port: which edge (so the case does not block charging) | |
| 4.6 | Weight (grams), for the mounting | |

## 5. Cables and plugs
| # | What | mm |
|---|---|---|
| 5.1 | USB cable plug to the ESP32 (USB-C): length of the plug body, width, height | |
| 5.2 | Cable diameter right behind the plug | |
| 5.3 | Cable from the bank to the ESP32: length (m) | |
| 5.4 | Sensor cable (DHT22 to ESP32): diameter, and how long you want it (cm) | |

## 6. Extras (only if you add them)
| # | What | mm |
|---|---|---|
| 6.1 | Status LED or switch: body size and panel hole | |
| 6.2 | Screws: M3 length you have, and the brass heat-set insert's brand, length and outer diameter | |
| 6.3 | Where the case will sit: wall or shelf, and the surface it needs to clear | |

## 7. Your answers to the open choices
Power bank inside or outside the case? Mounting (wall screws, tabletop stand, both)? Lid (screwed or snap-fit)?
USB-C slot and BOOT hole (yes / no)? Pod cable length (cm)? Which PETG do you have (brand and type)?

---
## Received from the owner, 2026-11-10 (s37). To be checked, not yet used in a design

ESP32 38-pin: PCB 48.05 x 25.30 mm; total height including the pins 12.45 mm; PCB length with the Type-C port 50 mm
(so the port sticks out about 1.95 mm); Type-C opening 8.30 x 2.45 mm; "edge to edge 9cm" (almost certainly 9 mm: to confirm).
OLED: PCB 24.40 x 24.40 mm; height including the pins 11.00 mm; glass 24.40 x 16.10 x 2.20 mm; screws M2.5 x 6 (four corners).

Still missing: ESP32 PCB thickness, pin length below the PCB, row spacing, port height above the PCB, BOOT/EN button positions;
OLED active (lit) area and its position, hole diameter and spacing, pin header height; all of sections 3 to 7.

### Received 2026-11-10 (second batch)
DHT22: 25 x 15 x 6.10 mm body. ESP32 PCB thickness 1.10 mm. OLED PCB thickness 1 mm.
ROMOSS Sense 8P+: 167 x 80 x 33.30 mm. Jumper wires (male to female): 150 mm.
Owner's wish: the power bank's screen stays visible (battery percentage) and its ports stay open for charging.
=> The bank goes **inside the case** (answers choice 1 in section 7, to confirm); needs windows or cut-outs for its screen and ports.
Still missing: bank screen position and size, bank port positions and corner radius; DHT22 legs and grille side; ESP32 pins below the PCB,
row spacing, port height, button positions; OLED lit area, holes, header height; plug and cable sizes; inserts; the other choices.

### Read from the owner's photos, 2026-11-10 (NOT measured: to confirm)
Screws: box "B-965-02", black zinc-plated carbon steel DIN965 **flat (countersunk) head** machine screws, 50 each of M2x4/5/6/8, M2.5x4/5/6/8, M3x4/5.
ESP32 (38-pin, CP2102, USB-C): antenna module at one end, USB-C at the other; the two buttons (IO0 / EN) sit beside the USB-C port at the USB end; pin headers fitted with the plastic body under the board.
OLED (SSD1306, 4 pins GND VDD SCK SDA along one short edge): four corner holes, glass flex cable folded at the edge opposite the pins.
DHT22: bare 4-pin sensor, 4 straight legs on one short end, grille slots on the big face, one mounting hole in a tab at the other end.
ROMOSS: the black display window is on the TOP face near one short end; all four ports (USB-C with a micro/Lightning-style icon, USB-C "fit+", USB-A "fit+", USB-A fast charge) are on that short end;
a round power button sits on the long side near that end. Port end and display end look like the same end: to confirm.

### Received 2026-11-11 (s38), numbered as in preview/measure_guide.png. Raw values; my reading is in brackets; "?" = to confirm
A1 port end face: panel width 68; panel height 11; bottom face to ports 7 [?: to the port bottom or the panel bottom]; left edge to port 1: 40 [?: port 1 is the left-most in the sketch, 40 looks like a middle port]; opening height 6.
   Missing: positions of the other 3 ports, which port feeds the ESP32 (4), thickness at 3 points (9).
A2 top face: screen 6.30 from each long edge [so about 67.4 wide]; port end to screen 9.90. Missing: flush/raised/recessed (6), corner radius (8).
A2.1 power button, on the long side near the screen end: 13.30 / 13.30 [read as from the top and bottom faces: 13.3 + 5.5 + 13.3 = 32.1, about the 33.3 thickness];
   14 from the end [?]; width 5.5 [across the side]; length 11 [along the bank]. Missing: which long side, how far it sticks out.
B ESP32: row spacing 25 [? the PCB is 25.30 wide, so this is probably the board width, not hole to hole]; BOOT/EN 7 from the USB end, 5 from the long edge; antenna strip ends 7 before the PCB edge.
   Missing: header body and pin length (10), USB shell height (12), button height (13).
C OLED: lit area 24.50 x 14.15 [? 24.50 is longer than the 24.40 board]; top edge to lit 5; hole spacing 15.30 one way and 18.25 the other [? "14" was replaced by 18.25?].
   Missing: lit area left/right/bottom offsets, hole diameter, header height (18), glass + flex thickness (19).
D DHT22: mount hole dia 3, centre 7.5 [from which edge?]; grille 15 x 14 [? body is 25 x 15]; jumper plug width 11.8, thickness 2 [received later in s38; a single-pin housing is usually about 2.5, so it may be a thin 4-pin block: to confirm]. jumper wire length 22 cm (owner, s38; replaces the 150 mm given on 2026-11-10; the 22 cm is the whole wire, not the plug). plug housing length: NOT measured, owner asked me to decide: design value 14 mm (estimate; a standard Dupont female housing is about 14 mm; allow 20 mm clearance behind the legs for the plug and the wire bend). Missing: jumper length to buy (23).
E screws/inserts, F placement and PETG: not yet received (M3 x 5 only, PETG not bought: D-042).

Owner, s38: "just go with the measurements, adjust them based on what you know, I'll review them on the draft" => draft 6 uses them with the guesses marked EST in init_case.scad and listed in PRINT_GUIDE.md section 5. No screws or inserts are to be bought (D-044).

Owner, s38: ROMOSS bank weighs about 670 g (approximate). Used for the drop-strength question: the bank is the heavy part and is NOT yet held in place along its length (30 mm of free travel toward the port end, 12.6 mm toward the rear).
