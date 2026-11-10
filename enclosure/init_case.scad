// Init case, DRAFT 4 (D-038, option A). All sizes in mm. X = length (port end at x = 0), Y = width, Z = up.
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
arm_out = 60;                  // how far the pod is held beyond the case end (draft 3: the sensor arm)
arm_z = 18;                    // height of the arm above the floor (low on purpose: heat rises away from the pod)
wire_in = [11, 4.5];           // bore for the jumper plug (width x height); a 4-pin Dupont housing is about 10 x 2.5
arm_wall = 1.6;
foot = [3, 34, 24];            // plate on the outside of the end wall (thickness, width, height)

inner_x = vest + bank[0] + 2*gap + rear_space;
outer = [inner_x + 2*wall, inner_y + 2*wall];
base_h = floor_t + bank[2] + 2*gap;           // top edge of the base walls
bay_x0 = outer[0] - (bay_x + 2*wall);   // draft 3: the bay is flush with the rear end, above the rear space (wires drop through the lid there)
$fn = 40;

module box(x, y, z, p=[0,0,0]) { translate(p) cube([x, y, z]); }

// countersunk screw hole for the owner's DIN965 flat-head screws (M3: head about 6 mm, 1.7 mm deep). t = plate thickness, hole goes up through z = 0..t
csk_head = 6.4; csk_depth = 1.7; thru_d = 3.2;
module csk(t) { translate([0, 0, -1]) cylinder(d=thru_d, h=t + 2); translate([0, 0, t - csk_depth]) cylinder(d1=thru_d, d2=csk_head, h=csk_depth + 0.01); translate([0, 0, t]) cylinder(d=csk_head, h=1); }
// four cover posts inside the bay (insert and screw down from the cover): x offsets from the bay inner start, y offset from the walls
cover_post_x = [18, bay_x - 18];
cover_post_y = [6, inner_y - 6];

module base() {
  difference() {
    box(outer[0], outer[1], base_h);
    // cavity
    translate([wall, wall, floor_t]) cube([inner_x, inner_y, base_h]);
    // opening for the four bank ports (port end), centred on the bank thickness
    translate([-1, outer[1]/2 - port_open[0]/2, floor_t + gap + bank[2]/2 - port_open[1]/2])
      cube([wall + 2, port_open[0], port_open[1]]);
    // wire hole for the sensor arm (rear end wall)
    translate([outer[0] - wall - 1, outer[1]/2 - (wire_in[0] + 1)/2, arm_z - (wire_in[1] + 1)/2]) cube([wall + 2, wire_in[0] + 1, wire_in[1] + 1]);
  }
  // sensor arm: wire hole through the rear end wall, two blind screw bosses on its inner face
  difference() {
    union() for (dy = [-12, 12]) translate([outer[0] - wall - 8, outer[1]/2 + dy, arm_z]) rotate([0, 90, 0]) cylinder(d=7, h=8);
    for (dy = [-12, 12]) translate([outer[0] - wall - 7, outer[1]/2 + dy, arm_z]) rotate([0, 90, 0]) cylinder(d=screw_d, h=8);
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
      // four posts for the cover screws
      for (px = cover_post_x) for (py = cover_post_y)
        translate([bay_x0 + wall + px, wall + py, lid_t]) cylinder(d=7, h=bay_h);
      // electronics bay walls
      translate([bay_x0, 0, lid_t]) difference() {
        cube([bay_x + 2*wall, outer[1], bay_h]);
        translate([wall, wall, -1]) cube([bay_x, inner_y, bay_h + 2]);
      }
    }
    // window over the bank screen
    translate([wall + vest + gap + screen_from_port_end - 0.5, outer[1]/2 - (screen_len_across + 1)/2, -1])
      cube([screen_w_along + 1, screen_len_across + 1, lid_t + 2]);
    // hole for the sensor wires to drop from the bay into the rear space
    translate([wall + vest + bank[0] + 2*gap + 2, outer[1]/2 - 6, -1]) cube([rear_space - 4, 12, lid_t + 2]);
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
      translate([px, py, 0]) csk(lid_t);
    // cover post pilot holes (blind, for the heat-set inserts), from the top of each post
    for (px = cover_post_x) for (py = cover_post_y)
      translate([bay_x0 + wall + px, wall + py, lid_t + bay_h - 8]) cylinder(d=screw_d, h=9);
  }
}

module cover() {
  // roof of the electronics bay: BOOT / EN holes (positions are placeholders)
  difference() {
    box(bay_x + 2*wall, outer[1], lid_t);
    for (dy = [-12, 12]) translate([wall + 12, outer[1]/2 + dy, -1]) cylinder(d=boot_d, h=lid_t + 2);
    for (px = cover_post_x) for (py = cover_post_y) translate([wall + px, wall + py, 0]) csk(lid_t);
  }
}

module arm() {
  // foot plate on the outside of the rear end wall, a square tube out to the pod; the plug and wires pass through the bore
  difference() {
    union() {
      translate([0, -foot[1]/2, -foot[2]/2]) cube(foot);
      translate([0, -(wire_in[0] + 2*arm_wall)/2, -(wire_in[1] + 2*arm_wall)/2]) cube([arm_out, wire_in[0] + 2*arm_wall, wire_in[1] + 2*arm_wall]);
      // pod at the end of the arm (open top for the DHT22, slotted sides)
      translate([arm_out - 1, -pod[1]/2, -pod[2]/2 + 2]) pod_body();
    }
    translate([-1, -wire_in[0]/2, -wire_in[1]/2]) cube([arm_out + 4, wire_in[0], wire_in[1]]);
    for (dy = [-12, 12]) translate([foot[0], dy, 0]) rotate([0, -90, 0]) csk(foot[0]);
  }
}

module pod_body() {
  difference() {
    box(pod[0], pod[1], pod[2]);
    translate([wall, wall, wall]) cube([pod[0] - 2*wall, pod[1] - 2*wall, pod[2]]);
    for (i = [0:4]) translate([6 + i*6, -1, wall + 2]) cube([2, pod[1] + 2, pod[2] - wall - 4]);
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
else if (part == "arm") arm();
else {
  color("#d8d8d8") base();
  color("#f2f2f2") translate([0, 0, base_h]) lid();
  color("#c8e6ff") translate([bay_x0, 0, base_h + lid_t + bay_h]) cover();
  color("#ffd9a0") translate([outer[0], outer[1]/2, arm_z]) arm();
  color("#ffffff", 0.9) translate([wall + vest + gap, wall + (inner_y - bank[1])/2, floor_t + gap]) cube(bank);   // the bank itself
}
