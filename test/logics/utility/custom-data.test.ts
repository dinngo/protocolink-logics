import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  claimToken,
  getChainId,
  mainnetTokens,
  snapshotAndRevertEach,
} from '@furucombo/composable-router-test-helpers';
import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utility from 'src/utility';
import { approve } from '@furucombo/composable-router-test-helpers';

describe('Test Utility CustomData Logic', function () {
  let chainId: number;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user1, user2] = await hre.ethers.getSigners();
    await claimToken(chainId, user1.address, mainnetTokens.USDC, '100');
  });

  snapshotAndRevertEach();

  it('case 1: erc20 transferFrom', async function () {
    // 1. new transferFrom to, data
    const input = new common.TokenAmount(mainnetTokens.USDC, '1');
    const to = mainnetTokens.USDC.address;
    const data = common.ERC20__factory.createInterface().encodeFunctionData('transferFrom', [
      user1.address,
      user2.address,
      input.amountWei,
    ]);

    // 2. approve agent to spent user1 USDC
    await approve(user1, core.calcAccountAgent(chainId, user1.address), input);

    // 3. build router logics
    const routerLogics: core.IParam.LogicStruct[] = [];
    const logicUtilityCustomData = new utility.CustomDataLogic(chainId);
    routerLogics.push(await logicUtilityCustomData.build({ to, data }));

    // 4. send router tx
    const transactionRequest = core.newRouterExecuteTransactionRequest({
      chainId,
      routerLogics,
    });
    await expect(user1.sendTransaction(transactionRequest)).to.not.be.reverted;
    await expect(user1.address).to.changeBalance(input.token, -input.amount);
    await expect(user2.address).to.changeBalance(input.token, input.amount);
  });
});
