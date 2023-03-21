import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as utils from 'test/utils';

describe('Test CompoundV3 Supply Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.USDC, '1000');
  });

  const testCases = [
    {
      marketId: 'USDC',
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '1'),
      tokenOut: protocols.compoundv3.mainnetTokens.cUSDCv3,
    },
    {
      marketId: 'USDC',
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '1'),
      tokenOut: protocols.compoundv3.mainnetTokens.cUSDCv3,
      amountBps: 5000,
    },
    {
      marketId: 'ETH',
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
      tokenOut: protocols.compoundv3.mainnetTokens.cWETHv3,
    },
    {
      marketId: 'ETH',
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
      tokenOut: protocols.compoundv3.mainnetTokens.cWETHv3,
      amountBps: 5000,
    },
  ];

  testCases.forEach(({ marketId, input, tokenOut, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const compoundV3Supply = new protocols.compoundv3.SupplyBaseLogic(chainId, hre.ethers.provider);
      const { output } = await compoundV3Supply.quote({ marketId, input, tokenOut });

      // 2. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new common.TokenAmounts();
      if (amountBps) {
        funds.add(utils.calcRequiredFundByAmountBps(input, amountBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 3. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);
      routerLogics.push(
        await compoundV3Supply.getLogic({ marketId, input, output, amountBps }, { account: user.address })
      );

      // 4. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});
