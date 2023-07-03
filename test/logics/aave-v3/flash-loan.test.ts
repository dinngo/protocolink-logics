import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aavev3 from 'src/logics/aave-v3';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utility from 'src/logics/utility';
import * as utils from 'test/utils';

describe('Test AaveV3 FlashLoan Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;
  let flashLoanPremiumTotal: number;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WETH, '2');
    await claimToken(chainId, user.address, mainnetTokens.USDC, '2');
    await claimToken(chainId, user.address, mainnetTokens.USDT, '2');
    await claimToken(chainId, user.address, mainnetTokens.DAI, '2');

    const service = new aavev3.Service(chainId, hre.ethers.provider);
    flashLoanPremiumTotal = await service.getFlashLoanPremiumTotal();
  });

  snapshotAndRevertEach();

  const testCases = [
    { outputs: new common.TokenAmounts([aavev3.mainnetTokens.WETH, '1'], [aavev3.mainnetTokens.USDC, '1']) },
    { outputs: new common.TokenAmounts([aavev3.mainnetTokens.USDT, '1'], [aavev3.mainnetTokens.DAI, '1']) },
  ];

  testCases.forEach(({ outputs }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. build funds and router logics for flash loan by flash loan fee
      const funds = new common.TokenAmounts();
      const flashLoanRouterLogics: core.IParam.LogicStruct[] = [];
      const logicUtilitySendToken = new utility.SendTokenLogic(chainId);
      for (const output of outputs.toArray()) {
        const feeWei = common.calcFee(output.amountWei, flashLoanPremiumTotal);
        const fund = new common.TokenAmount(output.token).addWei(feeWei);
        funds.add(fund);
        flashLoanRouterLogics.push(
          await logicUtilitySendToken.build({
            input: output.clone().addWei(feeWei),
            recipient: aavev3.getContractAddress(chainId, 'AaveV3FlashLoanCallback'),
          })
        );
      }

      // 2. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);

      const params = core.newCallbackParams(flashLoanRouterLogics);
      const logicAaveV3FlashLoan = new aavev3.FlashLoanLogic(chainId);
      routerLogics.push(await logicAaveV3FlashLoan.build({ outputs, params }));

      // 3. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      for (const fund of funds.toArray()) {
        await expect(user.address).to.changeBalance(fund.token, -fund.amount);
      }
    });
  });
});
