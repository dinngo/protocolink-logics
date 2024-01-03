import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as morphoblue from 'src/logics/morphoblue';

describe('goerli: Test Morphoblue Withdraw Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();

    await claimToken(
      chainId,
      user.address,
      morphoblue.goerliTokens.WETH,
      '10',
      '0x88124Ef4A9EC47e691F254F2E8e348fd1e341e9B'
    );
    await claimToken(
      chainId,
      user.address,
      morphoblue.goerliTokens.USDC,
      '1000',
      '0x64c7044050Ba0431252df24fEd4d9635a275CB41'
    );
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      marketId: '0x3098a46de09dd8d9a8c6fa1ab7b3f943b6f13e5ea72a4e475d9e48f222bfd5a0',
      output: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
    },
    {
      marketId: '0x3098a46de09dd8d9a8c6fa1ab7b3f943b6f13e5ea72a4e475d9e48f222bfd5a0',
      output: new common.TokenAmount(morphoblue.goerliTokens.ETH, '1'),
    },
    {
      marketId: '0x98ee9f294c961a5dbb9073c0fd2c2a6a66468f911e49baa935c0eab364499dbd',
      output: new common.TokenAmount(morphoblue.goerliTokens.USDC, '1000'),
    },
  ];

  testCases.forEach(({ marketId, output }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. supply first
      const supply = new common.TokenAmount(output.token.wrapped, output.amount);
      await helpers.supply(chainId, user, marketId, supply);

      // 2. authorize userAgent to manage user positions
      await helpers.authorize(chainId, user);

      // 3. build tokensReturn
      const tokensReturn = [output.token.elasticAddress];

      // 4. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      const morphoblueWithdrawLogic = new morphoblue.WithdrawLogic(chainId, hre.ethers.provider);
      routerLogics.push(await morphoblueWithdrawLogic.build({ marketId, output }, { account: user.address }));

      // 5. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({
        routerLogics,
        tokensReturn,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});
