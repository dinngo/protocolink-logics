import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as compoundv2 from 'src/logics/compound-v2';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('mainnet-pb: Test CompoundV2 Withdraw Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WBTC, '10', '0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      input: new common.TokenAmount(compoundv2.toCToken(mainnetTokens.ETH), '50'),
      tokenOut: mainnetTokens.ETH,
    },
    {
      input: new common.TokenAmount(compoundv2.toCToken(mainnetTokens.WBTC), '50'),
      tokenOut: mainnetTokens.WBTC,
    },
    {
      input: new common.TokenAmount(compoundv2.toCToken(mainnetTokens.ETH), '50'),
      tokenOut: mainnetTokens.ETH,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(compoundv2.toCToken(mainnetTokens.WBTC), '50'),
      tokenOut: mainnetTokens.WBTC,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const compoundV2WithdrawLogic = new compoundv2.WithdrawLogic(chainId, hre.ethers.provider);
      const { output } = await compoundV2WithdrawLogic.quote({ input, tokenOut });

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
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await compoundV2WithdrawLogic.build({ input, output, balanceBps }));

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
