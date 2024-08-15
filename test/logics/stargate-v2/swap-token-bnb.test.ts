import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { getNativeToken } from '@protocolink/common';
import hre from 'hardhat';
import { polygonZkevmTokens } from 'src/logics/stargate-v2/tokens';
import * as stargate from 'src/logics/stargate-v2';
import * as utils from 'test/utils';

describe('bnb: Test StargateV2 SwapToken Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, common.bnbTokens.Cake, '10', '0x000000000000000000000000000000000000dead');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      params: {
        input: new common.TokenAmount(common.bnbTokens.Cake, '1'),
        tokenOut: polygonZkevmTokens.CAKE,
      },
    },
    {
      params: {
        input: new common.TokenAmount(common.bnbTokens.Cake, '1'),
        tokenOut: polygonZkevmTokens.CAKE,
      },
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ params, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get input or output
      const stargateSwapTokenLogic = new stargate.SwapTokenLogic(chainId);
      const quotation = await stargateSwapTokenLogic.quote({ receiver: user.address, ...params });
      const { input, fee } = quotation;

      // 2. build funds, tokensReturn
      const feeTokenAmount = new common.TokenAmount(getNativeToken(chainId), fee);
      const funds = new common.TokenAmounts([feeTokenAmount]);
      const tokensReturn = [input.token.elasticAddress];
      if (balanceBps) {
        funds.add(utils.calcRequiredAmountByBalanceBps(input, balanceBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 3. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await stargateSwapTokenLogic.build(quotation, { account: user.address }));

      // 4. get router permit2 datas
      let permit2Datas;
      if (!input.token.isNative) {
        permit2Datas = await utils.getRouterPermit2Datas(chainId, user, funds.erc20);
      }
      // 5. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({
        permit2Datas,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });

      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      if (input.token.isNative) {
        await expect(user.address).to.changeBalance(getNativeToken(chainId), -input.add(fee).amount, 1);
      } else {
        await expect(user.address).to.changeBalance(input.token, -input.amount);
        await expect(user.address).to.changeBalance(getNativeToken(chainId), -fee);
      }
    });
  });
});
