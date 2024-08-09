import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aavev2 from 'src/logics/aave-v2';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('mainnet-pb: Test AaveV2 Deposit Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, common.mainnetTokens.USDC, '100');
    await claimToken(chainId, user.address, common.mainnetTokens.WETH, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.ETH, '1'),
      tokenOut: aavev2.mainnetTokens.aWETH,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      tokenOut: aavev2.mainnetTokens.aWETH,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.USDC, '1'),
      tokenOut: aavev2.mainnetTokens.aUSDC,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.ETH, '1'),
      tokenOut: aavev2.mainnetTokens.aWETH,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      tokenOut: aavev2.mainnetTokens.aWETH,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.USDC, '1'),
      tokenOut: aavev2.mainnetTokens.aUSDC,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const aaveV2DepositLogic = new aavev2.DepositLogic(chainId);
      const { output } = await aaveV2DepositLogic.quote({ input, tokenOut });

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
      routerLogics.push(await aaveV2DepositLogic.build({ input, output, balanceBps }, { account: user.address }));

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
