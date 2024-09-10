import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as iolend from 'src/logics/iolend';
import * as utils from 'test/utils';

describe('iota-pb: Test Iolend Deposit Logic', () => {
  let chainId: number;
  let user: SignerWithAddress;

  before(async () => {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(
      chainId,
      user.address,
      common.iotaTokens.wIOTA,
      '100',
      '0x260817581206317e2665080a2e66854e922269d0'
    );
    await claimToken(
      chainId,
      user.address,
      common.iotaTokens.USDT,
      '100',
      '0x7fA6e7C26Fac91541306B0240f930599F6e1D041'
    );
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      input: new common.TokenAmount(common.iotaTokens.IOTA, '1'),
      tokenOut: iolend.iotaTokens.iWIOTA,
    },
    {
      input: new common.TokenAmount(common.iotaTokens.wIOTA, '1'),
      tokenOut: iolend.iotaTokens.iWIOTA,
    },
    {
      input: new common.TokenAmount(common.iotaTokens.USDT, '1'),
      tokenOut: iolend.iotaTokens.iUSDT,
    },
    {
      input: new common.TokenAmount(common.iotaTokens.IOTA, '1'),
      tokenOut: iolend.iotaTokens.iWIOTA,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(common.iotaTokens.wIOTA, '1'),
      tokenOut: iolend.iotaTokens.iWIOTA,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(common.iotaTokens.USDT, '1'),
      tokenOut: iolend.iotaTokens.iUSDT,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async () => {
      // 1. get output
      const iolendDepositLogic = new iolend.DepositLogic(chainId);
      const { output } = await iolendDepositLogic.quote({ input, tokenOut });

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
      routerLogics.push(await iolendDepositLogic.build({ input, output, balanceBps }, { account: user.address }));

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
