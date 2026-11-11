// Init case, DRAFT 7 (D-038 option A, D-042 pod low, D-044 screws from the owner's box only, D-046 bank stops and tougher walls). All sizes in mm.
// X = length (port end at x = 0), Y = width (y = 0 is the FRONT, where the OLED is), Z = up.
// Values marked EST are estimates, not measured. Change a number here and re-render; nothing else needs redrawing.
// part = "assembly" | "base" | "lid" | "cover" | "arm" | "podlid" | "logo"
part = "assembly";

// ---- measured by the owner (2026-11-10 / 11) ------------------------------
bank = [167, 80, 33.3];        // ROMOSS Sense 8P+ (length, width, thickness)
port_panel = [68, 11];         // recessed port panel (width, height)
port_z = 10;                   // bank bottom face up to the CENTRE of the ports (7 + 6/2); owner's "7" may mean the panel bottom: the opening below covers both
port_open = [70, 14];          // opening in the end wall: panel width + 2, tall enough for cable plugs (EST)
screen_side = 6.30;            // bank edge to screen end, both sides
screen_across = bank[1] - 2*screen_side;   // 67.4
screen_along = 22;             // along the bank (EST from the first photo, not re-measured)
screen_from_port_end = 9.9;
btn_from_end = 14; btn_len = 11; btn_w = 5.5;   // bank power button on the long side near the port end; side = BACK wall (y = outer width), moved from the front at the owner's request in s38
esp_pcb = [48.05, 25.30];      // ESP32 PCB only
esp_btn = [7, 5];              // BOOT/EN: 7 from the USB end, 5 from the long edge
esp_clear = 30;                // owner: 30 mm clearance on all sides
oled_board = 24.4;             // square board
oled_lit = [24.0, 14.7];       // lit area as measured 24.50 x 14.15; length capped under the 24.4 board (EST), width +0.5
oled_holes = [15.30, 18.25];   // across, up-down (assumed: the 18.25 runs away from the lit area; to confirm). EST
oled_glass_t = 2.2;
dht = [25, 15, 6.1];           // DHT22 body
dht_hole_d = 3; dht_hole_from_end = 4;   // hole d3 measured; distance from the tab end EST (7.5 is across the width)
wire_plug = [11.8, 2];         // jumper plug width x thickness (measured); plug length 14 EST
wire_len = 220;                // jumper length (owner)

// ---- screws: ONLY what is in the owner's box (D-044): DIN965 flat head, M2.5 x 8 for the case, M3 x 5 for the DHT22, M2.5 x 5 for the OLED
// They bite straight into printed PETG (no inserts). Pilot holes are for self-tapping; the through holes are countersunk.
pilot_d = 2.1;                 // EST for M2.5 into PETG
thru_d = 2.7;
csk_head = 5.2; csk_depth = 1.5;   // M2.5 DIN965 head about 5 mm (EST: owner to measure one)
post_d = 7;
pilot_depth = 6.5;             // M2.5 x 8 through a 2.4 plate leaves 5.6 mm in the post

// ---- logo (D-045): engraved on the FRONT wall of the base, filled with paint afterwards. Drawn from design/brand/init-logo-light.svg (viewBox 330 x 120)
logo_k = 0.2;                  // mm per logo unit => 66 x 24 mm
logo_depth = 0.8;              // engraving depth (EST); the wall keeps 1.6 mm

// ---- design choices -------------------------------------------------------
wall = 3.2; floor_t = 3.2; lid_t = 2.4;   // D-046: walls and floor 3.2 (was 2.4); lid and cover stay 2.4 so the M2.5 x 8 screws keep about 5.6 mm in the posts
r_out = 3;                     // radius of the rounded vertical outside corners
stop_h = 20;                   // height of the bank stops above the floor
gap = 0.6;
rear_space = 12;
vest = 30;
ch_w = 7.5; ch_h = 7.5; ch_wall = 1.6;
bay_h = 30;
bay_x = esp_pcb[0] + 2*esp_clear;
bay_y = esp_pcb[1] + 2*esp_clear;
inner_y = 86;
boot_d = 4;
esp_x0 = (bay_x - esp_pcb[0])/2;       // PCB placed in the middle of the bay, USB end toward the port end
esp_y0 = (inner_y - esp_pcb[1])/2;
oled_stand = oled_glass_t + 0.3;
oled_pilot_depth = 4.2;
pod = [40, 26, 16];            // DHT22 pod outer size
arm_out = 70;                  // tube length beyond the rear end
arm_z = 18;                    // tube axis height above the base bottom: LOW, so the pod stays out of the warm air (D-042)
wire_in = [wire_plug[0] + 1.7, wire_plug[1] + 2.5];   // bore width x height: 13.5 x 4.5
arm_wall = 2.4;                // arm tube wall (was 1.6)
foot = [3, 36, 24];          // plate against the rear end wall (thickness, width, height)
arm_screw_dy = 12;

