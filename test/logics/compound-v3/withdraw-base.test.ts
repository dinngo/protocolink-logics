import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as compoundv3 from 'src/logics/compound-v3';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('mainnet: Test CompoundV3 WithdrawBase Logic', function () {
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
      input: new common.TokenAmount(compoundv3.mainnetTokens.cUSDCv3, '1'),
      tokenOut: compoundv3.mainnetTokens.USDC,
      balanceBps: 10000,
    },
    {
      marketId: compoundv3.MarketId.ETH,
      input: new common.TokenAmount(compoundv3.mainnetTokens.cWETHv3, '1'),
      tokenOut: compoundv3.mainnetTokens.ETH,
      balanceBps: 10000,
    },
    {
      marketId: compoundv3.MarketId.ETH,
      input: new common.TokenAmount(compoundv3.mainnetTokens.cWETHv3, '1'),
      tokenOut: compoundv3.mainnetTokens.WETH,
      balanceBps: 10000,
    },
  ];

  testCases.forEach(({ marketId, input, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. supply first
      const supply = new common.TokenAmount(tokenOut.wrapped, '3');
      await helpers.supply(chainId, user, marketId, supply);
      await expect(user.address).to.changeBalance(supply.token, supply.amount, 1);

      // 2. get quotation
      const compoundV3WithdrawBaseLogic = new compoundv3.WithdrawBaseLogic(chainId, hre.ethers.provider);
      const { output } = await compoundV3WithdrawBaseLogic.quote({ marketId, input, tokenOut });

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
      routerLogics.push(await compoundV3WithdrawBaseLogic.build({ marketId, input, output, balanceBps }));

      // 5. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, user, funds.erc20);

      // 6. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({
        permit2Datas,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount, 1);
      await expect(user.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});
