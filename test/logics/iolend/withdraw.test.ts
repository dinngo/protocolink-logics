import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as iolend from 'src/logics/iolend';
import * as utils from 'test/utils';

describe('iota-pb: Test iolend Withdraw Logic', () => {
  let chainId: number;
  let user: SignerWithAddress;

  before(async () => {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(
      chainId,
      user.address,
      common.iotaTokens.USDT,
      '5000',
      '0x7fA6e7C26Fac91541306B0240f930599F6e1D041'
    );
    await claimToken(
      chainId,
      user.address,
      common.iotaTokens.wIOTA,
      '1000',
      '0x03bde2983e2a8d6306411a4532e2f91cfb04051b'
    );
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      input: new common.TokenAmount(iolend.iotaTokens.iWIOTA, '100'),
      tokenOut: common.iotaTokens.wIOTA,
    },
    {
      input: new common.TokenAmount(iolend.iotaTokens.iWIOTA, '100'),
      tokenOut: common.iotaTokens.IOTA,
    },
    {
      input: new common.TokenAmount(iolend.iotaTokens.iUSDT, '1'),
      tokenOut: common.iotaTokens.USDT,
    },
    {
      input: new common.TokenAmount(iolend.iotaTokens.iWIOTA, '100'),
      tokenOut: common.iotaTokens.wIOTA,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(iolend.iotaTokens.iWIOTA, '100'),
      tokenOut: common.iotaTokens.IOTA,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(iolend.iotaTokens.iUSDT, '1'),
      tokenOut: common.iotaTokens.USDT,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async () => {
      // 1. deposit first
      const assetsAmount = new common.TokenAmount(tokenOut, input.clone().add(input.amount).amount);
      await helpers.deposit(chainId, user, assetsAmount);

      // 2. get output
      const iolendWithdrawLogic = new iolend.WithdrawLogic(chainId);
      const { output } = await iolendWithdrawLogic.quote({ input, tokenOut });

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
      routerLogics.push(await iolendWithdrawLogic.build({ input, output, balanceBps }, { account: user.address }));

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
