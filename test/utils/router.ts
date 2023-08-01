import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approves } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import hre from 'hardhat';
import * as permit2 from 'src/logics/permit2';

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

export async function getPermitAndPullTokenRouterLogics(
  chainId: number,
  user: SignerWithAddress,
  erc20Funds: common.TokenAmounts
) {
  const routerLogics: core.IParam.LogicStruct[] = [];
  if (!erc20Funds.isEmpty) {
    const permit2Address = permit2.getContractAddress(chainId, 'Permit2');

    // 1. user approve permit2 to spend fund erc20 tokens
    await approves(user, permit2Address, erc20Funds);

    // 2. get permit2 permit token logic
    const permit2PermitTokenLogic = new permit2.PermitTokenLogic(chainId, hre.ethers.provider);
    const permitData = await permit2PermitTokenLogic.getPermitData(user.address, erc20Funds);
    if (permitData) {
      const permitSig = await user._signTypedData(permitData.domain, permitData.types, permitData.values);
      routerLogics.push(
        await permit2PermitTokenLogic.build({ permit: permitData.values, sig: permitSig }, { account: user.address })
      );
    }

    // 3. get permit2 pull token logic
    const permit2PullTokenLogic = new permit2.PullTokenLogic(chainId, hre.ethers.provider);
    routerLogics.push(await permit2PullTokenLogic.build({ inputs: erc20Funds }, { account: user.address }));
  }

  return routerLogics;
}
