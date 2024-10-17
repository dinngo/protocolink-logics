import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as radiantv2 from 'src/logics/radiant-v2';
import * as utils from 'test/utils';

describe.skip('mainnet-pb: Test RadiantV2 Withdraw Logic', () => {
  let chainId: number;
  let user: SignerWithAddress;

  before(async () => {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WETH, '100');
    await claimToken(chainId, user.address, mainnetTokens.USDC, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      input: new common.TokenAmount(radiantv2.mainnetTokens.rWETH, '1'),
      tokenOut: mainnetTokens.ETH,
    },
    {
      input: new common.TokenAmount(radiantv2.mainnetTokens.rWETH, '1'),
      tokenOut: mainnetTokens.WETH,
    },
    {
      input: new common.TokenAmount(radiantv2.mainnetTokens.rUSDC, '1'),
      tokenOut: mainnetTokens.USDC,
    },
    {
      input: new common.TokenAmount(radiantv2.mainnetTokens.rWETH, '1'),
      tokenOut: mainnetTokens.ETH,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(radiantv2.mainnetTokens.rWETH, '1'),
      tokenOut: mainnetTokens.WETH,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(radiantv2.mainnetTokens.rUSDC, '1'),
      tokenOut: mainnetTokens.USDC,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async () => {
      // 1. deposit first
      const assetsAmount = new common.TokenAmount(tokenOut, '3');
      await helpers.deposit(chainId, user, assetsAmount);

      // 2. get output
      const radiantV2WithdrawLogic = new radiantv2.WithdrawLogic(chainId);
      const { output } = await radiantV2WithdrawLogic.quote({ input, tokenOut });

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
      routerLogics.push(await radiantV2WithdrawLogic.build({ input, output, balanceBps }, { account: user.address }));

      // 5. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, user, funds.erc20);

      // 6. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({ permit2Datas, routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount, 1);
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});
