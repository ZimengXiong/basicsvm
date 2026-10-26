const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

function runBoardInWorker(source,inputs,progress){
  return new Promise((resolve,reject)=>{const worker=new Worker('/fpga-simulator/verilog-worker.js',{type:'module'});worker.onmessage=event=>{const data=event.data;if(data.type==='progress')progress(data.message);else if(data.type==='result'){worker.terminate();resolve(data.result)}else if(data.type==='error'){worker.terminate();reject(new Error(data.message))}};worker.onerror=event=>{worker.terminate();reject(new Error(event.message||'Verilog worker failed'))};worker.postMessage({source,inputs})});
}
let nativeWorker=null,nativeInputPorts=[],nativeFrameCanvas=null;
function runNativeInWorker(source,progress){
  nativeWorker||=new Worker('/fpga-simulator/native-compile-worker.js',{type:'module'});const worker=nativeWorker;worker.postMessage({type:'stop'});
  return new Promise((resolve,reject)=>{let compiled=false;worker.onmessage=event=>{const data=event.data;if(data.type==='progress')progress(data.message);else if(data.type==='compiled'){compiled=true;resolve(data)}else if(data.type==='frame'||data.type==='sample'){if(compiled)handleNativeRuntime(data)}else if(data.type==='error'){if(!compiled)reject(new Error(data.message));else{setStatus('Error');setLog(`${$('#log').textContent}\n${data.message}`.trim())}}};worker.onerror=event=>{if(!compiled)reject(new Error(event.message||'Native compilation worker failed'))};worker.postMessage({type:'compile',source,clockHz:board?board.clockHz:25e6})});
}


// Boards. Overlay geometry is in PCB millimetres; viewBox maps the render's framing onto those units.
const BOARDS={
  goboard:{name:'Go Board',render:'/fpga-simulator/assets/goboard-v1.webp',alt:'Nandland Go Board',viewBox:'-14.975 -3.863 100 59.882',aspect:'2048 / 1229',clockHz:25e6,
    leds:[[40.6,28.3],[47.7,28.3],[54.8,28.3],[61.9,28.3]],ledR:.85,switches:[[45.4,38.2],[45.4,48],[60.2,38.2],[60.2,48]],switchR:2.7,
    digits:[{"a": "53.71,7.3 58.91,7.3 59.27,7.75 58.66,8.25 53.61,8.25 53.31,7.8", "g": "52.9,13.42 58.2,13.42 58.7,13.9 58.05,14.38 52.85,14.38 52.35,13.9", "d": "51.69,19.55 56.89,19.55 57.24,20 56.69,20.5 51.59,20.5 51.24,20", "f": "52.62,8.2 53.5,7.9 53.03,13.15 52.43,13.6 52.02,13.25", "b": "58.87,8.2 59.75,7.9 59.28,13.15 58.68,13.6 58.27,13.25", "e": "51.54,14.5 52.42,14.2 51.95,19.45 51.35,19.9 50.94,19.55", "c": "57.79,14.5 58.67,14.2 58.2,19.45 57.6,19.9 57.19,19.55"},{"a": "66.21,7.3 71.41,7.3 71.77,7.75 71.16,8.25 66.11,8.25 65.81,7.8", "g": "65.4,13.42 70.7,13.42 71.2,13.9 70.55,14.38 65.35,14.38 64.85,13.9", "d": "64.19,19.55 69.39,19.55 69.74,20 69.19,20.5 64.09,20.5 63.74,20", "f": "65.12,8.2 66,7.9 65.53,13.15 64.93,13.6 64.52,13.25", "b": "71.37,8.2 72.25,7.9 71.78,13.15 71.18,13.6 70.77,13.25", "e": "64.04,14.5 64.92,14.2 64.44,19.45 63.85,19.9 63.44,19.55", "c": "70.29,14.5 71.17,14.2 70.69,19.45 70.1,19.9 69.69,19.55"}]},
  tang9k:{name:'Tang Nano 9K',render:'/fpga-simulator/assets/tang-nano-9k.webp',alt:'Sipeed Tang Nano 9K',viewBox:'-5 -3 80 32',aspect:'2048 / 819',clockHz:27e6,examples:'tang',
    ledActiveLow:true,switchActiveLow:true,ledBase:1,switchBase:1,ledShape:[1.7,.95],switchEllipse:[1.35,1.0],
    leds:[[18.82,9.62],[18.82,11.15],[18.82,12.67],[18.82,14.22],[18.81,15.76],[18.81,17.24]],switches:[[3.56,4.87],[3.56,21.07]],digits:[]},
  tang20k:{name:'Tang Nano 20K',render:'/fpga-simulator/assets/tang-nano-20k.webp',alt:'Sipeed Tang Nano 20K',viewBox:'-5 -2.731 64 28',aspect:'2048 / 896',clockHz:27e6,examples:'tang20k',rgb:[[38.36,6.29]],rgbShape:[2.0,2.0],
    ledActiveLow:true,switchActiveLow:true,ledBase:0,switchBase:1,ledShape:[.95,1.7],switchEllipse:[1.35,1.0],
    leds:[[9.65,18.91],[11.11,18.91],[12.58,18.93],[14.06,18.92],[15.52,18.93],[16.98,18.92]],switches:[[3.17,18.48],[3.17,4.1]],digits:[]}
};
let CYCLES_PER_SEC=25e6;
let board=null,ledEls=[],segEls={1:[],2:[]},switches=[];
function buildBoard(id){const def=BOARDS[id]&&BOARDS[id].available!==false?BOARDS[id]:BOARDS.goboard;board=def;
  const img=$('.pcb-render');img.src=def.render;img.alt=def.alt;document.documentElement.style.setProperty('--board-aspect',def.aspect);
  const svg=$('#goBoard');svg.setAttribute('viewBox',def.viewBox);svg.setAttribute('aria-label',def.alt);
  svg.innerHTML=`<defs><filter id="ledGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation=".8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="segGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation=".22" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`
    +`<g class="led-row">${def.leds.map((p,i)=>def.ledShape?`<rect id="led${i+1}" class="led" x="${p[0]-def.ledShape[0]/2}" y="${p[1]-def.ledShape[1]/2}" width="${def.ledShape[0]}" height="${def.ledShape[1]}" rx=".15"/>`:`<circle id="led${i+1}" class="led" cx="${p[0]}" cy="${p[1]}" r="${def.ledR}"/>`).join('')}</g>`
    +(def.rgb||[]).map((p,i)=>`<rect id="rgb${i+1}" class="rgb" x="${p[0]-def.rgbShape[0]/2}" y="${p[1]-def.rgbShape[1]/2}" width="${def.rgbShape[0]}" height="${def.rgbShape[1]}" rx=".2"/>`).join('')
    +def.digits.map((d,i)=>`<g class="digit" data-digit="${i+1}">${Object.entries(d).map(([k,pts])=>`<polygon class="seg ${k}" points="${pts}"/>`).join('')}</g>`).join('')
    +def.switches.map((p,i)=>`<g id="sw${i+1}" class="switch" role="button" tabindex="0" aria-label="Switch ${i+1}" transform="translate(${p[0]} ${p[1]})">${def.switchEllipse?`<ellipse class="cap" cx="0" cy="0" rx="${def.switchEllipse[0]}" ry="${def.switchEllipse[1]}"/>`:`<circle class="cap" cx="0" cy="0" r="${def.switchR}"/>`}</g>`).join('');
  CYCLES_PER_SEC=def.clockHz;renderPins(Object.keys(BOARDS).find(k=>BOARDS[k]===def));examples=EXAMPLES[def.examples||'goboard'];const ex=$('#examples');ex.innerHTML=`<option value="" disabled selected>Examples</option>`+Object.keys(examples).map(k=>`<option value="${k}">${EXAMPLE_LABELS[k]||k}</option>`).join('');
  bindBoard();$('#board').value=Object.keys(BOARDS).find(k=>BOARDS[k]===def);try{localStorage.setItem('fpga-board',$('#board').value)}catch{}}