inner_x = vest + bank[0] + 2*gap + rear_space;
outer = [inner_x + 2*wall, inner_y + 2*wall];
base_h = floor_t + bank[2] + 2*gap;
bay_x0 = outer[0] - (bay_x + 2*wall);
$fn = 40;


// ---- logo helpers: strokes are hulls of two circles (round caps), like the SVG strokes ----
module seg(a, b, w) { hull() { translate(a) circle(d=w, $fn=24); translate(b) circle(d=w, $fn=24); } }
module poly(pts, w) { for (i = [0:len(pts)-2]) seg(pts[i], pts[i+1], w); }
function arc(c, r, a0, a1, n=16) = [for (i = [0:n]) [c[0] + r*cos(a0 + (a1-a0)*i/n), c[1] + r*sin(a0 + (a1-a0)*i/n)]];
// logo in SVG units, y UP (SVG y is flipped by 120 - y). Wordmark "init" and the thermometer icon.
module logo2d() {
  w = 16;                                                     // wordmark stroke
  ox = 122;
  seg([ox+20,120-52],[ox+20,120-100],w);                      // i
  poly(concat(arc([ox+76,120-76],24,180,0), [[ox+100,120-100]]), w);   // n: arch and right leg
  seg([ox+52,120-52],[ox+52,120-100],w);                      // n left leg
  seg([ox+132,120-52],[ox+132,120-100],w);                    // i
  poly(concat([[ox+164,120-30],[ox+164,120-84]], arc([ox+180,120-84],16,180,270,8), [[ox+188,120-100]]), w);   // t
  seg([ox+150,120-52],[ox+188,120-52],w);                     // t crossbar
  for (cx = [ox+20, ox+132]) translate([cx,120-24]) circle(r=10, $fn=32);   // the two heat dots
  // icon: thermometer outline, bulb, mercury and top dot (the rounded square frame is left out)
  translate([4,12]) {
    translate([48,96-20]) circle(r=8, $fn=32);
    difference() { hull() { translate([39+9,96-34-9]) circle(r=9,$fn=32); translate([39+9,96-74+9]) circle(r=9,$fn=32); } offset(delta=-5) hull() { translate([48,96-43]) circle(r=9,$fn=32); translate([48,96-65]) circle(r=9,$fn=32); } }
    translate([48,96-72]) circle(r=12+2.5, $fn=40);
  }
}
module rbox(x, y, z, r=r_out) { hull() for (px = [r, x - r]) for (py = [r, y - r]) translate([px, py, 0]) cylinder(r=r, h=z, $fn=32); }
module box(x, y, z, p=[0,0,0]) { translate(p) cube([x, y, z]); }
// countersunk hole: plate thickness t, hole runs up through z = 0..t, head on the top face
module csk(t) { translate([0,0,-1]) cylinder(d=thru_d, h=t+2); translate([0,0,t-csk_depth]) cylinder(d1=thru_d, d2=csk_head, h=csk_depth+0.01); translate([0,0,t]) cylinder(d=csk_head, h=1); }

cover_post_x = [18, bay_x - 18];
cover_post_y = [6, inner_y - 6];
wire_hole_x = wall + inner_x - 4;     // vertical wire hole in the lid plate, in the rear space

