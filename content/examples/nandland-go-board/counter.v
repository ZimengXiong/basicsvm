// Four LEDs count 0 through 15, advancing every quarter second.
module counter(
  input CLK,
  output LED1,
  output LED2,
  output LED3,
  output LED4
);
  localparam [22:0] QUART_SECOND = 23'd6_250_000;
  reg [22:0] ticks = 0;
  reg [3:0] value = 0;

  always @(posedge CLK) begin
    if (ticks == QUART_SECOND - 1'b1) begin
      ticks <= 0;
      value <= value + 1'b1;
    end else begin
      ticks <= ticks + 1'b1;
    end
  end

  assign {LED4, LED3, LED2, LED1} = value;
endmodule