const EXAMPLE_LABELS={none:'Empty',blink:'Blink',counter:'Counter',switches:'Switches',buttons:'Buttons',seven:'7-segment',vga:'VGA',hdmi:'HDMI',rgb:'RGB LED'};
const EXAMPLES={
goboard:{
none:`module go_board (input CLK);
  // Blank design. Add inputs, outputs, and logic here.
endmodule`,
blink:`module go_board (input CLK, output reg LED1);\n  // 25 MHz clock — bit 22 changes about 6 times/sec\n  reg [24:0] r_Counter = 0;\n  always @(posedge CLK) begin\n    r_Counter <= r_Counter + 1'b1;\n    LED1 <= r_Counter[22];\n  end\nendmodule`,
counter:`module go_board (input CLK,\n  output LED1, LED2, LED3, LED4);\n  reg [25:0] r_Count = 0;\n  always @(posedge CLK)\n    r_Count <= r_Count + 1'b1;\n  assign LED1 = r_Count[22];\n  assign LED2 = r_Count[23];\n  assign LED3 = r_Count[24];\n  assign LED4 = r_Count[25];\nendmodule`,
switches:`module go_board (\n  input SW1, SW2, SW3, SW4,\n  output LED1, LED2, LED3, LED4);\n  assign LED1 = SW1;\n  assign LED2 = SW2;\n  assign LED3 = SW3;\n  assign LED4 = SW4;\nendmodule`,
seven:`module go_board (input CLK,\n  output S1_A, S1_B, S1_C, S1_D, S1_E, S1_F, S1_G,\n  output S2_A, S2_B, S2_C, S2_D, S2_E, S2_F, S2_G);\n  reg [27:0] r_Count = 0;\n  reg [6:0] s1, s2;\n  always @(posedge CLK) r_Count <= r_Count + 1'b1;\n  always @(*) begin\n    case (r_Count[27:24] % 10)\n      0:s1=7'b1111110; 1:s1=7'b0110000; 2:s1=7'b1101101; 3:s1=7'b1111001; 4:s1=7'b0110011;\n      5:s1=7'b1011011; 6:s1=7'b1011111; 7:s1=7'b1110000; 8:s1=7'b1111111; default:s1=7'b1111011;\n    endcase\n    case (r_Count[23:20] % 10)\n      0:s2=7'b1111110; 1:s2=7'b0110000; 2:s2=7'b1101101; 3:s2=7'b1111001; 4:s2=7'b0110011;\n      5:s2=7'b1011011; 6:s2=7'b1011111; 7:s2=7'b1110000; 8:s2=7'b1111111; default:s2=7'b1111011;\n    endcase\n  end\n  assign {S1_A,S1_B,S1_C,S1_D,S1_E,S1_F,S1_G}=~s1;\n  assign {S2_A,S2_B,S2_C,S2_D,S2_E,S2_F,S2_G}=~s2;\nendmodule`,
vga:`module vga_fun (\n  input wire CLK,\n  output wire VGA_HS,\n  output wire VGA_VS,\n  output wire VGA_R0, VGA_R1, VGA_R2,\n  output wire VGA_G0, VGA_G1, VGA_G2,\n  output wire VGA_B0, VGA_B1, VGA_B2\n);\n  reg [2:0] vga_r, vga_g, vga_b;\n  assign {VGA_R2,VGA_R1,VGA_R0}=vga_r;\n  assign {VGA_G2,VGA_G1,VGA_G0}=vga_g;\n  assign {VGA_B2,VGA_B1,VGA_B0}=vga_b;\n  localparam H_VISIBLE = 640;\n  localparam H_FRONT = 18;\n  localparam H_SYNC = 92;\n  localparam H_TOTAL = 800;\n  localparam V_VISIBLE = 480;\n  localparam V_FRONT = 10;\n  localparam V_SYNC = 2;\n  localparam V_TOTAL = 525;\n  localparam SMILE_SIZE = 72;\n  localparam MAX_SMILE_X = H_VISIBLE - SMILE_SIZE;\n  localparam MAX_SMILE_Y = V_VISIBLE - SMILE_SIZE;\n  reg [9:0] h_count;\n  reg [9:0] v_count;\n  reg [23:0] frame_count;\n  reg [9:0] smile_x;\n  reg [9:0] smile_y;\n  reg smile_right;\n  reg smile_down;\n  wire frame_end = (h_count == H_TOTAL - 1) && (v_count == V_TOTAL - 1);\n  wire active_video = (h_count < H_VISIBLE) && (v_count < V_VISIBLE);\n  assign VGA_HS = ~((h_count >= H_VISIBLE + H_FRONT) && (h_count < H_VISIBLE + H_FRONT + H_SYNC));\n  assign VGA_VS = ~((v_count >= V_VISIBLE + V_FRONT) && (v_count < V_VISIBLE + V_FRONT + V_SYNC));\n  always @(posedge CLK) begin\n    if (h_count == H_TOTAL - 1) begin\n      h_count <= 0;\n      if (v_count == V_TOTAL - 1) v_count <= 0;\n      else v_count <= v_count + 1'b1;\n    end else h_count <= h_count + 1'b1;\n  end\n  always @(posedge CLK) begin\n    if (frame_end) begin\n      frame_count <= frame_count + 1'b1;\n      if (smile_right) begin\n        if (smile_x >= MAX_SMILE_X - 2) begin smile_x <= MAX_SMILE_X; smile_right <= 1'b0; end\n        else smile_x <= smile_x + 2;\n      end else begin\n        if (smile_x <= 2) begin smile_x <= 0; smile_right <= 1'b1; end\n        else smile_x <= smile_x - 2;\n      end\n      if (smile_down) begin\n        if (smile_y >= MAX_SMILE_Y - 1) begin smile_y <= MAX_SMILE_Y; smile_down <= 1'b0; end\n        else smile_y <= smile_y + 1;\n      end else begin\n        if (smile_y <= 1) begin smile_y <= 0; smile_down <= 1'b1; end\n        else smile_y <= smile_y - 1;\n      end\n    end\n  end\n  initial begin\n    h_count = 0;\n    v_count = 0;\n    frame_count = 0;\n    smile_x = 40;\n    smile_y = 70;\n    smile_right = 1'b1;\n    smile_down = 1'b1;\n  end\n  wire [7:0] background_phase = {2'b00, h_count[7:2]} + {2'b00, v_count[7:2]} + frame_count[7:0];\n  wire sparkle = (&(h_count[4:0] ^ v_count[4:0])) && (h_count[8:6] == (v_count[8:6] ^ frame_count[8:6]));\n  wire inside_smiley = (h_count >= smile_x) && (h_count < smile_x + SMILE_SIZE) && (v_count >= smile_y) && (v_count < smile_y + SMILE_SIZE);\n  wire [9:0] local_x = h_count - smile_x;\n  wire [9:0] local_y = v_count - smile_y;\n  wire smile_border = inside_smiley && ((local_x < 4) || (local_x >= 68) || (local_y < 4) || (local_y >= 68));\n  wire blinking = &frame_count[6:4];\n  wire left_eye_open = (local_x >= 16) && (local_x < 28) && (local_y >= 17) && (local_y < 33);\n  wire right_eye_open = (local_x >= 44) && (local_x < 56) && (local_y >= 17) && (local_y < 33);\n  wire left_eye_closed = (local_x >= 16) && (local_x < 28) && (local_y >= 25) && (local_y < 28);\n  wire right_eye_closed = (local_x >= 44) && (local_x < 56) && (local_y >= 25) && (local_y < 28);\n  wire eye_pixel = blinking ? (left_eye_closed || right_eye_closed) : (left_eye_open || right_eye_open);\n  wire mouth_pixel = ((local_x >= 17) && (local_x < 22) && (local_y >= 45) && (local_y < 53)) || ((local_x >= 50) && (local_x < 55) && (local_y >= 45) && (local_y < 53)) || ((local_x >= 22) && (local_x < 50) && (local_y >= 51) && (local_y < 57));\n  wire face_highlight = (local_x >= 8) && (local_x < 15) && (local_y >= 8) && (local_y < 15);\n  always @(*) begin\n    vga_r = 3'b000;\n    vga_g = 3'b000;\n    vga_b = 3'b000;\n    if (active_video) begin\n      vga_r = background_phase[7:5];\n      vga_g = {background_phase[4:3], background_phase[7]};\n      vga_b = {background_phase[2:1], background_phase[5]};\n      if (sparkle) begin vga_r = 3'b111; vga_g = 3'b111; vga_b = 3'b111; end\n      if (inside_smiley) begin\n        vga_r = 3'b111; vga_g = 3'b110; vga_b = 3'b000;\n        if (smile_border) begin vga_r = 3'b101; vga_g = 3'b010; vga_b = 3'b000; end\n        if (eye_pixel || mouth_pixel) begin vga_r = 3'b000; vga_g = 3'b000; vga_b = 3'b000; end\n        if (face_highlight) begin vga_r = 3'b111; vga_g = 3'b111; vga_b = 3'b111; end\n      end\n    end\n  end\nendmodule`},
tang:{
none:`module top (input clk);
endmodule`,
blink:`module top (input clk, output [5:0] led);
  // 27 MHz clock. LEDs light when driven low.
  reg [24:0] c = 0;
  always @(posedge clk) c <= c + 1'b1;
  assign led = ~{5'b0, c[23]};
endmodule`,
counter:`module top (input clk, output [5:0] led);
  reg [27:0] c = 0;
  always @(posedge clk) c <= c + 1'b1;
  assign led = ~c[27:22];
endmodule`,
buttons:`module top (input btn1, btn2, output [5:0] led);
  // Buttons read 0 while pressed.
  assign led = {4'b1111, btn2, btn1};
endmodule`,
hdmi:`// 640x480 video timing. On hardware, feed these to the TMDS encoder (DVI_TX_Top).
module top (
  input clk,
  output hdmi_hs, hdmi_vs, hdmi_de,
  output reg [7:0] hdmi_r, hdmi_g, hdmi_b
);
  localparam H_VIS = 640, H_FP = 16, H_SYNC = 96, H_TOTAL = 800;
  localparam V_VIS = 480, V_FP = 10, V_SYNC = 2,  V_TOTAL = 525;
  reg [9:0] h = 0, v = 0;
  reg [7:0] frame = 0;
  reg [9:0] box_x = 100, box_y = 80;
  reg dx = 1, dy = 1;
  always @(posedge clk) begin
    if (h == H_TOTAL - 1) begin
      h <= 0;
      if (v == V_TOTAL - 1) begin
        v <= 0;
        frame <= frame + 1'b1;
        box_x <= dx ? box_x + 2 : box_x - 2;
        box_y <= dy ? box_y + 1 : box_y - 1;
        if (box_x >= H_VIS - 82) dx <= 0; else if (box_x <= 2) dx <= 1;
        if (box_y >= V_VIS - 81) dy <= 0; else if (box_y <= 1) dy <= 1;
      end else v <= v + 1'b1;
    end else h <= h + 1'b1;
  end
  assign hdmi_hs = ~(h >= H_VIS + H_FP && h < H_VIS + H_FP + H_SYNC);
  assign hdmi_vs = ~(v >= V_VIS + V_FP && v < V_VIS + V_FP + V_SYNC);
  assign hdmi_de = h < H_VIS && v < V_VIS;
  wire in_box = h >= box_x && h < box_x + 80 && v >= box_y && v < box_y + 80;
  always @(*) begin
    if (!hdmi_de) begin hdmi_r = 0; hdmi_g = 0; hdmi_b = 0; end
    else if (in_box) begin hdmi_r = 8'hff; hdmi_g = 8'hd0; hdmi_b = 8'h20; end
    else begin hdmi_r = h[9:2] + frame; hdmi_g = v[8:1]; hdmi_b = 8'h60 ^ frame; end
  end
endmodule`
}
};
EXAMPLES.tang20k={...EXAMPLES.tang,rgb:`module top (input clk, output reg ws2812);
  // WS2812: 24 bits, G then R then B, about 1.25 us per bit, >50 us low to latch.
  reg [23:0] color = 24'h00_40_00;
  reg [25:0] t = 0;
  reg [5:0] cyc = 0;
  reg [4:0] idx = 0;
  reg [11:0] gap = 0;
  reg sending = 1;
  always @(posedge clk) begin
    t <= t + 1'b1;
    if (t == 0) color <= {color[15:0], color[23:16]};
    if (sending) begin
      cyc <= (cyc == 33) ? 6'd0 : cyc + 1'b1;
      ws2812 <= color[23 - idx] ? (cyc < 22) : (cyc < 11);
      if (cyc == 33) begin
        if (idx == 23) begin idx <= 0; sending <= 0; gap <= 0; end
        else idx <= idx + 1'b1;
      end
    end else begin
      ws2812 <= 0;
      gap <= gap + 1'b1;
      if (gap == 12'd2000) sending <= 1;
    end
  end
endmodule`};
let examples=EXAMPLES.goboard;
const PINS={
  goboard:{file:'go-board.pcf',format:'pcf',groups:{Clock:[['CLK',15]],LEDs:[['LED1',56],['LED2',57],['LED3',59],['LED4',60]],Buttons:[['SW1',53],['SW2',51],['SW3',54],['SW4',52]],
    '7-segment 1':[['S1_A',3],['S1_B',4],['S1_C',93],['S1_D',91],['S1_E',90],['S1_F',1],['S1_G',2]],'7-segment 2':[['S2_A',100],['S2_B',99],['S2_C',97],['S2_D',95],['S2_E',94],['S2_F',8],['S2_G',96]],
    VGA:[['VGA_HS',26],['VGA_VS',27],['VGA_R0',36],['VGA_R1',37],['VGA_R2',40],['VGA_G0',29],['VGA_G1',30],['VGA_G2',33],['VGA_B0',28],['VGA_B1',41],['VGA_B2',42]],
    UART:[['UART_RX',73],['UART_TX',74]],PMOD:[['PMOD1',65],['PMOD2',64],['PMOD3',63],['PMOD4',62],['PMOD7',78],['PMOD8',79],['PMOD9',80],['PMOD10',81]]}},
  tang9k:{file:'tang-nano-9k.cst',format:'cst',groups:{Clock:[['clk',52,'PULL_MODE=UP']],LEDs:[['led[0]',10],['led[1]',11],['led[2]',13],['led[3]',14],['led[4]',15],['led[5]',16]],Buttons:[['btn1',3,'PULL_MODE=UP'],['btn2',4,'PULL_MODE=UP']],
    UART:[['uart_rx',18,'PULL_MODE=UP'],['uart_tx',17]],HDMI:[['tmds_clk_p',69],['tmds_clk_n',68],['tmds_d_p[0]',71],['tmds_d_n[0]',70],['tmds_d_p[1]',73],['tmds_d_n[1]',72],['tmds_d_p[2]',75],['tmds_d_n[2]',74]]}},
  tang20k:{file:'tang-nano-20k.cst',format:'cst',groups:{Clock:[['clk',4,'PULL_MODE=UP']],LEDs:[['led[0]',15],['led[1]',16],['led[2]',17],['led[3]',18],['led[4]',19],['led[5]',20]],Buttons:[['btn1',88,'PULL_MODE=UP'],['btn2',87,'PULL_MODE=UP']],
    UART:[['uart_rx',70,'PULL_MODE=UP'],['uart_tx',69]],'RGB LED':[['ws2812',79]],HDMI:[['tmds_clk_p',33],['tmds_clk_n',34],['tmds_d_p[0]',35],['tmds_d_n[0]',36],['tmds_d_p[1]',37],['tmds_d_n[1]',38],['tmds_d_p[2]',39],['tmds_d_n[2]',40]]}}
};
function constraintFile(def){const rows=Object.values(def.groups).flat();if(def.format==='pcf')return rows.map(([n,p])=>`set_io ${n} ${p}`).join('\n')+'\n';
  return rows.map(([n,p,opt])=>`IO_LOC "${n}" ${p};\nIO_PORT "${n}" IO_TYPE=LVCMOS33${opt?' '+opt:''};`).join('\n')+'\n'}
