import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approves } from './web3';
import * as core from 'src/core';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';

export function calcRequiredFundByAmountBps(input: core.tokens.TokenAmount, amountBps: number) {
  const requiredAmountWei = input.amountWei.mul(rt.constants.BPS_BASE).div(amountBps);
  const requiredFund = new core.tokens.TokenAmount(input.token).setWei(requiredAmountWei);
  return requiredFund;
}

export async function getPermitAndPullTokenLogics(
  chainId: number,
  user: SignerWithAddress,
  erc20Funds: core.tokens.TokenAmounts,
  routerAddress: string,
  erc20SpenderAddress: string
) {
  const logics: rt.IRouter.LogicStruct[] = [];
  if (!erc20Funds.isEmpty()) {
    // 1. user approve permit2 to spend fund erc20 tokens
    const permit2Address = protocols.router.config.getContractAddress(chainId, 'Permit2');
    await approves(user, permit2Address, erc20Funds);

    // 2. get permit token logic
    const routerPermitTokenLogic = new protocols.router.RouterPermitTokenLogic({
      chainId,
      provider: hre.ethers.provider,
    });
    const permitDetails = await routerPermitTokenLogic.getPermitDetails(user.address, erc20Funds, erc20SpenderAddress);
    const permit = routerPermitTokenLogic.getPermit(permitDetails, erc20SpenderAddress);
    const permitData = routerPermitTokenLogic.getPermitData(permit);
    const permitSig = await user._signTypedData(permitData.domain, permitData.types, permitData.values);
    logics.push(await routerPermitTokenLogic.getLogic({ account: user.address, permit, sig: permitSig }));

    // 3. get pull token logic
    const routerPullTokenLogic = new protocols.router.RouterPullTokenLogic({
      chainId,
      spenderAddress: erc20SpenderAddress,
    });
    logics.push(await routerPullTokenLogic.getLogic({ account: user.address, routerAddress, erc20Funds }));
  }

  return logics;
}
