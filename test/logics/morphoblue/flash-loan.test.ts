import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as morphoblue from 'src/logics/morphoblue';
import * as utility from 'src/logics/utility';
import * as utils from 'test/utils';

describe('mainnet-pb: Test Morphoblue FlashLoan Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();

    await claimToken(chainId, user.address, morphoblue.mainnetTokens.WETH, '1');
    await claimToken(chainId, user.address, morphoblue.mainnetTokens.wstETH, '1');
  });

  snapshotAndRevertEach();

  const testCases = [
    { loans: new common.TokenAmounts([morphoblue.mainnetTokens.WETH, '0.01']) },
    { repays: new common.TokenAmounts([morphoblue.mainnetTokens.WETH, '0.01']) },
    { loans: new common.TokenAmounts([morphoblue.mainnetTokens.wstETH, '0.01']) },
    { repays: new common.TokenAmounts([morphoblue.mainnetTokens.wstETH, '0.01']) },
  ];

  testCases.forEach((params, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get flash loan quotation
      const morphoblueFlashLoanLogic = new morphoblue.FlashLoanLogic(chainId);
      const { loans, repays } = await morphoblueFlashLoanLogic.quote(params);

      // 2. build funds and router logics for flash loan
      const funds = new common.TokenAmounts();
      const flashLoanRouterLogics: core.DataType.LogicStruct[] = [];
      const utilitySendTokenLogic = new utility.SendTokenLogic(chainId);
      for (let i = 0; i < repays.length; i++) {
        const loan = loans.at(i);
        const repay = repays.at(i);

        const fee = repay.clone().sub(loan);
        funds.add(fee);

        const callbackFee = await morphoblueFlashLoanLogic.calcCallbackFee(loan);
        funds.add(callbackFee);
        repay.add(callbackFee);

        flashLoanRouterLogics.push(
          await utilitySendTokenLogic.build({
            input: repay,
            recipient: morphoblue.getContractAddress(chainId, 'MorphoFlashLoanCallback'),
          })
        );
      }

      // 3. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      const callbackParams = core.newCallbackParams(flashLoanRouterLogics);
      routerLogics.push(await morphoblueFlashLoanLogic.build({ loans, params: callbackParams }));

      // 4. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, user, funds.erc20);

      // 5. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({ permit2Datas, routerLogics });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
    });
  });
});