function renderPins(id){const def=PINS[id]||PINS.goboard;$('#pinGrid').innerHTML=`<div class="pin-head"><span>${BOARDS[id]?.name||''}</span><button type="button" id="pinDownload">Download .${def.format}</button></div>`+Object.entries(def.groups).map(([k,v])=>`<table><caption>${k}</caption>${v.map(([n,p])=>`<tr><td>${n}</td><td>${p}</td></tr>`).join('')}</table>`).join('');
  $('#pinDownload').onclick=()=>{const blob=new Blob([constraintFile(def)],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=def.file;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}}
function parseVcd(vcd,ports,samples=180){
  if(!vcd)return [];
  const idToPort={},widths={};let maxTime=0;
  for(const line of vcd.split('\n')){const v=line.match(/^\$var\s+\w+\s+(\d+)\s+(\S+)\s+(\S+)/);if(v){const p=ports.find(x=>x.name===v[3]);if(p){idToPort[v[2]]=p.name;widths[p.name]=+v[1]}}else if(line[0]==='#')maxTime=+line.slice(1)}
  const targets=Array.from({length:samples},(_,i)=>maxTime*i/Math.max(1,samples-1)),out=[],values={};let ti=0,time=0;
  const pushUntil=t=>{while(ti<targets.length&&targets[ti]<=t){out.push({...values});ti++}};
  for(const line of vcd.split('\n')){if(line[0]==='#'){pushUntil(+line.slice(1));time=+line.slice(1);continue}let id,val;if(line[0]==='b'){const m=line.match(/^b([01xXzZ]+)\s+(\S+)/);if(m){val=m[1];id=m[2]}}else if(/^[01xXzZ]/.test(line)){val=line[0];id=line.slice(1).trim()}const name=idToPort[id];if(name)values[name]=/[xz]/i.test(val)?0:parseInt(val,2)}
  pushUntil(maxTime);while(out.length<samples)out.push({...values});return out;
}
function renderVcdVga(vcd,ports){
  const colorPorts=ports.filter(p=>p.dir==='output'&&/VGA/i.test(p.name)),ids={},values={};
  for(const line of (vcd||'').split('\n')){const m=line.match(/^\$var\s+\w+\s+(\d+)\s+(\S+)\s+(\S+)/);if(m&&colorPorts.some(p=>p.name===m[3]))ids[m[2]]={name:m[3],bits:+m[1]}}
  const find=re=>colorPorts.find(p=>re.test(p.name))?.name,r=find(/(?:Red|_R)$/i),g=find(/(?:Grn|Green|_G)$/i),b=find(/(?:Blu|Blue|_B)$/i);if(!r||!g||!b)return null;
  const canvas=document.createElement('canvas');canvas.width=320;canvas.height=240;const cx=canvas.getContext('2d'),img=cx.createImageData(320,240);let groupTime=0,group=[],pixel=0;
  const apply=()=>{for(const [id,val] of group){const p=ids[id];if(p)values[p.name]=/[xz]/i.test(val)?0:parseInt(val,2)}while(pixel<420000&&(20000+pixel*40000)<=groupTime){const x=pixel%800,y=Math.floor(pixel/800)%525;if(x<640&&y<480&&!(x&1)&&!(y&1)){const off=((y>>1)*320+(x>>1))*4,scale=n=>Math.round(255*(values[n]||0)/Math.max(1,(1<<(colorPorts.find(p=>p.name===n)?.bits||1))-1));img.data[off]=scale(r);img.data[off+1]=scale(g);img.data[off+2]=scale(b);img.data[off+3]=255}pixel++}group=[]};
  for(const line of (vcd||'').split('\n')){if(line[0]==='#'){apply();groupTime=+line.slice(1);continue}let id,val;if(line[0]==='b'){const m=line.match(/^b([01xXzZ]+)\s+(\S+)/);if(m){val=m[1];id=m[2]}}else if(/^[01xXzZ]/.test(line)){val=line[0];id=line.slice(1).trim()}if(ids[id])group.push([id,val])}apply();cx.putImageData(img,0,0);return canvas;
}
function renderPackedVga(data,count,width,height,ports){
  if(!data||!count||!width||!height)return null;const colors=ports.filter(p=>p.dir==='output'&&/VGA/i.test(p.name)),find=re=>colors.find(p=>re.test(p.name)),rp=find(/(?:Red|_R)$/i),gp=find(/(?:Grn|Green|_G)$/i),bp=find(/(?:Blu|Blue|_B)$/i);if(!rp||!gp||!bp)return null;const pixels=width*height,available=Math.min(count,Math.floor(data.length/(pixels*3))),frames=[];
  for(let f=0;f<available;f++){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const cx=canvas.getContext('2d'),img=cx.createImageData(width,height),start=f*pixels*3;for(let p=0;p<pixels;p++){const src=start+p*3,dst=p*4;img.data[dst]=Math.round(255*data[src]/Math.max(1,(1<<rp.bits)-1));img.data[dst+1]=Math.round(255*data[src+1]/Math.max(1,(1<<gp.bits)-1));img.data[dst+2]=Math.round(255*data[src+2]/Math.max(1,(1<<bp.bits)-1));img.data[dst+3]=255}cx.putImageData(img,0,0);frames.push(canvas)}return frames;
}
const SEG_MAP=['abcdef','bc','abdeg','abcdg','bcfg','acdfg','acdefg','abc','abcdefg','abcdfg','abcefg','cdefg','adef','bcdeg','adefg','aefg'];const segLetter=el=>el.dataset.seg||(el.dataset.seg=[...el.classList].find(x=>x.length===1));
function setDigit(which,n){const map=n==null?'':SEG_MAP[n&15];for(const s of segEls[which]){const on=map.includes(segLetter(s));if(s.classList.contains('on')!==on)s.classList.toggle('on',on)}}
function outputValue(names){const sc=scrubCycle();if(sc!=null){for(const n of names){const sig=scrubSignal(n);if(sig){const v=valueAt(sig,sc);return v==null?0:Number(v)}}return 0}if(sim){try{return Number(sim.output(names))}catch{}}for(const n of names)if(Object.hasOwn(wasmOutputs,n))return Number(wasmOutputs[n]);return 0}
function setPhysicalDigit(which,prefix){const names='ABCDEFG';segEls[which].forEach((segment,i)=>{const n=`${prefix}_${names[i]}`,d=dutyOf([n]),lit=d==null?(outputValue([n])?0:1):1-d,on=lit>0.02;if(segment.classList.contains('on')!==on)segment.classList.toggle('on',on);const op=on&&d!=null?String(Math.round((0.3+0.7*lit)*100)/100):'';if(segment.style.opacity!==op)segment.style.opacity=op})}

// ---------------------------------------------------------------- state
const isClock=name=>/^(i_)?clk$|clock/i.test(name);
const PS_PER_CYCLE=40000;
let vgaInfo=null;
let mode='blink',running=false,paused=false,ticks=0,buttons=[0,0,0,0,0,0],latched=[false,false,false,false,false,false],frame=0,sim=null,compiledSource='',wave=[],wasmResult=null,wasmOutputs={},vgaPixels=null,compileSerial=0,wavePlayback=0,vgaPlayback=0,hasClockedDesign=false,nativeActive=false,last=performance.now(),vcdEnd=0,outSigByIndex=[],inSigByIndex=[];
const trace={signals:[],end:0,playhead:null,overflow:false};
let dutyByName=null,outputPortNames=[],rgbColor=null;
function scrubCycle(){if(!paused||!waveView)return null;return waveView.cursor??waveView.hover??null}
function scrubSignal(name){return trace.signals.find(s=>s.name===name)}
function dutyOf(names){if(scrubCycle()!=null)return null;if(!dutyByName)return null;for(const n of names)if(n in dutyByName)return dutyByName[n];return null}
const SIGNAL_CAP=600000;
function traceReset(ports,widths={}){trace.signals=ports.filter(p=>!isClock(p.name)).map(p=>({name:p.name,dir:p.dir,bits:widths[p.name]||p.bits||1,t:[],v:[]}));trace.end=0;trace.playhead=null;trace.overflow=false}
function traceClear(){for(const s of trace.signals){s.t.length=0;s.v.length=0}trace.end=0;trace.playhead=null;trace.overflow=false}
function traceAdd(sig,cycle,value){const n=sig.t.length;if(n&&sig.t[n-1]===cycle){sig.v[n-1]=value;return}if(n&&sig.v[n-1]===value)return;if(n&&sig.t[n-1]>cycle)return;sig.t.push(cycle);sig.v.push(value);if(n>SIGNAL_CAP){sig.t.splice(0,SIGNAL_CAP>>1);sig.v.splice(0,SIGNAL_CAP>>1)}}
function upperBound(arr,x){let lo=0,hi=arr.length;while(lo<hi){const mid=(lo+hi)>>1;if(arr[mid]<=x)lo=mid+1;else hi=mid}return lo}
function valueAt(sig,cycle){const i=upperBound(sig.t,cycle)-1;return i<0?null:sig.v[i]}
const level=pressed=>board&&board.switchActiveLow?(pressed?0:1):(pressed?1:0);
function switchIndex(name){const m=name.match(/^(?:i_Switch_|SW|BTN|BUTTON|KEY|S|btn|key|sw)_?(\d+)$/i);if(!m)return -1;const i=Number(m[1])-(board?.switchBase??1);return i>=0&&i<buttons.length?i:-1}
const isSwitchBus=name=>/^(btns?|buttons?|sw|keys?|switch(es)?)$/i.test(name);
function buttonForPort(name,bits=1){const i=switchIndex(name);if(i>=0)return level(buttons[i]);if(isSwitchBus(name)){let v=0;for(let b=0;b<bits;b++)v|=level(buttons[b])<<b;return v}return 0}
function ledPorts(i){const n=i+(board?.ledBase??1);return [`LED${n}`,`led${n}`,`o_LED_${n}`,`LED_${n}`]}
const isLedBus=name=>/^(leds?)$/i.test(name);
function ledState(i){const names=ledPorts(i);let d=dutyOf(names),v=null;
  const sc=scrubCycle(),has=n=>Object.hasOwn(wasmOutputs,n)||(sc!=null&&!!scrubSignal(n));
  if(d!=null||names.some(has))v=!!outputValue(names);
  else{const bus=outputPortNames.find(isLedBus);if(bus&&has(bus))v=((outputValue([bus])||0)>>i&1)===1;else if(sim){try{const r=sim.output(names);if(r!=null)v=!!Number(r)}catch{}if(v==null){try{const r=sim.output(['led','LED']);if(r!=null)v=((Number(r)||0)>>i&1)===1}catch{}}}}
  if(v==null)return {on:false,duty:null};
  if(board&&board.ledActiveLow){v=!v;if(d!=null)d=1-d}return {on:d==null?v:d>0.02,duty:d}}
function setStatus(text){$('#status').textContent=text}
function summary(top,ports,extra){const w=p=>p.bits>1?`${p.name} [${p.bits-1}:0]`:p.name;const ins=ports.filter(p=>p.dir==='input').map(w),outs=ports.filter(p=>p.dir==='output').map(w);return [`module ${top}`,`inputs  ${ins.join(', ')||'none'}`,`outputs ${outs.join(', ')||'none'}`,extra].filter(Boolean).join('\n')}
function detectMode(ports){const outs=ports.filter(p=>p.dir==='output').map(p=>p.name),ins=ports.filter(p=>p.dir==='input').map(p=>p.name);mode=outs.some(n=>/VGA|HDMI|DVI/i.test(n))?'vga':outs.some(n=>/Segment|7Seg|^S[12]_[A-G]$/i.test(n))?'seven':ins.some(n=>switchIndex(n)>=0||isSwitchBus(n))?'switches':'logic'}

function loadVcdTrace(vcd){
  if(!vcd)return;const ids={};let unitPs=1,maxTime=0;const ts=vcd.match(/\$timescale\s+(\d+)\s*(fs|ps|ns|us|ms|s)/);if(ts)unitPs=+ts[1]*{fs:.001,ps:1,ns:1e3,us:1e6,ms:1e9,s:1e12}[ts[2]];
  for(const line of vcd.split('\n')){const v=line.match(/^\$var\s+\w+\s+(\d+)\s+(\S+)\s+(\S+)/);if(v){const sig=trace.signals.find(s=>s.name===v[3]);if(sig){ids[v[2]]=sig;sig.bits=+v[1]}}else if(line[0]==='#')maxTime=Math.max(maxTime,+line.slice(1))}
  let time=0;for(const line of vcd.split('\n')){if(line[0]==='#'){time=+line.slice(1);continue}let id,val;if(line[0]==='b'){const m=line.match(/^b([01xXzZ]+)\s+(\S+)/);if(m){val=m[1];id=m[2]}}else if(/^[01xXzZ]/.test(line)){val=line[0];id=line.slice(1).trim()}const sig=ids[id];if(sig)traceAdd(sig,time*unitPs/PS_PER_CYCLE,/[xz]/i.test(val)?0:parseInt(val,2))}
  vcdEnd=maxTime*unitPs/PS_PER_CYCLE;trace.end=vcdEnd;trace.playhead=0
}

// ---------------------------------------------------------------- editor
const code=$('#code'),hl=$('#hl'),linesEl=$('#lines');
const KEYWORDS=/^(module|endmodule|always|always_ff|always_comb|assign|begin|end|if|else|case|casez|casex|endcase|default|posedge|negedge|initial|function|endfunction|task|endtask|generate|endgenerate|for|while|repeat|genvar|or|and|not|xor|nand|nor|return)$/;
const TYPES=/^(input|output|inout|wire|reg|logic|integer|parameter|localparam|signed|unsigned|bit|byte|int|shortint|longint|real|time)$/;
const TOKEN=/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*")|(\b\d*'[sS]?[bBhHdDoO][0-9a-fA-F_xXzZ?]+\b|\b\d[\d_]*(?:\.\d+)?\b)|(`?\b[A-Za-z_$][\w$]*\b)|([()\[\]{};,:.<>=!~&|^+\-*\/%?@#])/g;
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function highlight(src){let out='',i=0;for(const m of src.matchAll(TOKEN)){out+=esc(src.slice(i,m.index));i=m.index+m[0].length;const t=esc(m[0]);if(m[1])out+=`<span class="tk-c">${t}</span>`;else if(m[2])out+=`<span class="tk-s">${t}</span>`;else if(m[3])out+=`<span class="tk-n">${t}</span>`;else if(m[4])out+=m[0][0]==='`'?`<span class="tk-m">${t}</span>`:KEYWORDS.test(m[0])?`<span class="tk-k">${t}</span>`:TYPES.test(m[0])?`<span class="tk-t">${t}</span>`:t;else out+=`<span class="tk-p">${t}</span>`}return out+esc(src.slice(i))}
let errorLines=new Set();
let curLine=1;
function caretPos(){const before=code.value.slice(0,code.selectionStart),lines=before.split('\n');return {line:lines.length,col:lines[lines.length-1].length+1}}
const narrow=matchMedia('(max-width: 900px)');
function fitEditor(){if(!narrow.matches){$('#editorPane').style.removeProperty('--editor-h');return}const n=code.value.split('\n').length,lh=parseFloat(getComputedStyle(code).lineHeight)||19.5;$('#editorPane').style.setProperty('--editor-h',Math.round(n*lh+16+40+24)+'px')}
narrow.addEventListener('change',fitEditor);
function refreshEditor(){if($('#editorNote'))updateEditorNote();fitEditor();hl.innerHTML=highlight(code.value)+'\n';const n=code.value.split('\n').length;linesEl.innerHTML=Array.from({length:n},(_,i)=>`<span${errorLines.has(i+1)?' class="err"':i+1===curLine?' class="cur"':''}>${i+1}</span>`).join('');syncScroll()}
function updateCaret(){const p=caretPos();$('#status-pos').textContent=`${p.line}:${p.col}`;if(p.line!==curLine){const prev=linesEl.children[curLine-1],next=linesEl.children[p.line-1];prev?.classList.remove('cur');if(next&&!next.classList.contains('err'))next.classList.add('cur');curLine=p.line}}
function gotoLine(n){const lines=code.value.split('\n');let pos=0;for(let i=0;i<n-1&&i<lines.length;i++)pos+=lines[i].length+1;code.focus();code.setSelectionRange(pos,pos+(lines[n-1]?.length||0));code.scrollTop=Math.max(0,(n-4)*parseFloat(getComputedStyle(code).lineHeight));syncScroll();updateCaret()}
function toggleComment(){const v=code.value,s0=code.selectionStart,s1=code.selectionEnd,a=v.lastIndexOf('\n',s0-1)+1,bEnd=v.indexOf('\n',s1);const b=bEnd<0?v.length:bEnd,block=v.slice(a,b),lines=block.split('\n'),all=lines.every(l=>/^\s*\/\//.test(l)||!l.trim());const out=lines.map(l=>all?l.replace(/^(\s*)\/\/ ?/,'$1'):l.trim()?l.replace(/^(\s*)/,'$1// '):l).join('\n');code.setRangeText(out,a,b,'select');refreshEditor();saveCode()}
function syncScroll(){hl.scrollTop=code.scrollTop;hl.scrollLeft=code.scrollLeft;linesEl.scrollTop=code.scrollTop}
function markErrors(log){errorLines=new Set();for(const m of (log||'').matchAll(/design\.v:(\d+)/g))errorLines.add(+m[1]);refreshEditor();if(errorLines.size){const first=Math.min(...errorLines);code.scrollTop=Math.max(0,(first-4)*parseFloat(getComputedStyle(code).lineHeight));syncScroll()}}
function saveCode(){try{localStorage.setItem('goboard-code',code.value)}catch{}}
code.addEventListener('input',()=>{refreshEditor();saveCode()});
function updateEditorNote(){$('#editorNote').hidden=!/hdmi|tmds|dvi/i.test(code.value)}
code.addEventListener('input',updateEditorNote);
code.addEventListener('scroll',syncScroll);
code.addEventListener('keydown',e=>{const mod=e.ctrlKey||e.metaKey;
  if(e.key==='Tab'){e.preventDefault();const s=code.selectionStart,t=code.selectionEnd;if(s!==t&&code.value.slice(s,t).includes('\n')){const v=code.value,a=v.lastIndexOf('\n',s-1)+1,bEnd=v.indexOf('\n',t),b=bEnd<0?v.length:bEnd,lines=v.slice(a,b).split('\n'),out=lines.map(l=>e.shiftKey?l.replace(/^  /,''):'  '+l).join('\n');code.setRangeText(out,a,b,'select')}else if(e.shiftKey){const v=code.value,a=v.lastIndexOf('\n',s-1)+1;if(v.slice(a,a+2)==='  ')code.setRangeText('',a,a+2,'preserve')}else code.setRangeText('  ',s,t,'end');refreshEditor();saveCode()}
  else if(e.key==='Enter'&&mod){e.preventDefault();compile()}
  else if(e.key==='Enter'){e.preventDefault();const v=code.value,s=code.selectionStart,a=v.lastIndexOf('\n',s-1)+1,line=v.slice(a,s),indent=(line.match(/^\s*/)||[''])[0],extra=/(\bbegin|\(|\bcase\b.*\))\s*$/.test(line)?'  ':'';code.setRangeText('\n'+indent+extra,s,code.selectionEnd,'end');refreshEditor();saveCode();updateCaret()}
  else if(mod&&e.key==='s'){e.preventDefault();$('#saveBtn').click()}
  else if(mod&&e.key==='/'){e.preventDefault();toggleComment()}
  else if(e.key==='Escape'){code.blur()}});
code.addEventListener('keyup',updateCaret);code.addEventListener('click',updateCaret);code.addEventListener('select',updateCaret);
$('#examples').onchange=e=>load(e.target.value);
// Custom menus: a button + list that drive the hidden native <select>, so value/onchange keep working.
function menuFor(sel){
  const wrap=document.createElement('div');wrap.className='menu';const btn=document.createElement('button');btn.type='button';btn.className='menu-btn';btn.setAttribute('aria-haspopup','listbox');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-label',sel.getAttribute('aria-label')||'');
  const list=document.createElement('div');list.className='menu-list';list.setAttribute('role','listbox');list.hidden=true;
  const label=()=>{const o=sel.options[sel.selectedIndex];btn.textContent=o?o.textContent:'';};
  const build=()=>{list.innerHTML='';for(const o of sel.options){if(o.disabled&&!o.value)continue;const it=document.createElement('button');it.type='button';it.setAttribute('role','option');it.textContent=o.textContent;it.dataset.value=o.value;it.setAttribute('aria-selected',String(o.selected));if(o.disabled){it.disabled=true;it.setAttribute('aria-disabled','true');list.appendChild(it);continue}it.onclick=()=>{sel.value=o.value;sel.dispatchEvent(new Event('change'));close();label();};list.appendChild(it)}};
  const open=()=>{build();list.hidden=false;btn.setAttribute('aria-expanded','true');document.addEventListener('pointerdown',onDoc,true);document.addEventListener('keydown',onKey)};
  const close=()=>{list.hidden=true;btn.setAttribute('aria-expanded','false');document.removeEventListener('pointerdown',onDoc,true);document.removeEventListener('keydown',onKey)};
  const onDoc=e=>{if(!wrap.contains(e.target))close()};const onKey=e=>{if(e.key==='Escape'){close();btn.focus()}};
  btn.onclick=()=>list.hidden?open():close();
  sel.addEventListener('change',label);sel.hidden=true;sel.tabIndex=-1;sel.parentNode.insertBefore(wrap,sel);wrap.append(btn,list,sel);label();
  const mo=new MutationObserver(label);mo.observe(sel,{attributes:true,childList:true,subtree:true});
  return {label};
}
const exampleMenu=menuFor($('#examples')),speedMenu=menuFor($('#speed')),boardMenu=menuFor($('#board'));
$('#board').onchange=e=>{buildBoard(e.target.value);boardMenu.label();exampleMenu.label();load('blink')};
$('#openBtn').onclick=()=>$('#fileInput').click();
$('#menuBtn').onclick=()=>{const open=!$('#nav').classList.contains('open');$('#nav').classList.toggle('open',open);$('#menuBtn').setAttribute('aria-expanded',String(open))};
$('#fileInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;code.value=await f.text();$('#examples').selectedIndex=0;exampleMenu.label();refreshEditor();saveCode();e.target.value=''};
$('#saveBtn').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([code.value],{type:'text/plain'}));a.download='design.v';a.click();URL.revokeObjectURL(a.href)};

function setLog(text){const log=$('#log');log.innerHTML=esc(text||'').split('\n').map(l=>{l=l.replace(/\/?design\.s?v:(\d+)/g,(m,n)=>`<span class="loc" data-line="${n}">${m}</span>`);return /error|ERROR/.test(l)?`<span class="err">${l}</span>`:/warning/i.test(l)?`<span class="warn">${l}</span>`:l}).join('\n');const n=(text||'').split('\n').filter(l=>/error|ERROR/.test(l)).length;$('.tab[data-tab="log"]').textContent=n?`Output (${n})`:'Output';markErrors(text);if(n)showTab('log')}
function appendProgress(message){const b=$('#busy');const m=/(\d+)%/.exec(message);if(m){b.dataset.pct='';b.style.setProperty('--pct',m[1]+'%');setStatus(`Downloading ${m[1]}%`)}else{delete b.dataset.pct;b.style.removeProperty('--pct');setStatus('Compiling')}}
function setBusy(on){const b=$('#busy');b.hidden=!on;if(on){delete b.dataset.pct;b.style.removeProperty('--pct')}}

function load(name){nativeWorker?.postMessage({type:'stop'});nativeActive=false;dutyByName=null;rgbColor=null;vgaInfo=null;mode=name;code.value=examples[name];$('#examples').value=name;exampleMenu.label();refreshEditor();saveCode();running=false;paused=false;sim=null;wasmResult=null;wasmOutputs={};wave=[];vgaPixels=null;ticks=0;frame=0;trace.signals=[];traceClear();setStatus('Ready');setLog('');$('#pauseBtn').classList.remove('is-paused');$('#pauseBtn').setAttribute('aria-label','Pause');$('#pauseBtn').title='Pause';drawVga();renderModel();waveView.reset()}

// ---------------------------------------------------------------- pins


// ---------------------------------------------------------------- dock
let traceWanted=true;
function showTab(name){$$('.tab').forEach(t=>t.classList.toggle('selected',t.dataset.tab===name));$$('.dock-body').forEach(b=>b.hidden=b.dataset.panel!==name);$$('.dock-tools').forEach(t=>t.hidden=t.dataset.for!==name);traceWanted=name==='wave';nativeWorker?.postMessage({type:'trace',value:traceWanted});if(name==='wave')waveView.requestDraw()}
$$('.tab').forEach(t=>t.onclick=()=>showTab(t.dataset.tab));
$('#clearBtn').onclick=()=>setLog('');
$('#log').addEventListener('click',e=>{const loc=e.target.closest('.loc');if(loc)gotoLine(+loc.dataset.line)});

const ide=$('#ide');
function restoreSplits(){try{const w=localStorage.getItem('goboard-editor-w'),h=localStorage.getItem('goboard-dock-h');if(w)ide.style.setProperty('--editor-w',w);if(h)ide.style.setProperty('--dock-h',h)}catch{}}
function makeSplit(el,axis){el.addEventListener('pointerdown',e=>{if(e.button!==0)return;try{el.setPointerCapture(e.pointerId)}catch{}el.classList.add('active');document.body.classList.add('resizing');document.body.style.cursor=axis==='x'?'col-resize':'row-resize';const rect=ide.getBoundingClientRect();const move=ev=>{if(axis==='x'){const w=Math.max(240,Math.min(rect.width-320,ev.clientX-rect.left));ide.style.setProperty('--editor-w',w+'px')}else{const h=Math.max(120,Math.min(rect.height-200,rect.bottom-ev.clientY));ide.style.setProperty('--dock-h',h+'px')}waveView.requestDraw()};const up=()=>{el.removeEventListener('pointermove',move);el.classList.remove('active');document.body.classList.remove('resizing');document.body.style.cursor='';try{localStorage.setItem(axis==='x'?'goboard-editor-w':'goboard-dock-h',ide.style.getPropertyValue(axis==='x'?'--editor-w':'--dock-h'))}catch{}};el.addEventListener('pointermove',move);el.addEventListener('pointerup',up,{once:true});el.addEventListener('pointercancel',up,{once:true});e.preventDefault()})}
makeSplit($('#vsplit'),'x');makeSplit($('#hsplit'),'y');restoreSplits();

// ---------------------------------------------------------------- waveform viewer
function fmtTime(cycles,step){const s=cycles/CYCLES_PER_SEC,a=Math.abs(s);const [k,u]=a>=1?[1,'s']:a>=1e-3?[1e3,'ms']:a>=1e-6?[1e6,'µs']:[1e9,'ns'];const v=s*k;let d=Math.abs(v)>=100?0:Math.abs(v)>=10?1:Math.abs(v)>=1?2:3;if(step){const sv=step/CYCLES_PER_SEC*k;d=Math.max(d,Math.min(6,Math.ceil(-Math.log10(sv))))}return `${v.toFixed(d)} ${u}`}
function fmtValue(sig,v){if(v==null)return '';if(sig.bits===1)return String(v);if(sig.bits<=8)return (v>>>0).toString(2).padStart(sig.bits,'0');return '0x'+(v>>>0).toString(16).toUpperCase().padStart(Math.ceil(sig.bits/4),'0')}
function waveRows(){const rows=[];trace.signals.forEach((sig,i)=>{rows.push({sig,bit:null,ci:i});if(sig.bits>1&&sig.bits<=8)for(let b=sig.bits-1;b>=0;b--)rows.push({sig,bit:b,ci:i})});return rows}
function niceStep(x){const p=10**Math.floor(Math.log10(x));const m=x/p;return (m<=1?1:m<=2?2:m<=5?5:10)*p}
const waveView={
  c:$('#waveform'),g:null,lastDraw:0,names:160,axis:24,row:30,t0:0,cpp:400,follow:true,auto:true,cursor:null,hover:null,dirty:true,drag:null,minCpp:1/40,
  init(){this.g=this.c.getContext('2d');const c=this.c;
    c.addEventListener('pointerdown',e=>{if(e.button!==0)return;try{c.setPointerCapture(e.pointerId)}catch{}this.drag={x:e.clientX,t0:this.t0,moved:false};e.preventDefault()});
    c.addEventListener('pointermove',e=>{const px=this.px(e);if(this.drag){const dx=e.clientX-this.drag.x;if(Math.abs(dx)>2)this.drag.moved=true;if(this.drag.moved){this.follow=false;$('#live').setAttribute('aria-pressed','false');this.t0=this.drag.t0-dx*this.cpp}}this.hover=px>=0?this.t0+px*this.cpp:null;this.requestDraw()});
    c.addEventListener('pointerup',e=>{if(this.drag&&!this.drag.moved){const px=this.px(e);const t=px>=0?this.t0+px*this.cpp:null;const nearCursor=this.cursor!=null&&t!=null&&Math.abs((this.cursor-this.t0)/this.cpp-px)<6;this.cursor=nearCursor?null:t;renderModel()}this.drag=null;this.requestDraw()});
    c.addEventListener('pointermove',()=>{if(paused)renderModel()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.cursor!=null&&!(e.target instanceof Element&&e.target.closest('textarea,input'))){this.cursor=null;renderModel();this.requestDraw()}});
    c.addEventListener('pointerleave',()=>{this.hover=null;this.requestDraw()});
    c.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)){e.preventDefault();if(e.ctrlKey||e.metaKey)this.zoom(Math.exp(e.deltaY*.01),this.px(e));else{this.t0+=e.deltaX*this.cpp;this.follow=false;$('#live').setAttribute('aria-pressed','false')}this.requestDraw()}},{passive:false});
    c.addEventListener('dblclick',e=>{this.zoom(.5,this.px(e))});
    $('#zoomIn').onclick=()=>this.zoom(.5,this.width()/2);$('#zoomOut').onclick=()=>this.zoom(2,this.width()/2);$('#zoomFit').onclick=()=>this.fit();
    $('#zoomAuto').onclick=()=>{this.setAuto(!this.auto);if(this.auto){this.follow=true;$('#live').setAttribute('aria-pressed','true')}this.requestDraw()};
    $('#live').onclick=()=>{this.follow=!this.follow;$('#live').setAttribute('aria-pressed',String(this.follow));this.requestDraw()};
    new ResizeObserver(()=>this.requestDraw()).observe(c.parentElement);
  },
  px(e){const r=this.c.getBoundingClientRect();return e.clientX-r.left-this.names},
  width(){return Math.max(1,this.c.clientWidth-this.names)},
  start(){let s=Infinity;for(const sig of trace.signals)if(sig.t.length)s=Math.min(s,sig.t[0]);return isFinite(s)?s:0},
  maxCpp(){return Math.max(1,(trace.end-this.start())*2/this.width())},
  setAuto(v){this.auto=v;$('#zoomAuto').setAttribute('aria-pressed',String(v))},
  autoCpp(){const medians=[];for(const sig of trace.signals){const t=sig.t,n=t.length;if(n<3)continue;const ivs=[];for(let i=Math.max(2,n-40);i<n;i++){const d=t[i]-t[i-1];if(d>0)ivs.push(d)}if(!ivs.length)continue;ivs.sort((a,b)=>a-b);medians.push(ivs[ivs.length>>1])}
    if(!medians.length)return null;const geo=Math.exp(medians.reduce((a,v)=>a+Math.log(v),0)/medians.length);return Math.min(this.maxCpp(),Math.max(this.minCpp,geo*12/this.width()))},
  applyAuto(){if(!this.auto)return;const c=this.autoCpp();if(c!=null&&(c>this.cpp*1.5||c<this.cpp/1.5))this.cpp=c},
  zoom(f,px){this.setAuto(false);const t=this.t0+px*this.cpp;this.cpp=Math.min(this.maxCpp(),Math.max(this.minCpp,this.cpp*f));this.t0=t-px*this.cpp;this.requestDraw()},
  fit(){this.setAuto(false);this.cpp=Math.max(this.minCpp,(trace.end-this.start())/this.width());this.t0=this.start();this.follow=true;$('#live').setAttribute('aria-pressed','true');this.requestDraw()},
  reset(){this.cursor=null;this.hover=null;this.follow=true;this.setAuto(true);$('#live').setAttribute('aria-pressed','true');this.cpp=CYCLES_PER_SEC/this.width();this.t0=0;this.requestDraw()},
  requestDraw(){this.dirty=true},
  tick(live,now){if((this.dirty||(live&&this.follow))&&now-this.lastDraw>=32){this.dirty=false;this.lastDraw=now;this.applyAuto();this.draw()}},
  draw(){
    const c=this.c,g=this.g,dpr=devicePixelRatio||1;if(c.parentElement.hidden)return;const rows=waveRows(),need=this.axis+rows.length*this.row,avail=c.parentElement.clientHeight,wantH=need>avail?need+'px':'100%';if(c.style.height!==wantH)c.style.height=wantH;const W=c.clientWidth,H=c.clientHeight;if(!W||!H)return;
    if(c.width!==Math.round(W*dpr)||c.height!==Math.round(H*dpr)){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr)}
    g.setTransform(dpr,0,0,dpr,0,0);const cs=getComputedStyle(document.documentElement),fg=cs.getPropertyValue('--wave-fg').trim(),bg=cs.getPropertyValue('--wave-bg').trim(),grid=cs.getPropertyValue('--wave-grid').trim(),busy=cs.getPropertyValue('--wave-busy').trim(),low=cs.getPropertyValue('--wave-low').trim()||busy,cur=cs.getPropertyValue('--wave-cursor').trim(),mono=cs.getPropertyValue('--ux-mono').trim();
    const palette=cs.getPropertyValue('--wave-palette').trim().split(/\s+/);const names=this.names,axis=this.axis,row=this.row,width=W-names;const signals=trace.signals;
    const end=trace.end,start=this.start();if(this.follow)this.t0=Math.max(start,end-width*this.cpp);const t0=this.t0,cpp=this.cpp,t1=t0+width*cpp;if(this.cursor!=null&&running&&!paused&&this.follow&&this.cursor<t0){this.cursor=null;renderModel()}
    g.fillStyle=bg;g.fillRect(0,0,W,H);g.font=`11px ${mono}`;g.textBaseline='middle';
    // axis
    g.strokeStyle=grid;g.fillStyle=fg;g.lineWidth=1;const stepNs=niceStep(90*cpp*40),stepC=stepNs/40;g.beginPath();for(let t=Math.ceil(t0/stepC)*stepC;t<=t1;t+=stepC){const x=names+Math.round((t-t0)/cpp)+.5;g.moveTo(x,axis);g.lineTo(x,H);g.fillText(fmtTime(t,stepC),x+3,axis/2)}g.stroke();
    g.strokeStyle=grid;g.beginPath();g.moveTo(names+.5,0);g.lineTo(names+.5,H);g.moveTo(0,axis+.5);g.lineTo(W,axis+.5);g.stroke();
    // rows
    const inspecting=paused||!running;const readAt=inspecting?(this.cursor??this.hover??(trace.playhead??end)):(trace.playhead??end);const readTint=inspecting&&this.cursor!=null?cur:inspecting&&this.hover!=null?fg:null;
    for(let r=0;r<rows.length;r++){const top=axis+r*row;if(top>H)break;const {sig,bit,ci}=rows[r],yH=top+7,yL=top+row-7,yM=(yH+yL)/2,color=palette[ci%palette.length]||fg;
      g.strokeStyle=grid;g.beginPath();g.moveTo(0,top+row+.5);g.lineTo(W,top+row+.5);g.stroke();
      {const label=bit==null?sig.name:`${sig.name}[${bit}]`;g.fillStyle=bit==null?color:busy;g.textAlign='left';g.fillText(label.length>18?label.slice(0,17)+'…':label,bit==null?8:20,top+row/2)}g.textAlign='right';{let val=valueAt(sig,readAt);if(bit!=null&&val!=null)val=(val>>bit)&1;const single=sig.bits===1||bit!=null;g.fillStyle=readTint||(single?(val?color:low):busy);g.fillText(single?String(val??''):fmtValue(sig,val),names-8,top+row/2)}g.textAlign='left';
      if(!sig.t.length)continue;
      g.save();g.beginPath();g.rect(names,top,width,row);g.clip();
      const t=sig.t,v=sig.v;
      if(sig.bits===1||bit!=null){const hi=new Path2D(),lo=new Path2D(),edges=new Path2D();let prevIdx=upperBound(t,t0)-1;let runY=null,runX=0;
        const flushRun=(x)=>{if(runY==null)return;const p=runY===yH?hi:lo;p.moveTo(runX,runY);p.lineTo(x,runY)};
        for(let px=0;px<=width;px++){const tb=t0+(px+1)*cpp,ib=upperBound(t,tb)-1,x=names+px;const raw=ib<0?null:v[ib],level=raw==null?null:bit==null?raw:(raw>>bit)&1,y=level==null?null:level?yH:yL;const changed=ib>prevIdx&&(bit==null||prevIdx<0||((v[prevIdx]>>bit)&1)!==level);if(changed){flushRun(x);edges.moveTo(x+.5,yH);edges.lineTo(x+.5,yL);runY=y;runX=x}else if(y!==runY){flushRun(x);runY=y;runX=x}prevIdx=ib}
        flushRun(names+width);
        g.lineWidth=1;g.strokeStyle=color;g.globalAlpha=.45;g.stroke(lo);g.stroke(edges);g.globalAlpha=1;g.lineWidth=1.5;g.stroke(hi);g.lineWidth=1}
      else{let prevIdx=upperBound(t,t0)-1,spanStart=0,spanVal=prevIdx<0?null:v[prevIdx],spanBusy=false;
        const flush=(x0,x1,val,isBusy)=>{if(val==null&&!isBusy)return;const a=names+x0,b=names+x1;if(isBusy){g.globalAlpha=.45;g.fillStyle=color;g.fillRect(a,yH,Math.max(1,b-a),yL-yH);g.globalAlpha=1;return}g.strokeStyle=color;g.beginPath();g.moveTo(a,yM);g.lineTo(a+3,yH);g.lineTo(b-3,yH);g.lineTo(b,yM);g.lineTo(b-3,yL);g.lineTo(a+3,yL);g.closePath();g.stroke();if(b-a>30){g.fillStyle=fg;g.textAlign='center';const label=fmtValue(sig,val);g.fillText(label.length*6.6>b-a-8?label.slice(0,Math.max(1,Math.floor((b-a-8)/6.6)))+'…':label,(a+b)/2,yM);g.textAlign='left'}};
        for(let px=0;px<=width;px++){const tb=t0+(px+1)*cpp,ib=upperBound(t,tb)-1,val=ib<0?null:v[ib],isBusy=ib>prevIdx;if(isBusy!==spanBusy||val!==spanVal||isBusy){if(isBusy&&spanBusy){prevIdx=ib;continue}flush(spanStart,px,spanVal,spanBusy);spanStart=px;spanVal=val;spanBusy=isBusy}prevIdx=ib}
        flush(spanStart,width,spanVal,spanBusy)}
      g.restore()}
    // playhead / cursor / hover
    const vline=(tc,color,dash,alpha=1)=>{if(tc==null||tc<t0||tc>t1)return;const x=names+Math.round((tc-t0)/cpp)+.5;g.strokeStyle=color;g.globalAlpha=alpha;g.setLineDash(dash);g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();g.setLineDash([]);g.globalAlpha=1};
    vline(trace.playhead,busy,[]);vline(this.hover,fg,[4,3],.7);vline(this.cursor,cur,[]);
    const parts=[];if(this.cursor!=null)parts.push(fmtTime(this.cursor));if(this.hover!=null&&this.cursor!=null)parts.push('Δ '+fmtTime(this.hover-this.cursor));else if(this.hover!=null)parts.push(fmtTime(this.hover));if(trace.overflow)parts.push('…');$('#waveReadout').textContent=parts.join('   ');
  }
};
waveView.init();

