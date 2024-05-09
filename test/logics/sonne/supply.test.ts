import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as sonne from 'src/logics/sonne';
import * as utils from 'test/utils';

describe('optimism-pb: Test Sonne Supply Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
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
      input: new common.TokenAmount(sonne.optimismTokens.ETH, '1'),
      tokenOut: sonne.optimismTokens.WETH,
    },
    {
      input: new common.TokenAmount(sonne.optimismTokens.WETH, '1'),
      tokenOut: sonne.optimismTokens.WETH,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const sonneSupplyLogic = new sonne.SupplyLogic(chainId, hre.ethers.provider);
      const { output } = await sonneSupplyLogic.quote({ input, tokenOut: sonne.toCToken(chainId, tokenOut) });

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
      routerLogics.push(await sonneSupplyLogic.build({ input, output, balanceBps }));

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
