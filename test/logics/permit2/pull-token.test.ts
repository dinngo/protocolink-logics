import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as permit2 from 'src/logics/permit2';
import * as utils from 'test/utils';

describe('mainnet: Test Permit2 PullToken Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;
  let routerKit: core.RouterKit;
  let agent: string;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    routerKit = new core.RouterKit(chainId);
    agent = await routerKit.calcAgent(user.address);

    await claimToken(chainId, user.address, mainnetTokens.USDC, '100');
    await claimToken(chainId, user.address, mainnetTokens.WETH, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      fields: { input: new common.TokenAmount(mainnetTokens.USDC, '1') },
    },
    {
      fields: { input: new common.TokenAmount(mainnetTokens.WETH, '1') },
    },
  ];

  testCases.forEach(({ fields }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. build tokensReturn
      const input = fields.input;
      const permit2PullTokenLogic = new permit2.PullTokenLogic(chainId);
      const tokensReturn: string[] = [];
      const funds = new common.TokenAmounts(fields.input);

      // 2. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await permit2PullTokenLogic.build(fields, { account: user.address }));

      // 3. get router permit2 datas
      const permit2Datas = await utils.approvePermit2AndGetPermit2Datas(chainId, user, funds.erc20);

      // 4. send router tx
      const transactionRequest = routerKit.buildExecuteTransactionRequest({
        permit2Datas,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });

      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(agent).to.changeBalance(input.token, input.amount);
    });
  });
});
