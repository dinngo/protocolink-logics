import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as compoundv3 from 'src/logics/compound-v3';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('mainnet: Test CompoundV3 SupplyBase Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, compoundv3.mainnetTokens.USDC, '1000');
    await claimToken(chainId, user.address, compoundv3.mainnetTokens.WETH, '10');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      marketId: compoundv3.MarketId.USDC,
      input: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '1'),
      tokenOut: compoundv3.mainnetTokens.cUSDCv3,
    },
    {
      marketId: compoundv3.MarketId.USDC,
      input: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '1'),
      tokenOut: compoundv3.mainnetTokens.cUSDCv3,
      balanceBps: 5000,
    },
    {
      marketId: compoundv3.MarketId.ETH,
      input: new common.TokenAmount(compoundv3.mainnetTokens.ETH, '1'),
      tokenOut: compoundv3.mainnetTokens.cWETHv3,
    },
    {
      marketId: compoundv3.MarketId.ETH,
      input: new common.TokenAmount(compoundv3.mainnetTokens.ETH, '1'),
      tokenOut: compoundv3.mainnetTokens.cWETHv3,
      balanceBps: 5000,
    },
    {
      marketId: compoundv3.MarketId.ETH,
      input: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      tokenOut: compoundv3.mainnetTokens.cWETHv3,
    },
    {
      marketId: compoundv3.MarketId.ETH,
      input: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      tokenOut: compoundv3.mainnetTokens.cWETHv3,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ marketId, input, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get quotation
      const compoundV3SupplyBaseLogic = new compoundv3.SupplyBaseLogic(chainId, hre.ethers.provider);
      const { output } = await compoundV3SupplyBaseLogic.quote({ marketId, input, tokenOut });

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
      const routerLogics: core.IParam.LogicStruct[] = [];
      routerLogics.push(await compoundV3SupplyBaseLogic.build({ marketId, input, output, balanceBps }));

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
