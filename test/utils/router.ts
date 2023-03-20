import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approves } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import hre from 'hardhat';
import * as protocols from 'src/protocols';

export function calcRequiredFundByAmountBps(input: common.TokenAmount, amountBps: number) {
  const requiredAmountWei = input.amountWei.mul(common.BPS_BASE).div(amountBps);
  const requiredFund = new common.TokenAmount(input.token).setWei(requiredAmountWei);
  return requiredFund;
}

export async function getPermitAndPullTokenRouterLogics(
  chainId: number,
  user: SignerWithAddress,
  erc20Funds: common.TokenAmounts
) {
  const routerLogics: core.IParam.LogicStruct[] = [];
  if (!erc20Funds.isEmpty) {
    const permit2Address = protocols.permit2.getContractAddress(chainId, 'Permit2');

    // 1. user approve permit2 to spend fund erc20 tokens
    await approves(user, permit2Address, erc20Funds);

    // 2. get permit2 permit token logic
    const permit2PermitTokenLogic = new protocols.permit2.PermitTokenLogic(chainId, hre.ethers.provider);
    const permitData = await permit2PermitTokenLogic.getPermitData(user.address, erc20Funds);
    if (permitData) {
      const permitSig = await user._signTypedData(permitData.domain, permitData.types, permitData.values);
      routerLogics.push(
        await permit2PermitTokenLogic.getLogic({ permit: permitData.values, sig: permitSig }, { account: user.address })
      );
    }

    // 3. get permit2 pull token logic
    const permit2PullTokenLogic = new protocols.permit2.PullTokenLogic(chainId, hre.ethers.provider);
    routerLogics.push(await permit2PullTokenLogic.getLogic({ inputs: erc20Funds }, { account: user.address }));
  }

  return routerLogics;
}
