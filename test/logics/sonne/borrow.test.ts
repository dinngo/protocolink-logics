import { JsonRpcSigner } from '@ethersproject/providers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as hardhatHelpers from '@nomicfoundation/hardhat-network-helpers';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as smartAccounts from '@protocolink/smart-accounts';
import * as sonne from 'src/logics/sonne';

describe('optimism: Test Sonne Borrow Logic', function () {
  let chainId: number;
  let wallet: JsonRpcSigner;
  let walletAddress: string;

  before(async function () {
    chainId = await getChainId();
    walletAddress = '0x789977c2fE815344Ecb89eca0789Bc9D84D72D09';

    await hardhatHelpers.impersonateAccount(walletAddress);
    wallet = hre.ethers.provider.getSigner(walletAddress);

    await claimToken(
      chainId,
      walletAddress,
      sonne.optimismTokens.WBTC,
      '10',
      '0x078f358208685046a11C85e8ad32895DED33A249'
    );
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      supply: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      output: new common.TokenAmount(sonne.optimismTokens.ETH, '1'),
      smartAccountId: smartAccounts.SmartAccountId.PORTUS,
    },
    {
      supply: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      output: new common.TokenAmount(sonne.optimismTokens.USDC, '1'),
      smartAccountId: smartAccounts.SmartAccountId.PORTUS,
    },
  ];

  testCases.forEach(({ supply, output, smartAccountId }, i) => {
    it(`case ${i + 1}`, async function () {
      const user = wallet;
      const userAddress = walletAddress;
      const tokenIn = supply.token;

      // 1. supply and enterMarkets first
      await helpers.supply(chainId, user, supply);
      await helpers.enterMarkets(chainId, user, [supply.token]);

      // 2. get output
      const sonneBorrowLogic = new sonne.BorrowLogic(chainId, hre.ethers.provider);

      // 3. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];

      // 4. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await sonneBorrowLogic.build({ tokenIn, output, smartAccountId }, { account: userAddress }));

      // 5. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({
        routerLogics,
        tokensReturn,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(userAddress).to.changeBalance(output.token, output.amount, 1);
    });
  });
});
