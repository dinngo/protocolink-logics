import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as radiantv2 from 'src/logics/radiant-v2';
import * as utility from 'src/logics/utility';
import * as utils from 'test/utils';

describe('mainnet-pb: Test RadiantV2 FlashLoan Logic', () => {
  let chainId: number;
  let user: SignerWithAddress;

  before(async () => {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, common.mainnetTokens.WETH, '2');
    await claimToken(chainId, user.address, common.mainnetTokens.USDC, '2');
    await claimToken(chainId, user.address, common.mainnetTokens.USDT, '2');
    await claimToken(chainId, user.address, radiantv2.mainnetTokens.wstETH, '2');
  });

  snapshotAndRevertEach();

  const testCases = [
    { loans: new common.TokenAmounts([common.mainnetTokens.WETH, '1'], [common.mainnetTokens.USDC, '1']) },
    { repays: new common.TokenAmounts([common.mainnetTokens.WETH, '1'], [common.mainnetTokens.USDC, '1']) },
    { loans: new common.TokenAmounts([common.mainnetTokens.USDT, '1'], [radiantv2.mainnetTokens.wstETH, '1']) },
    { repays: new common.TokenAmounts([common.mainnetTokens.USDT, '1'], [radiantv2.mainnetTokens.wstETH, '1']) },
  ];

  testCases.forEach((params, i) => {
    it(`case ${i + 1}`, async () => {
      // 1. get flash loan quotation
      const radiantV2FlashLoanLogic = new radiantv2.FlashLoanLogic(chainId);
      const { loans, repays } = await radiantV2FlashLoanLogic.quote(params);

      // 2. build funds and router logics for flash loan by flash loan fee
      const funds = new common.TokenAmounts();
      const flashLoanRouterLogics: core.DataType.LogicStruct[] = [];
      const utilitySendTokenLogic = new utility.SendTokenLogic(chainId);
      for (let i = 0; i < repays.length; i++) {
        const loan = loans.at(i);
        const repay = repays.at(i);

        const fee = repay.clone().sub(loan);
        funds.add(fee);

        const callbackFee = await radiantV2FlashLoanLogic.calcCallbackFee(loan);

        funds.add(callbackFee);
        repay.add(callbackFee);

        flashLoanRouterLogics.push(
          await utilitySendTokenLogic.build({
            input: repay,
            recipient: radiantv2.getContractAddress(chainId, 'RadiantV2FlashLoanCallback'),
          })
        );
      }

      // 3. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      const callbackParams = core.newCallbackParams(flashLoanRouterLogics);
      routerLogics.push(await radiantV2FlashLoanLogic.build({ loans, params: callbackParams }));

      // 4. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, user, funds.erc20);

      // 5. send router tx
      const routerKit = new core.RouterKit(chainId);

      const transactionRequest = routerKit.buildExecuteTransactionRequest({ permit2Datas, routerLogics });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      for (const fund of funds.toArray()) {
        await expect(user.address).to.changeBalance(fund.token, -fund.amount);
      }
    });
  });
});
