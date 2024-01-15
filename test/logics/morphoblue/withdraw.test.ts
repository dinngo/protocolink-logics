import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as morphoblue from 'src/logics/morphoblue';

describe('mainnet-pb: Test Morphoblue Withdraw Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();

    await claimToken(chainId, user.address, morphoblue.mainnetTokens.WETH, '10');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
      output: new common.TokenAmount(morphoblue.mainnetTokens.WETH, '1'),
    },
    {
      marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
      output: new common.TokenAmount(morphoblue.mainnetTokens.ETH, '1'),
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
