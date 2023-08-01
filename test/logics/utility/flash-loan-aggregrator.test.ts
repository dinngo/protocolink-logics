import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aavev3 from 'src/logics/aave-v3';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utility from 'src/logics/utility';
import * as utils from 'test/utils';

describe('Test Utility FlashLoanAggregator Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, aavev3.mainnetTokens['1INCH'], '2');
    await claimToken(chainId, user.address, mainnetTokens.USDC, '2');
  });

  snapshotAndRevertEach();

  const testCases = [
    // balancer-v2
    { outputs: new common.TokenAmounts([mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']) },
    { outputs: new common.TokenAmounts([mainnetTokens.USDT, '1'], [mainnetTokens.DAI, '1']) },
    // aave-v3
    { outputs: new common.TokenAmounts([aavev3.mainnetTokens['1INCH'], '1'], [aavev3.mainnetTokens.USDC, '1']) },
  ];

  testCases.forEach(({ outputs }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get flash loan quotation
      const utilityFlashLoanAggregatorLogic = new utility.FlashLoanAggregatorLogic(chainId);
      const { protocolId, loans, repays, fees, callback } = await utilityFlashLoanAggregatorLogic.quote({ outputs });

      // 2. build funds and router logics for flash loan
      const funds = new common.TokenAmounts();
      const flashLoanRouterLogics: core.IParam.LogicStruct[] = [];
      const utilitySendTokenLogic = new utility.SendTokenLogic(chainId);
      for (let i = 0; i < fees.length; i++) {
        const fee = fees.at(i).clone();
        if (!fee.isZero) {
          funds.add(fee);
        }
        flashLoanRouterLogics.push(
          await utilitySendTokenLogic.build({
            input: repays.at(i),
            recipient: callback,
          })
        );
      }

      // 3. build router logics
      let routerLogics: core.IParam.LogicStruct[] = [];
      const erc20Funds = funds.erc20;
      if (erc20Funds.length > 0) {
        routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);
      }

      const params = core.newCallbackParams(flashLoanRouterLogics);
      routerLogics.push(await utilityFlashLoanAggregatorLogic.build({ protocolId, outputs: loans, params }));

      // 4. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
    });
  });
});
