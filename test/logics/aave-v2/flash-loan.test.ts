import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aavev2 from 'src/logics/aave-v2';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utility from 'src/logics/utility';
import * as utils from 'test/utils';

describe('mainnet: Test AaveV2 FlashLoan Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WETH, '2');
    await claimToken(chainId, user.address, mainnetTokens.USDC, '2');
    await claimToken(chainId, user.address, mainnetTokens.USDT, '2');
    await claimToken(chainId, user.address, mainnetTokens.DAI, '2');
  });

  snapshotAndRevertEach();

  const testCases = [
    { loans: new common.TokenAmounts([aavev2.mainnetTokens.WETH, '1'], [aavev2.mainnetTokens.USDC, '1']) },
    { repays: new common.TokenAmounts([aavev2.mainnetTokens.WETH, '1'], [aavev2.mainnetTokens.USDC, '1']) },
    { loans: new common.TokenAmounts([aavev2.mainnetTokens.USDT, '1'], [aavev2.mainnetTokens.DAI, '1']) },
    { repays: new common.TokenAmounts([aavev2.mainnetTokens.USDT, '1'], [aavev2.mainnetTokens.DAI, '1']) },
  ];

  testCases.forEach((params, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get flash loan quotation
      const aaveV2FlashLoanLogic = new aavev2.FlashLoanLogic(chainId);
      const { loans, repays } = await aaveV2FlashLoanLogic.quote(params);

      // 2. build funds and router logics for flash loan by flash loan fee
      const funds = new common.TokenAmounts();
      const flashLoanRouterLogics: core.IParam.LogicStruct[] = [];
      const utilitySendTokenLogic = new utility.SendTokenLogic(chainId);
      for (let i = 0; i < repays.length; i++) {
        const loan = loans.at(i);
        const repay = repays.at(i);

        const fee = repay.clone().sub(loan);
        funds.add(fee);

        const callbackFee = await aaveV2FlashLoanLogic.calcCallbackFee(loan);
        funds.add(callbackFee);
        repay.add(callbackFee);

        flashLoanRouterLogics.push(
          await utilitySendTokenLogic.build({
            input: repay,
            recipient: aavev2.getContractAddress(chainId, 'AaveV2FlashLoanCallback'),
          })
        );
      }

      // 3. build router logics
      const routerLogics: core.IParam.LogicStruct[] = [];
      const callbackParams = core.newCallbackParams(flashLoanRouterLogics);
      routerLogics.push(await aaveV2FlashLoanLogic.build({ loans, params: callbackParams }));

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
