// This module becomes the top-level circuit named "counter".
module counter(
  input CLK,     // The Go Board's 25 MHz clock.
  output LED1,   // The lowest bit of the displayed number.
  output LED2,
  output LED3,
  output LED4    // The highest bit of the displayed number.
);
  // 6,250,000 clock ticks are one quarter of a second at 25 MHz.
  localparam [22:0] QUART_SECOND = 23'd6_250_000;
  // This counts fast clock ticks until a quarter second has passed.
  reg [22:0] ticks = 0;
  // This is the four-bit number shown on the LEDs.
  reg [3:0] value = 0;

  // Update the registers on every rising edge of the clock.
  always @(posedge CLK) begin
    // Has this quarter-second wait finished?
    if (ticks == QUART_SECOND - 1'b1) begin
      // Start timing the next quarter second.
      ticks <= 0;
      // Move to the next four-bit number.
      value <= value + 1'b1;
    end else begin
      // Keep waiting for the quarter second to finish.
      ticks <= ticks + 1'b1;
    end
  end

  // Send value bits 0 through 3 to LED1 through LED4.
  assign {LED4, LED3, LED2, LED1} = value;
endmodule
