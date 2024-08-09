import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as radiantv2 from 'src/logics/radiant-v2';
import * as utils from 'test/utils';

describe('mainnet-pb: Test RadiantV2 Deposit Logic', () => {
  let chainId: number;
  let user: SignerWithAddress;

  before(async () => {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, common.mainnetTokens.USDC, '100');
    await claimToken(chainId, user.address, common.mainnetTokens.WETH, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      input: new common.TokenAmount(common.mainnetTokens.ETH, '1'),
      tokenOut: radiantv2.mainnetTokens.rWETH,
    },
    {
      input: new common.TokenAmount(common.mainnetTokens.WETH, '1'),
      tokenOut: radiantv2.mainnetTokens.rWETH,
    },
    {
      input: new common.TokenAmount(common.mainnetTokens.USDC, '1'),
      tokenOut: radiantv2.mainnetTokens.rUSDC,
    },
    {
      input: new common.TokenAmount(common.mainnetTokens.ETH, '1'),
      tokenOut: radiantv2.mainnetTokens.rWETH,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(common.mainnetTokens.WETH, '1'),
      tokenOut: radiantv2.mainnetTokens.rWETH,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(common.mainnetTokens.USDC, '1'),
      tokenOut: radiantv2.mainnetTokens.rUSDC,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async () => {
      // 1. get output
      const radiantV2DepositLogic = new radiantv2.DepositLogic(chainId);
      const { output } = await radiantV2DepositLogic.quote({ input, tokenOut });

      // 2. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new common.TokenAmounts();
      if (balanceBps) {
        funds.add(utils.calcRequiredAmountByBalanceBps(input, balanceBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 3. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await radiantV2DepositLogic.build({ input, output, balanceBps }, { account: user.address }));

      // 4. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, user, funds.erc20);

      // 5. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({
        permit2Datas,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(user.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});
