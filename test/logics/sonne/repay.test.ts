import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as hrehelpers from '@nomicfoundation/hardhat-network-helpers';
import * as sonne from 'src/logics/sonne';
import * as utils from 'test/utils';

describe('optimism: Test Sonne Repay Logic', function () {
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
      '100',
      '0x86Bb63148d17d445Ed5398ef26Aa05Bf76dD5b59'
    );
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      supply: new common.TokenAmount(sonne.optimismTokens.WETH, '100'),
      borrow: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
    },
    {
      supply: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      borrow: new common.TokenAmount(sonne.optimismTokens.ETH, '1'),
    },
    {
      supply: new common.TokenAmount(sonne.optimismTokens.WETH, '100'),
      borrow: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      balanceBps: 5000,
    },
    {
      supply: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      borrow: new common.TokenAmount(sonne.optimismTokens.ETH, '1'),
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ supply, borrow, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. supply, enterMarkets and borrow first
      await helpers.supply(chainId, user, supply);
      await helpers.enterMarkets(chainId, user, [supply.token]);
      await helpers.borrow(chainId, user, borrow);

      // 2. get borrow balance after 1000 blocks
      await hrehelpers.mine(1000);
      const sonneRepayLogic = new sonne.RepayLogic(chainId, hre.ethers.provider);
      const { input } = await sonneRepayLogic.quote({ borrower: user.address, tokenIn: borrow.token });
      expect(input.amountWei).to.be.gt(borrow.amountWei);

      // 3. build input, funds, tokensReturn
      const funds = new common.TokenAmounts();
      if (balanceBps) {
        funds.add(utils.calcRequiredAmountByBalanceBps(input, balanceBps));
      } else {
        funds.add(input);
      }
      const tokensReturn = [input.token.elasticAddress];

      // 4. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await sonneRepayLogic.build({ input, balanceBps, borrower: user.address }));

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
    });
  });
});
