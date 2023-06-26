import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve, claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import { axios } from 'src/utils/http';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utility from 'src/logics/utility';
import * as utils from 'test/utils';

describe('Test Utility CustomData Logic', function () {
  let chainId: number;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user1, user2] = await hre.ethers.getSigners();
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

  it('case 2: 1inch v5 swap token USDC to DAI', async function () {
    // 1. get quotation from 1inch api
    const tokenIn = mainnetTokens.USDC;
    const tokenOut = mainnetTokens.DAI;
    const input = new common.TokenAmount(tokenIn, '100');

    const { data } = await axios.get(`https://api.1inch.io/v5.0/${chainId}/swap`, {
      params: {
        fromTokenAddress: tokenIn.address,
        toTokenAddress: tokenOut.address,
        amount: input.amountWei.toString(),
        fromAddress: user1.address,
        slippage: 1,
        disableEstimate: true,
      },
    });
    const output = new common.TokenAmount(tokenOut).setWei(data.toTokenAmount);

    // 2. build funds, tokensReturn
    const funds = new common.TokenAmounts(input);
    const tokensReturn = [output.token.elasticAddress];

    // 3. build router logics
    const erc20Funds = funds.erc20;
    const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user1, erc20Funds);

    const logicUtilityCustomData = new utility.CustomDataLogic(chainId);
    routerLogics.push(
      await logicUtilityCustomData.build({
        inputs: new common.TokenAmounts(input),
        outputs: new common.TokenAmounts(output),
        to: data.tx.to,
        data: data.tx.data,
      })
    );

    // 4. send router tx
    const transactionRequest = core.newRouterExecuteTransactionRequest({
      chainId,
      routerLogics,
      tokensReturn,
    });
    await expect(user1.sendTransaction(transactionRequest)).to.not.be.reverted;
    await expect(user1.address).to.changeBalance(input.token, -input.amount);
    await expect(user1.address).to.changeBalance(output.token, output.amount, 100);
  });
});
