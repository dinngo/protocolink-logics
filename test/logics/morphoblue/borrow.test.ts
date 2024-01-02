import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as morphoblue from 'src/logics/morphoblue';
import * as utils from 'test/utils';

describe('goerli: Test Morphoblue Borrow Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;
  let service: morphoblue.Service;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    service = new morphoblue.Service(chainId, hre.ethers.provider);

    await claimToken(
      chainId,
      user.address,
      morphoblue.goerliTokens.USDC,
      '5000',
      '0x64c7044050Ba0431252df24fEd4d9635a275CB41'
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
      marketId: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
      output: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.USDC, '3000'),
    },
    {
      marketId: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
      output: new common.TokenAmount(morphoblue.goerliTokens.ETH, '1'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.USDC, '3000'),
    },
    {
      marketId: '0x98ee9f294c961a5dbb9073c0fd2c2a6a66468f911e49baa935c0eab364499dbd',
      output: new common.TokenAmount(morphoblue.goerliTokens.USDC, '1000'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
    },
  ];

  testCases.forEach(({ marketId, output, collateral }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. supply collateral first
      const supply = new common.TokenAmount(collateral.token, collateral.amount);
      await helpers.supplyCollateral(chainId, user, marketId, supply);

      // 2. authorize userAgent to manage user positions
      await helpers.authorize(chainId, user);

      // 3. get quotation
      const morphoblueBorrowLogic = new morphoblue.BorrowLogic(chainId, hre.ethers.provider);

      // 4. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new common.TokenAmounts();

      // 5. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await morphoblueBorrowLogic.build({ marketId, output }, { account: user.address }));

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
      const borrowBalance = await service.getBorrowBalance(marketId, user.address);
      expect(borrowBalance.amountWei).to.eq(output.amountWei);
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});