// ---------------------------------------------------------------- native runtime
function handleNativeRuntime(data){
  if(!nativeActive)return;wasmOutputs=data.outputs||{};frame=data.frameNumber||frame;if(data.rgb!=null)rgbColor=data.rgb;const endCycle=data.cycle||0,endLo=endCycle>>>0,tr=data.trace||[];
  for(let i=0;i<tr.length;i+=3){const sig=outSigByIndex[tr[i+1]];if(sig)traceAdd(sig,endCycle-((endLo-tr[i])>>>0),tr[i+2])}
  for(const [cyc,idx,val] of data.inputEvents||[]){const sig=inSigByIndex[idx];if(sig)traceAdd(sig,cyc,val)}
  trace.end=endCycle;if(data.overflow)trace.overflow=true;ticks=endCycle;
  if(data.duty){dutyByName={};for(let i=0;i<outputPortNames.length;i++)dutyByName[outputPortNames[i]]=data.duty[i]}
  if(data.type==='frame'){nativeFrameCanvas||=document.createElement('canvas');nativeFrameCanvas.width=640;nativeFrameCanvas.height=480;nativeFrameCanvas.getContext('2d').putImageData(new ImageData(data.frame,640,480),0,0);vgaPixels=nativeFrameCanvas;vgaInfo=data.vga||null;drawVga();$('#frame').textContent=String(frame).padStart(4,'0')}
  renderModel();waveView.requestDraw()
}

