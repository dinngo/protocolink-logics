import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve, claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utility from 'src/logics/utility';

describe('mainnet-pb: Test Utility CustomData Logic', function () {
  let chainId: number;
  let routerKit: core.RouterKit;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user1, user2] = await hre.ethers.getSigners();
    routerKit = new core.RouterKit(chainId);
    await claimToken(chainId, user1.address, mainnetTokens.USDC, '1000');
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
    const agent = await routerKit.calcAgent(user1.address);
    await approve(user1, agent, input);

    // 3. build router logics
    const routerLogics: core.DataType.LogicStruct[] = [];
    const utilityCustomDataLogic = new utility.CustomDataLogic(chainId);
    routerLogics.push(await utilityCustomDataLogic.build({ to, data }));

    // 4. send router tx
    const transactionRequest = routerKit.buildExecuteTransactionRequest({ routerLogics });
    await expect(user1.sendTransaction(transactionRequest)).to.not.be.reverted;
    await expect(user1.address).to.changeBalance(input.token, -input.amount);
    await expect(user2.address).to.changeBalance(input.token, input.amount);
  });
});
