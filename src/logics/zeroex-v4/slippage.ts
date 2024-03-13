export function slippageToZeroEx(slippage: number): number {
  return slippage / 10000;
}

// zeroex rerturns expected slippage in the following format: "-0.00003836285924298198283753149243586624"
// we round it with ceil to integer and minimize its converted value in 50 bps for compatibility
export function slippageToProtocolink(slippage: string | null): number {
  return Math.max(Math.ceil(Math.abs(Number(slippage || 0)) * 10000), 50);
}