// ---------------------------------------------------------------- compile
async function compile(){
  const serial=++compileSerial,src=code.value;nativeActive=false;dutyByName=null;vgaInfo=null;compiledSource=src;running=false;sim=null;wasmResult=null;wasmOutputs={};vgaPixels=null;wavePlayback=0;vgaPlayback=0;wave=[];hasClockedDesign=false;trace.signals=[];traceClear();
  setStatus('Compiling');setLog('');setBusy(true);await new Promise(requestAnimationFrame);
  const inputs={};for(let i=1;i<=4;i++){inputs[`i_Switch_${i}`]=buttons[i-1];inputs[`SW${i}`]=buttons[i-1];inputs[`BUTTON${i}`]=buttons[i-1]}
  let nativeError=null;
  const t0=performance.now();
  try{const result=await runNativeInWorker(src,appendProgress);if(serial!==compileSerial)return;
    detectMode(result.ports);nativeInputPorts=result.ports.filter(p=>p.dir==='input'&&!isClock(p.name));hasClockedDesign=result.ports.some(p=>p.dir==='input'&&isClock(p.name));
    traceReset(result.ports);outputPortNames=result.ports.filter(p=>p.dir==='output').map(p=>p.name);dutyByName=null;vgaInfo=null;outSigByIndex=result.ports.filter(p=>p.dir==='output').map(p=>trace.signals.find(s=>s.name===p.name));inSigByIndex=nativeInputPorts.map(p=>trace.signals.find(s=>s.name===p.name));
    nativeActive=true;running=true;paused=false;ticks=0;frame=0;setStatus('Running');$('#pauseBtn').classList.remove('is-paused');$('#pauseBtn').setAttribute('aria-label','Pause');$('#pauseBtn').title='Pause';setLog([summary(result.top,result.ports,result.cached?'loaded from cache':`compiled in ${((performance.now()-t0)/1000).toFixed(1)} s`),result.log?.trim()].filter(Boolean).join('\n\n'));setBusy(false);
    nativeWorker.postMessage({type:'speed',value:+$('#speed').value});nativeWorker.postMessage({type:'trace',value:traceWanted});
    inSigByIndex.forEach((sig,index)=>{const port=nativeInputPorts[index],v=buttonForPort(port.name,port.bits);if(sig)traceAdd(sig,0,v);nativeWorker.postMessage({type:'input',index,value:v})});
    nativeWorker.postMessage({type:'start'});drawVga();waveView.reset();return}
  catch(error){nativeError=error;nativeActive=false;setBusy(true)}
  try{const result=await runBoardInWorker(src,inputs,appendProgress);if(serial!==compileSerial)return;
    wasmResult=result;wasmOutputs=result.values;hasClockedDesign=result.hasClock;detectMode(result.ports);wave=parseVcd(result.vcd,result.ports);traceReset(result.ports);loadVcdTrace(result.vcd);
    for(const sig of trace.signals)if(sig.dir==='input'&&!sig.t.length)traceAdd(sig,0,buttonForPort(sig.name,sig.bits));
    if(mode==='vga')vgaPixels=renderPackedVga(result.frameData,result.frameCount,result.frameWidth,result.frameHeight,result.ports)||[renderVcdVga(result.vcd,result.ports)];
    if(!hasClockedDesign){try{sim=new VerilogSimulator.Simulator(src)}catch{sim=null}trace.playhead=null;trace.end=0}
    ticks=0;running=true;paused=false;setStatus('Running');$('#pauseBtn').classList.remove('is-paused');$('#pauseBtn').setAttribute('aria-label','Pause');$('#pauseBtn').title='Pause';setLog([summary(result.top||'go_board',result.ports,'compatibility simulation'),nativeError?.message].filter(Boolean).join('\n\n'));renderModel();drawVga();waveView.reset()}
  catch(error){if(serial!==compileSerial)return;running=false;setStatus('Error');setLog(`${nativeError?.message||''}\n${error.message}`.trim());showTab('log')}
  finally{if(serial===compileSerial)setBusy(false)}
}

