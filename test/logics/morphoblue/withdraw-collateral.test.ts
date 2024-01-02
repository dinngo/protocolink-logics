import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as morphoblue from 'src/logics/morphoblue';
import * as utils from 'test/utils';

describe('goerli: Test Morphoblue Withdraw Collateral Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();

    await claimToken(
      chainId,
      user.address,
      morphoblue.goerliTokens.DAI,
      '1000',
      '0x112EC3b862AB061609Ef01D308109a6691Ee6a2d'
    );
    await claimToken(
      chainId,
      user.address,
      morphoblue.goerliTokens.WETH,
      '10',
      '0x88124Ef4A9EC47e691F254F2E8e348fd1e341e9B'
    );
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      marketId: '0x3098a46de09dd8d9a8c6fa1ab7b3f943b6f13e5ea72a4e475d9e48f222bfd5a0',
      output: new common.TokenAmount(morphoblue.goerliTokens.DAI, '100'),
    },
    {
      marketId: '0x98ee9f294c961a5dbb9073c0fd2c2a6a66468f911e49baa935c0eab364499dbd',
      output: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
    },
    {
      marketId: '0x98ee9f294c961a5dbb9073c0fd2c2a6a66468f911e49baa935c0eab364499dbd',
      output: new common.TokenAmount(morphoblue.goerliTokens.ETH, '1'),
    },
  ];

  testCases.forEach(({ marketId, output }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. supply first
      const supply = new common.TokenAmount(output.token.wrapped, output.amount);
      await helpers.supplyCollateral(chainId, user, marketId, supply);

      // 2. authorize userAgent to manage user positions
      await helpers.authorize(chainId, user);

      // 3. get quotation
      const morphoblueWithdrawCollateralLogic = new morphoblue.WithdrawCollateralLogic(chainId, hre.ethers.provider);

      // 4. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new common.TokenAmounts();

      // 5. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await morphoblueWithdrawCollateralLogic.build({ marketId, output }, { account: user.address }));

      // 6. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, user, funds.erc20);

      // 7. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({
        permit2Datas,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });

      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});
