import { BigNumberish, utils } from 'ethers';

export function encodeSupplyNativeTokenAction(comet: string, to: string, amount: BigNumberish) {
  return utils.defaultAbiCoder.encode(['address', 'address', 'uint'], [comet, to, amount]);
}

export function encodeWithdrawNativeTokenAction(comet: string, to: string, amount: BigNumberish) {
  return utils.defaultAbiCoder.encode(['address', 'address', 'uint'], [comet, to, amount]);
}