// ---------------------------------------------------------------- board rendering
function drawVga(){document.body.classList.toggle('vga',mode==='vga');const c=$('#screen'),x=c.getContext('2d');if(mode!=='vga'){x.fillStyle='#000';x.fillRect(0,0,c.width,c.height);$('#vgaStatus').textContent='NO SIGNAL';$('#vgaMode').textContent='';return}const pixels=Array.isArray(vgaPixels)?vgaPixels[Math.floor(vgaPlayback)%vgaPixels.length]:vgaPixels;const synced=vgaInfo?vgaInfo.sync:!!pixels;if(pixels&&synced){x.drawImage(pixels,0,0,c.width,c.height)}else{x.fillStyle='#000';x.fillRect(0,0,c.width,c.height)}$('#vgaStatus').textContent=synced?'SYNC':'NO SIGNAL';$('#vgaMode').textContent=vgaInfo&&synced&&vgaInfo.lineCycles&&vgaInfo.frameLines?`${outputPortNames.some(n=>/hdmi|dvi|tmds/i.test(n))?'HDMI  ':''}${vgaInfo.lineCycles}×${vgaInfo.frameLines}  ${(CYCLES_PER_SEC/(vgaInfo.lineCycles*vgaInfo.frameLines)).toFixed(1)} Hz`:''}
const simTimeEl=$('#simTime');let lastSimText='';
function renderModel(){
  {const el=$('#rgb1');if(el){const c=rgbColor;if(c&&scrubCycle()==null||c){const g=(c>>16)&255,r=(c>>8)&255,b=c&255,m=Math.max(r,g,b,1),k=255/m;el.style.fill=`rgb(${Math.round(r*k)},${Math.round(g*k)},${Math.round(b*k)})`;el.classList.toggle('on',m>0)}else{el.style.fill='';el.classList.remove('on')}}}
  {const sc=scrubCycle();if(sc!=null)switches.forEach((b,i)=>{const sig=trace.signals.find(s=>s.dir==='input'&&switchIndex(s.name)===i);if(sig){const v=valueAt(sig,sc);if(v!=null)b.classList.toggle('pressed',(board&&board.switchActiveLow)?!Number(v):!!Number(v))}});else switches.forEach((b,i)=>b.classList.toggle('pressed',!!buttons[i]))}
  for(let i=0;i<ledEls.length;i++){const st=ledState(i),d=st.duty,v=st.on;if(ledEls[i].classList.contains('on')!==v)ledEls[i].classList.toggle('on',v);const op=v&&d!=null?String(Math.round((0.3+0.7*d)*100)/100):'';if(ledEls[i].style.opacity!==op)ledEls[i].style.opacity=op}
  if(sim){for(const sig of trace.signals)traceAdd(sig,Math.round(ticks),sig.dir==='input'?buttonForPort(sig.name,sig.bits):outputValue([sig.name]));trace.end=Math.round(ticks);waveView.requestDraw()}
  if(mode==='seven'){if(['S1_A','S2_A'].some(name=>Object.hasOwn(wasmOutputs,name))){setPhysicalDigit(1,'S1');setPhysicalDigit(2,'S2')}else{setDigit(1,outputValue(['o_Segment1','o_7_Segment1']));setDigit(2,outputValue(['o_Segment2','o_7_Segment2']))}}else{setDigit(1,null);setDigit(2,null)}
  const text=fmtTime(ticks);if(text!==lastSimText){lastSimText=text;simTimeEl.textContent=text}
}
function update(now){const dt=Math.min(50,now-last);last=now;const speed=+$('#speed').value;
  if(!nativeActive&&running&&!paused){
    if(hasClockedDesign&&wave.length){wavePlayback=(wavePlayback+dt*.045*speed)%wave.length;wasmOutputs={...wasmResult.values,...wave[Math.floor(wavePlayback)]};ticks=wasmResult.cycles*wavePlayback/Math.max(1,wave.length-1);trace.playhead=vcdEnd*wavePlayback/Math.max(1,wave.length-1);renderModel();waveView.requestDraw()}
    else if(sim){ticks+=CYCLES_PER_SEC*speed*dt/1000;renderModel()}
    if(mode==='vga'&&Array.isArray(vgaPixels)&&vgaPixels.length>1){const before=Math.floor(vgaPlayback);vgaPlayback=(vgaPlayback+dt*.06*speed)%vgaPixels.length;if(Math.floor(vgaPlayback)!==before){drawVga();$('#frame').textContent=String(Math.floor(vgaPlayback)+1).padStart(4,'0')}}}
  waveView.tick(running&&!paused,now);requestAnimationFrame(update)}

