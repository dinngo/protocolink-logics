import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
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

    const aaveV3Service = new protocols.aavev3.Service(chainId, hre.ethers.provider);
    flashLoanPremiumTotal = await aaveV3Service.getFlashLoanPremiumTotal();
  });

  const testCases = [
    {
      outputs: new common.TokenAmounts(
        [protocols.aavev3.mainnetTokens.WETH, '1'],
        [protocols.aavev3.mainnetTokens.USDC, '1']
      ),
    },
    {
      outputs: new common.TokenAmounts(
        [protocols.aavev3.mainnetTokens.USDT, '1'],
        [protocols.aavev3.mainnetTokens.DAI, '1']
      ),
    },
  ];

  testCases.forEach(({ outputs }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. build funds and router logics for flash loan by flash loan fee
      const funds = new common.TokenAmounts();
      const flashLoanRouterLogics: core.IParam.LogicStruct[] = [];
      const utilitySendTokenLogic = new protocols.utility.SendTokenLogic(chainId);
      for (const output of outputs.toArray()) {
        const feeWei = common.calcFee(output.amountWei, flashLoanPremiumTotal);
        const fund = new common.TokenAmount(output.token).addWei(feeWei);
        funds.add(fund);
        flashLoanRouterLogics.push(
          await utilitySendTokenLogic.getLogic({
            input: output.clone().addWei(feeWei),
            recipient: protocols.aavev3.getContractAddress(chainId, 'FlashLoanCallbackAaveV3'),
          })
        );
      }

      // 2. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);

      const params = core.Router__factory.createInterface().encodeFunctionData('execute', [flashLoanRouterLogics, []]);
      const aaveV3FlashLoan = new protocols.aavev3.FlashLoanLogic(chainId);
      routerLogics.push(await aaveV3FlashLoan.getLogic({ outputs, params }));

      // 3. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      for (const fund of funds.toArray()) {
        await expect(user.address).to.changeBalance(fund.token, -fund.amount);
      }
    });
  });
});
