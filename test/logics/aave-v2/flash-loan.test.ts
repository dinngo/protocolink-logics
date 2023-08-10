import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aavev2 from 'src/logics/aave-v2';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utility from 'src/logics/utility';
import * as utils from 'test/utils';

describe('Test AaveV2 FlashLoan Logic', function () {
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
        const fee = repays.at(i).clone().sub(loans.at(i));
        funds.add(fee);
        flashLoanRouterLogics.push(
          await utilitySendTokenLogic.build({
            input: repays.at(i),
            recipient: aavev2.getContractAddress(chainId, 'AaveV2FlashLoanCallback'),
          })
        );
      }

      // 3. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);

      const callbackParams = core.newCallbackParams(flashLoanRouterLogics);
      routerLogics.push(await aaveV2FlashLoanLogic.build({ loans, params: callbackParams }));

      // 4. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      for (const fund of funds.toArray()) {
        await expect(user.address).to.changeBalance(fund.token, -fund.amount);
      }
    });
  });
});