// ---------------------------------------------------------------- controls
$('#runBtn').onclick=compile;
function clearPause(){paused=false;waveView.cursor=null;$('#pauseBtn').classList.remove('is-paused');$('#pauseBtn').setAttribute('aria-label','Pause');$('#pauseBtn').title='Pause';if(running)setStatus('Running')}
$('#resetBtn').onclick=()=>{traceClear();waveView.reset();clearPause();rgbColor=null;ticks=0;frame=0;lastSimText='';$('#simTime').textContent='0.000 ns';if(nativeActive){nativeWorker.postMessage({type:'reset'});ticks=0;frame=0;inSigByIndex.forEach((sig,index)=>{const port=nativeInputPorts[index],v=buttonForPort(port.name,port.bits);if(sig)traceAdd(sig,0,v);nativeWorker.postMessage({type:'input',index,value:v})});return}sim=null;if(compiledSource&&!hasClockedDesign){try{sim=new VerilogSimulator.Simulator(compiledSource)}catch{sim=null}}ticks=0;wavePlayback=0;frame=0;wasmOutputs=wasmResult?{...wasmResult.values,...(wave[0]||{})}:{};if(wasmResult?.vcd)loadVcdTrace(wasmResult.vcd);drawVga();renderModel()};
$('#pauseBtn').onclick=()=>{if(!running)return;paused=!paused;if(nativeActive)nativeWorker.postMessage({type:'pause',value:paused});$('#pauseBtn').classList.toggle('is-paused',paused);$('#pauseBtn').setAttribute('aria-label',paused?'Resume':'Pause');$('#pauseBtn').title=paused?'Resume':'Pause';setStatus(paused?'Paused':'Running')};
$('#speed').onchange=()=>nativeWorker?.postMessage({type:'speed',value:+$('#speed').value});