module base() {
  difference() {
    union() {
      rbox(outer[0], outer[1], base_h);
      // pads inside the rear wall for the arm screws (wall 2.4 + pad 4 = 6.4)
      for (dy = [-arm_screw_dy, arm_screw_dy]) translate([outer[0] - wall - 4, outer[1]/2 + dy, arm_z]) rotate([0,90,0]) cylinder(d=post_d + 1, h=4.01);
    }
    translate([wall, wall, floor_t]) cube([inner_x, inner_y, base_h]);
    // port opening in the end wall
    translate([-1, outer[1]/2 - port_open[0]/2, floor_t + gap + port_z - port_open[1]/2]) cube([wall + 2, port_open[0], port_open[1]]);
    // finger window for the bank power button (back wall)
    translate([wall + vest + gap + btn_from_end - 1, outer[1] - wall - 1, floor_t + gap + bank[2]/2 - (btn_w + 2.5)/2]) cube([btn_len + 2, wall + 2, btn_w + 2.5]);
    // engraved logo on the front wall (y = 0), centred on the wall; text reads left to right seen from the front
    translate([outer[0]/2 - 330*logo_k/2, 0, (base_h - 120*logo_k)/2]) rotate([90,0,0]) translate([0,0,-logo_depth]) linear_extrude(logo_depth + 0.1) scale(logo_k) logo2d();
    // wire bore through the rear wall
    translate([outer[0] - wall - 1, outer[1]/2 - wire_in[0]/2, arm_z - wire_in[1]/2]) cube([wall + 2, wire_in[0], wire_in[1]]);
    // arm screw pilots from the outer face
    for (dy = [-arm_screw_dy, arm_screw_dy]) translate([outer[0] - pilot_depth + 0.01, outer[1]/2 + dy, arm_z]) rotate([0,90,0]) cylinder(d=pilot_d, h=pilot_depth + 1);
  }
  // bank stops (D-046): the bank can no longer slide along its length. Blocks sit beside the port panel (the ports stay free) and behind the rear end.
  // 0.3 mm clearance; the bank is lowered in from above with the lid off; a foam or rubber shim can be added for the last bit of play.
  x_b0 = wall + vest + gap; x_b1 = x_b0 + bank[0]; y_b0 = wall + (inner_y - bank[1])/2;
  for (yy = [wall - 0.01, y_b0 + bank[1] - 5]) translate([x_b0 - 8, yy, floor_t - 0.01]) cube([7.7, (yy < 10 ? y_b0 + 5 - wall + 0.01 : wall + inner_y - (y_b0 + bank[1] - 5) + 0.01), stop_h]);
  for (yy = [wall + 11, wall + inner_y - 11 - 14]) translate([x_b1 + 0.3, yy, floor_t - 0.01]) cube([wall + inner_x - x_b1 - 0.3 + 0.01, 14, stop_h]);
  // four lid screw posts
  for (px = [wall + inner_x - 5, wall + 5]) for (py = [wall + 5, wall + inner_y - 5])
    translate([px, py, floor_t]) difference() { cylinder(d=post_d, h=bank[2] + 2*gap); translate([0,0,bank[2] + 2*gap - pilot_depth]) cylinder(d=pilot_d, h=pilot_depth + 1); }
}

module lid() {
  difference() {
    union() {
      rbox(outer[0], outer[1], lid_t);
      translate([wall + 2, outer[1] - ch_w - 2*ch_wall - 2.4, lid_t]) difference() {
        cube([bay_x0 - wall - 2, ch_w + 2*ch_wall, ch_h + ch_wall]);
        translate([0, ch_wall, -1]) cube([bay_x0 - wall - 2 + 1, ch_w, ch_h + 1]);
      }
      // four posts for the cover screws
      for (px = cover_post_x) for (py = cover_post_y) translate([bay_x0 + wall + px, wall + py, lid_t]) cylinder(d=post_d, h=bay_h);
      // electronics bay walls
      translate([bay_x0, 0, lid_t]) difference() {
        rbox(bay_x + 2*wall, outer[1], bay_h);
        translate([wall, wall, -1]) cube([bay_x, inner_y, bay_h + 2]);
      }
      // OLED standoffs on the inside of the front wall of the bay
      for (sx = [-1, 1]) for (sz = [-1, 1])
        translate([bay_x0 + wall + bay_x/2 + sx*oled_holes[0]/2, wall - 0.01, lid_t + bay_h/2 + sz*oled_holes[1]/2]) rotate([-90,0,0]) cylinder(d=5, h=oled_stand + 0.01);
    }
    // window over the bank screen
    translate([wall + vest + gap + screen_from_port_end - 0.5, outer[1]/2 - (screen_across + 1)/2, -1]) cube([screen_along + 1, screen_across + 1, lid_t + 2]);
    // wire hole (vertical) in the rear space: the jumper rises from the arm to the ESP32
    translate([wire_hole_x - (wire_in[1] + 1)/2, outer[1]/2 - (wire_in[0] + 1)/2, -1]) cube([wire_in[1] + 1, wire_in[0] + 1, lid_t + 2]);
    // USB cable up into the channel, and from the channel into the bay
    translate([wall + 6, outer[1] - ch_w - ch_wall - 2.4, -1]) cube([12, ch_w, lid_t + 2]);
    translate([bay_x0 - 1, outer[1] - ch_w - ch_wall - 2.4, lid_t + 0.5]) cube([wall + 2, ch_w, ch_h - 1]);
    // OLED window in the FRONT wall of the bay
    translate([bay_x0 + wall + bay_x/2 - oled_lit[0]/2, -1, lid_t + bay_h/2 - oled_lit[1]/2]) cube([oled_lit[0], wall + 2, oled_lit[1]]);
    // OLED screw pilots (blind), from the standoff tops toward the front wall
    for (sx = [-1, 1]) for (sz = [-1, 1])
      translate([bay_x0 + wall + bay_x/2 + sx*oled_holes[0]/2, wall + oled_stand - oled_pilot_depth, lid_t + bay_h/2 + sz*oled_holes[1]/2]) rotate([-90,0,0]) cylinder(d=pilot_d, h=oled_pilot_depth + 1);
    // vents
    for (i = [0:11]) translate([bay_x0 + wall + 12 + i*7, outer[1] - wall - 1, lid_t + bay_h - 20]) cube([2, wall + 2, 16]);
    for (i = [0:7]) translate([bay_x0 + 2*wall + bay_x - wall - 1, outer[1]/2 - 28 + i*8, lid_t + 4]) cube([wall + 2, 2, 14]);
    // lid-to-base screws (countersunk)
    for (px = [wall + inner_x - 5, wall + 5]) for (py = [wall + 5, wall + inner_y - 5]) translate([px, py, 0]) csk(lid_t);
    // cover post pilots (blind) in the tops of the posts
    for (px = cover_post_x) for (py = cover_post_y) translate([bay_x0 + wall + px, wall + py, lid_t + bay_h - pilot_depth]) cylinder(d=pilot_d, h=pilot_depth + 1);
  }
}

