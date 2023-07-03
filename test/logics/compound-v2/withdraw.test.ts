import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as compoundv2 from 'src/logics/compound-v2';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('Test CompoundV2 Withdraw Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WBTC, '10');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      input: new common.TokenAmount(compoundv2.cTokens.cETH, '50'),
      tokenOut: compoundv2.underlyingTokens.ETH,
    },
    {
      input: new common.TokenAmount(compoundv2.cTokens.cWBTC, '50'),
      tokenOut: compoundv2.underlyingTokens.WBTC,
    },
    {
      input: new common.TokenAmount(compoundv2.cTokens.cETH, '50'),
      tokenOut: compoundv2.underlyingTokens.ETH,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(compoundv2.cTokens.cWBTC, '50'),
      tokenOut: compoundv2.underlyingTokens.WBTC,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const logicCompoundV2Withdraw = new compoundv2.WithdrawLogic(chainId, hre.ethers.provider);
      const { output } = await logicCompoundV2Withdraw.quote({ input, tokenOut });

      // 2. supply
      const underlyingToken = output.token;
      const supplyAmount = new common.TokenAmount(underlyingToken, '3');
      await helpers.supply(user, supplyAmount);

      // 3. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new common.TokenAmounts();
      if (balanceBps) {
        funds.add(utils.calcRequiredAmountByBalanceBps(input, balanceBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 4. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);
      routerLogics.push(await logicCompoundV2Withdraw.build({ input, output, balanceBps }));

      // 5. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(user.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});
