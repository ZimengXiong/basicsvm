module user_project (
    input wire clk,
    input wire rst,
    output reg [7:0] out
);
    always @(posedge clk) begin
        if (rst) begin
            out <= 8'h00;
        end else begin
            out <= out + 1'b1;
        end
    end
endmodule

