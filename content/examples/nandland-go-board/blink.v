// This module becomes the top-level circuit named "blink".
module blink(
  input CLK,     // The Go Board's 25 MHz clock.
  output LED1    // The first LED on the board.
);
  // 24 flip-flops that hold a number. They begin at zero.
  reg [23:0] count = 0;

  // Run this hardware update on every rising clock edge.
  always @(posedge CLK)
    // Add one to the stored number.
    count <= count + 1'b1;

  // Bit 23 changes slowly enough for your eye to see the LED blink.
  assign LED1 = count[23];
endmodule