function bindBoard(){ledEls=[1,2,3,4,5,6,7,8].map(i=>$(`#led${i}`)).filter(Boolean);segEls={1:$$('.digit[data-digit="1"] .seg'),2:$$('.digit[data-digit="2"] .seg')};switches=$$('.switch');
  switches.forEach((b,i)=>{b.classList.toggle('pressed',!!buttons[i]);b.classList.toggle('latched',!!latched[i]);let downAt=0,pendingRelease=0;const MIN_PULSE=60;
    const release=()=>{clearTimeout(pendingRelease);if(latched[i])return;const wait=MIN_PULSE-(performance.now()-downAt);if(wait>0)pendingRelease=setTimeout(()=>setButton(i,0),wait);else setButton(i,0)};
    b.onpointerdown=e=>{if(e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch{}clearTimeout(pendingRelease);downAt=performance.now();if(e.shiftKey){latched[i]=!latched[i];b.classList.toggle('latched',latched[i]);setButton(i,latched[i]);return}latched[i]=false;b.classList.remove('latched');setButton(i,1)};
    b.onpointerup=e=>{if(e.shiftKey)return;release()};b.onpointercancel=release;
    b.onkeydown=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat){downAt=performance.now();setButton(i,1)}}};b.onkeyup=e=>{if(e.code==='Space'||e.code==='Enter'){latched[i]=false;b.classList.remove('latched');release()}}})}
function setButton(i,value){buttons[i]=value?1:0;switches[i]?.classList.toggle('pressed',!!value);if(nativeActive){nativeInputPorts.forEach((p,index)=>{if(switchIndex(p.name)===i||isSwitchBus(p.name))nativeWorker.postMessage({type:'input',index,value:buttonForPort(p.name,p.bits)})})}if(sim){const n=i+(board?.switchBase??1),lv=level(buttons[i]);for(const nm of [`i_Switch_${n}`,`SW${n}`,`BUTTON${n}`,`BTN${n}`,`btn${n}`,`S${n}`,`KEY${n}`,`key${n}`]){try{sim.setInput(nm,lv)}catch{}}for(const nm of ['btn','sw','key']){try{sim.setInput(nm,buttonForPort(nm,buttons.length))}catch{}}renderModel()}}
document.addEventListener('keydown',e=>{if(e.repeat||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;const i='1234'.indexOf(e.key);if(i>=0)setButton(i,1)});
document.addEventListener('keyup',e=>{if(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;const i='1234'.indexOf(e.key);if(i>=0&&!latched[i])setButton(i,0)});

// ---------------------------------------------------------------- theme
const appearanceKey='vitepress-theme-appearance',appearanceBtn=$('#appearance');
function syncAppearance(){appearanceBtn.setAttribute('aria-checked',document.documentElement.classList.contains('dark'));waveView.requestDraw()}
appearanceBtn.onclick=()=>{const dark=!document.documentElement.classList.contains('dark');document.documentElement.classList.toggle('dark',dark);try{localStorage.setItem(appearanceKey,dark?'dark':'light')}catch{}syncAppearance()};
syncAppearance();

// ---------------------------------------------------------------- start
{let savedBoard='goboard';try{savedBoard=localStorage.getItem('fpga-board')||'goboard'}catch{}buildBoard(savedBoard);boardMenu.label()}
{let saved=null;try{saved=localStorage.getItem('goboard-code')}catch{}if(saved&&saved.trim()){code.value=saved;refreshEditor();renderModel();drawVga();waveView.reset()}else load('blink')}
requestAnimationFrame(update);
