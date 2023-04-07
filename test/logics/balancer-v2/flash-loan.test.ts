import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as balancerv2 from 'src/balancer-v2';
import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';
import { expect } from 'chai';
import { getChainId, mainnetTokens, snapshotAndRevertEach } from '@furucombo/composable-router-test-helpers';
import hre from 'hardhat';
import * as utility from 'src/utility';

describe('Test BalancerV2 FlashLoan Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
  });

  snapshotAndRevertEach();

  const testCases = [
    { outputs: new common.TokenAmounts([mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']) },
    { outputs: new common.TokenAmounts([mainnetTokens.USDT, '1'], [mainnetTokens.DAI, '1']) },
  ];

  testCases.forEach(({ outputs }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. build funds and router logics for flash loan
      const flashLoanRouterLogics: core.IParam.LogicStruct[] = [];
      const logicUtilitySendToken = new utility.SendTokenLogic(chainId);
      for (const output of outputs.toArray()) {
        flashLoanRouterLogics.push(
          await logicUtilitySendToken.build({
            input: output,
            recipient: balancerv2.getContractAddress(chainId, 'FlashLoanCallbackBalancerV2'),
          })
        );
      }

      // 2. build router logics
      const routerLogics: core.IParam.LogicStruct[] = [];

      const userData = core.Agent__factory.createInterface().encodeFunctionData('execute', [
        flashLoanRouterLogics,
        [],
        true,
      ]);
      const logicBalancerV2FlashLoan = new balancerv2.FlashLoanLogic(chainId);
      routerLogics.push(await logicBalancerV2FlashLoan.build({ outputs, params: userData }));

      // 3. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
    });
  });
});
