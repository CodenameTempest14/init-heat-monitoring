// Init case, DRAFT 2 (D-038, option A). All sizes in mm. X = length (port end at x = 0), Y = width, Z = up.
// Values marked PLACEHOLDER are not measured yet. Change a number here and re-render; nothing else needs redrawing.
// part = "assembly" | "base" | "lid" | "cover" | "pod"
part = "assembly";

// ---- measured by the owner -------------------------------------------------
bank = [167, 80, 33.3];        // ROMOSS Sense 8P+ (length, width, thickness)
screen_len_across = 67.2;      // screen runs ACROSS the bank width (assumed from the photo)
screen_w_along = 22;           // and is 22 mm along the bank length
screen_from_port_end = 9.8;    // screen edge to the port end of the bank
esp_pcb = [48.05, 25.30];      // ESP32 PCB only
esp_clear = 30;                // owner: 30 mm clearance on all sides (custom PCB will carry the ESP32)
oled_glass = [24.4, 16.1];     // glass only (lit area still to measure)

// ---- design choices (draft) -----------------------------------------------
wall = 2.4;                    // 3 perimeters of a 0.4 mm nozzle
floor_t = 2.4;
lid_t = 2.4;
gap = 0.6;                     // clearance each side of the bank
rear_space = 12;               // spare room behind the bank for the pod cable and screw posts
vest = 30;                     // port vestibule: room in front of the bank ports for plugs and the hidden USB cable
ch_w = 7.5; ch_h = 7.5; ch_wall = 1.6;   // hidden USB cable channel on the lid (inner width, inner height, wall)
bay_h = 30;                    // inner height of the electronics bay (PLACEHOLDER)
bay_x = esp_pcb[0] + 2*esp_clear;   // 108.05
bay_y = esp_pcb[1] + 2*esp_clear;   // 85.3
inner_y = 86;                  // inner width (>= bay_y, bank has gap + 2.4 each side)
step_gap = 6;                  // bank screen window end to the electronics bay
port_open = [66, 16];          // PLACEHOLDER width x height of the bank port opening
usb_slot = [14, 8];            // (not used in draft 2: the USB-C slot is replaced by the hidden channel)
boot_d = 4;                    // PLACEHOLDER BOOT / EN pin hole
oled_win = [22, 11];           // PLACEHOLDER (lit area not measured)
screw_d = 2.8;                 // M3 insert pilot is set by the insert data sheet (PLACEHOLDER)
pod = [38, 26, 16];            // DHT22 pod outer size (DHT22 body is 25 x 15 x 6.1)

inner_x = vest + bank[0] + 2*gap + rear_space;
outer = [inner_x + 2*wall, inner_y + 2*wall];
base_h = floor_t + bank[2] + 2*gap;           // top edge of the base walls
bay_x0 = wall + vest + gap + screen_from_port_end + screen_w_along + step_gap;   // outer face of bay front wall
$fn = 40;

module box(x, y, z, p=[0,0,0]) { translate(p) cube([x, y, z]); }

module base() {
  difference() {
    box(outer[0], outer[1], base_h);
    // cavity
    translate([wall, wall, floor_t]) cube([inner_x, inner_y, base_h]);
    // opening for the four bank ports (port end), centred on the bank thickness
    translate([-1, outer[1]/2 - port_open[0]/2, floor_t + gap + bank[2]/2 - port_open[1]/2])
      cube([wall + 2, port_open[0], port_open[1]]);
  }
  // four screw posts at the corners of the rear space and the port end
  for (px = [wall + inner_x - 5, wall + 5]) for (py = [wall + 5, wall + inner_y - 5])
    translate([px, py, floor_t]) difference() { cylinder(d=7, h=bank[2] + 2*gap); translate([0,0,3]) cylinder(d=screw_d, h=bank[2] + 2*gap); }
}

