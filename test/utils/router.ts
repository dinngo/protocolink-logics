import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approves } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import hre from 'hardhat';

export function calcRequiredAmountByBalanceBps(input: common.TokenAmount, balanceBps?: number) {
  let required: common.TokenAmount;
  if (balanceBps) {
    const requiredAmountWei = input.amountWei.mul(common.BPS_BASE).div(balanceBps);
    required = new common.TokenAmount(input.token).setWei(requiredAmountWei);
  } else {
    required = input.clone();
  }

  return required;
}

export async function getRouterPermit2Datas(chainId: number, user: SignerWithAddress, inputs: common.TokenAmounts) {
  const permit2Datas: string[] = [];
  if (!inputs.isEmpty) {
    const router = new core.RouterKit(chainId, hre.ethers.provider);
    const permit2Address = await router.getPermit2Address();

    // 1. user approve permit2 to spend fund erc20 tokens
    await approves(user, permit2Address, inputs);

    // 2. get permit2 permit call data
    const permitData = await router.getPermit2PermitData(user.address, inputs);
    if (permitData) {
      const permitSig = await user._signTypedData(permitData.domain, permitData.types, permitData.values);
      const permitCallData = router.encodePermit2Permit(user.address, permitData.values, permitSig);
      permit2Datas.push(permitCallData);
    }

    // 3. get permit2 transferFrom data
    const transferFromCallData = await router.encodePermit2TransferFrom(user.address, inputs);
    permit2Datas.push(transferFromCallData);
  }

  return permit2Datas;
}
