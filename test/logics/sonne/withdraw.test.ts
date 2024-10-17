import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as sonne from 'src/logics/sonne';
import * as utils from 'test/utils';

describe.skip('optimism-pb: Test Sonne Withdraw Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(
      chainId,
      user.address,
      sonne.optimismTokens.WBTC,
      '10',
      '0x078f358208685046a11C85e8ad32895DED33A249'
    );
    await claimToken(
      chainId,
      user.address,
      sonne.optimismTokens.WETH,
      '10',
      '0x86Bb63148d17d445Ed5398ef26Aa05Bf76dD5b59'
    );
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      tokenIn: new common.TokenAmount(sonne.optimismTokens.WETH, '1'),
      tokenOut: sonne.optimismTokens.ETH,
    },
    {
      tokenIn: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      tokenOut: sonne.optimismTokens.WBTC,
    },
    {
      tokenIn: new common.TokenAmount(sonne.optimismTokens.WETH, '1'),
      tokenOut: sonne.optimismTokens.ETH,
      balanceBps: 5000,
    },
    {
      tokenIn: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      tokenOut: sonne.optimismTokens.WBTC,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ tokenIn, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      const input = new common.TokenAmount(sonne.toCToken(chainId, tokenIn.token), tokenIn.amount);

      // 1. get output
      const sonneWithdrawLogic = new sonne.WithdrawLogic(chainId, hre.ethers.provider);
      const { output } = await sonneWithdrawLogic.quote({
        input,
        tokenOut,
      });

      // 2. supply
      const underlyingToken = output.token.wrapped;
      const supplyAmount = new common.TokenAmount(underlyingToken, '3');
      await helpers.supply(chainId, user, supplyAmount);

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
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await sonneWithdrawLogic.build({ input, output, balanceBps }));

      // 5. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, user, funds.erc20);

      // 6. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({ permit2Datas, routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(user.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});
