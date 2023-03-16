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
    const permit2Address = protocols.router.getContractAddress(chainId, 'Permit2');
    const erc20SpenderAddress = protocols.router.getContractAddress(chainId, 'SpenderPermit2ERC20');

    // 1. user approve permit2 to spend fund erc20 tokens
    await approves(user, permit2Address, erc20Funds);

    // 2. get permit token logic
    const routerPermitTokenLogic = new protocols.router.PermitTokenLogic(chainId, hre.ethers.provider);
    const permitDetails = await routerPermitTokenLogic.getPermitDetails(user.address, erc20Funds, erc20SpenderAddress);
    const permit = routerPermitTokenLogic.getPermit(permitDetails, erc20SpenderAddress);
    const permitData = routerPermitTokenLogic.getPermitData(permit);
    const permitSig = await user._signTypedData(permitData.domain, permitData.types, permitData.values);
    routerLogics.push(await routerPermitTokenLogic.getLogic({ permit, sig: permitSig }, { account: user.address }));

    // 3. get pull token logic
    const routerPullTokenLogic = new protocols.router.PullTokenLogic(chainId, hre.ethers.provider);
    routerLogics.push(await routerPullTokenLogic.getLogic({ inputs: erc20Funds }, { account: user.address }));
  }

  return routerLogics;
}
