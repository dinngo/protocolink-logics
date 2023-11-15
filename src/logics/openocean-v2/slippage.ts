export function slippageToOpenOcean(slippage: number) {
  return Math.min(Math.max(slippage / 100, 0.05), 50);
}

export function slippageToProtocolink(slippage: number) {
  return slippage * 100;
}