module lid() {
  difference() {
    union() {
      box(outer[0], outer[1], lid_t);                                    // plate
      // hidden USB cable channel (roofed) along the back edge, from the vestibule to the bay
      translate([wall + 2, outer[1] - ch_w - 2*ch_wall - 2.4, lid_t]) difference() {
        cube([bay_x0 - wall - 2, ch_w + 2*ch_wall, ch_h + ch_wall]);
        translate([0, ch_wall, -1]) cube([bay_x0 - wall - 2 + 1, ch_w, ch_h + 1]);
      }
      // electronics bay walls
      translate([bay_x0, 0, lid_t]) difference() {
        cube([bay_x + 2*wall, outer[1], bay_h]);
        translate([wall, wall, -1]) cube([bay_x, inner_y, bay_h + 2]);
      }
    }
    // window over the bank screen
    translate([wall + vest + gap + screen_from_port_end - 0.5, outer[1]/2 - (screen_len_across + 1)/2, -1])
      cube([screen_w_along + 1, screen_len_across + 1, lid_t + 2]);
    // hole for the USB cable to rise from the vestibule into the channel
    translate([wall + 6, outer[1] - ch_w - ch_wall - 2.4, -1]) cube([12, ch_w, lid_t + 2]);
    // cable passes from the channel into the bay
    translate([bay_x0 - 1, outer[1] - ch_w - ch_wall - 2.4, lid_t + 0.5]) cube([wall + 2, ch_w, ch_h - 1]);
    // OLED window in the FRONT wall of the bay (front = y = 0)
    translate([bay_x0 + wall + bay_x/2 - oled_win[0]/2, -1, lid_t + bay_h/2 - oled_win[1]/2]) cube([oled_win[0], wall + 2, oled_win[1]]);
    // vents: 2 mm slots, high on the back wall (hot air out), low on the far end wall (air in)
    for (i = [0:11]) translate([bay_x0 + wall + 12 + i*7, outer[1] - wall - 1, lid_t + bay_h - 20]) cube([2, wall + 2, 16]);
    for (i = [0:7]) translate([bay_x0 + 2*wall + bay_x - wall - 1, outer[1]/2 - 28 + i*8, lid_t + 4]) cube([wall + 2, 2, 14]);
    // screw holes matching the base posts
    for (px = [wall + inner_x - 5, wall + 5]) for (py = [wall + 5, wall + inner_y - 5])
      translate([px, py, -1]) cylinder(d=3.2, h=lid_t + 2);
  }
}

module cover() {
  // roof of the electronics bay: BOOT / EN holes (positions are placeholders)
  difference() {
    box(bay_x + 2*wall, outer[1], lid_t);
    for (dy = [-12, 12]) translate([wall + 12, outer[1]/2 + dy, -1]) cylinder(d=boot_d, h=lid_t + 2);
  }
}

module pod() {
  // DHT22 pod: open back for the jumper wires, slotted front and sides for air
  difference() {
    box(pod[0], pod[1], pod[2]);
    translate([wall, wall, wall]) cube([pod[0] - 2*wall, pod[1] - 2*wall, pod[2]]);
    for (i = [0:4]) translate([6 + i*6, -1, wall + 2]) cube([2, pod[1] + 2, pod[2] - wall - 4]);  // 2 mm vent slots
    translate([pod[0] - wall - 1, pod[1]/2 - 5, wall + 1]) cube([wall + 2, 10, 6]);               // wire exit
  }
}

if (part == "base") base();
else if (part == "lid") lid();
else if (part == "cover") cover();
else if (part == "pod") pod();
else {
  color("#d8d8d8") base();
  color("#f2f2f2") translate([0, 0, base_h]) lid();
  color("#c8e6ff") translate([bay_x0, 0, base_h + lid_t + bay_h]) cover();
  color("#ffd9a0") translate([outer[0] + 15, 0, 0]) pod();
  color("#ffffff", 0.9) translate([wall + vest + gap, wall + (inner_y - bank[1])/2, floor_t + gap]) cube(bank);   // the bank itself
}
