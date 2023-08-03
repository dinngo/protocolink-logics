import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as balancerv2 from 'src/logics/balancer-v2';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import hre from 'hardhat';
import * as utility from 'src/logics/utility';

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
      // 1. get flash loan quotation
      const balancerV2FlashLoanLogic = new balancerv2.FlashLoanLogic(chainId);
      const { loans, repays, fees } = await balancerV2FlashLoanLogic.quote({ outputs });

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
            recipient: balancerv2.getContractAddress(chainId, 'BalancerV2FlashLoanCallback'),
          })
        );
      }

      // 3. build router logics
      const routerLogics: core.IParam.LogicStruct[] = [];

      const params = core.newCallbackParams(flashLoanRouterLogics);
      routerLogics.push(await balancerV2FlashLoanLogic.build({ outputs: loans, params: params }));

      // 4. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
    });
  });
});
