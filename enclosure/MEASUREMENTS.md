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
