// LED1 blinks using the Go Board's 25 MHz oscillator.
module blink(
  input CLK,
  output LED1
);
  reg [23:0] count = 0;

  always @(posedge CLK)
    count <= count + 1'b1;

  assign LED1 = count[23];
endmodule