module cover() {
  difference() {
    rbox(bay_x + 2*wall, outer[1], lid_t);
    // BOOT / EN holes over the buttons (PCB centred in the bay, USB end toward the port end)
    for (py = [esp_btn[1], esp_pcb[1] - esp_btn[1]]) translate([wall + esp_x0 + esp_btn[0], wall + esp_y0 + py, -1]) cylinder(d=boot_d, h=lid_t + 2);
    for (px = cover_post_x) for (py = cover_post_y) translate([wall + px, wall + py, 0]) csk(lid_t);
  }
}

module pod_body() {
  difference() {
    union() {
      difference() {
        box(pod[0], pod[1], pod[2]);
        translate([wall, wall, wall]) cube([pod[0] - 2*wall, pod[1] - 2*wall, pod[2]]);
        for (i = [0:4]) translate([6 + i*6, -1, wall + 2]) cube([2, pod[1] + 2, pod[2] - wall - 4]);   // side vent slots
      }
      // post for the DHT22 mounting tab (M3 x 5 into the post)
      translate([pod[0] - wall - 3 - dht_hole_from_end, pod[1]/2, wall - 0.01]) cylinder(d=6, h=4);
    }
    translate([pod[0] - wall - 3 - dht_hole_from_end, pod[1]/2, wall + 4 - 4.5]) cylinder(d=2.5, h=5);
  }
}

module podlid() {
  // press-fit lid: plate with a lip; slots over the DHT22 grille (the sensor lies under the lid, grille up)
  difference() {
    union() {
      box(pod[0], pod[1], lid_t);
      translate([wall + 0.25, wall + 0.25, lid_t]) cube([pod[0] - 2*wall - 0.5, pod[1] - 2*wall - 0.5, 3]);
    }
    for (i = [0:3]) translate([14 + i*5, pod[1]/2 - 6, -1]) cube([2, 12, lid_t + 5]);
  }
}

module arm() {
  // Local origin: rear end outer face (x = 0), tube axis (y = 0, z = 0). The foot plate is screwed to the rear end wall with 2 x M2.5 x 8.
  tw = wire_in[0] + 2*arm_wall; th = wire_in[1] + 2*arm_wall;
  difference() {
    union() {
      translate([0, -foot[1]/2, -foot[2]/2]) cube(foot);
      translate([0, -tw/2, -th/2]) cube([arm_out, tw, th]);
      translate([arm_out - 1, -pod[1]/2, -pod[2]/2 + 2]) pod_body();
      // four gussets between the foot plate and the tube (the arm is the lever that breaks in a fall)
      for (sy = [-1, 1]) for (sz = [-1, 1]) translate([0, sy*(tw/2 - 3) + 1.5, 0]) rotate([90,0,0]) linear_extrude(3) polygon([[0, sz*th/2 - sz*0.01], [0, sz*foot[2]/2], [18, sz*th/2 - sz*0.01]]);
    }
    translate([-1, -wire_in[0]/2, -wire_in[1]/2]) cube([arm_out + 5, wire_in[0], wire_in[1]]);
    for (dy = [-arm_screw_dy, arm_screw_dy]) translate([0, dy, 0]) rotate([0,90,0]) csk(foot[0]);
  }
}

if (part == "base") base();
else if (part == "lid") lid();
else if (part == "cover") cover();
else if (part == "arm") arm();
else if (part == "podlid") podlid();
else if (part == "logo") linear_extrude(1) logo2d();
else {
  color("#d8d8d8") base();
  color("#f2f2f2") translate([0, 0, base_h]) lid();
  color("#c8e6ff") translate([bay_x0, 0, base_h + lid_t + bay_h]) cover();
  color("#ffd9a0") translate([outer[0], outer[1]/2, arm_z]) arm();
  color("#ffffff", 0.9) translate([wall + vest + gap, wall + (inner_y - bank[1])/2, floor_t + gap]) cube(bank);
}
