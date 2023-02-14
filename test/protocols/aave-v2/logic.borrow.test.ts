import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test AaveV2Borrow Logic', function () {
  let chainId: number;
  let router: rt.contracts.Router;
  let spenderAaveV2Delegation: rt.contracts.SpenderAaveV2Delegation;
  let users: SignerWithAddress[];
  let snapshotId: string;

  before(async function () {
    chainId = await utils.network.getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    router = await utils.deployer.deployRouter();

    const aaveV2Service = new protocols.aavev2.AaveV2Service({ chainId, provider: hre.ethers.provider });
    const aaveV2AddressesProvider = await aaveV2Service.protocolDataProvider.ADDRESSES_PROVIDER();
    spenderAaveV2Delegation = await utils.deployer.deploySpenderAaveV2Delegation(
      router.address,
      aaveV2AddressesProvider
    );

    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '10000'), user1.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '100'), user2.address);
  });

  after(async function () {
    await utils.network.reset();
  });

  beforeEach(async function () {
    snapshotId = await utils.network.takeSnapshot();
  });

  afterEach(async function () {
    await utils.network.restoreSnapshot(snapshotId);
  });

  const cases = [
    {
      userIndex: 0,
      deposit: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '5000'),
      output: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      deposit: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '5000'),
      output: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.stable,
    },
    {
      userIndex: 1,
      deposit: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
      output: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.variable,
    },
    {
      userIndex: 1,
      deposit: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
      output: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.stable,
    },
  ];

  cases.forEach(({ userIndex, deposit, output, interestRateMode }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. deposit and approve delegation
      const user = users[userIndex];
      await helpers.deposit(chainId, user, deposit);
      await helpers.approveDelegation(chainId, user, spenderAaveV2Delegation.address, output, interestRateMode);

      // 2. build tokensReturn
      const tokensReturn = [output.token.address];

      // 3. build router logics
      const logics: rt.IRouter.LogicStruct[] = [];

      const aaveV2Borrow = new protocols.aavev2.AaveV2BorrowLogic({
        chainId,
        delegateeAddress: spenderAaveV2Delegation.address,
      });
      logics.push(await aaveV2Borrow.getLogic({ output, interestRateMode }));

      // 4. send router tx
      await expect(router.connect(user).execute(logics, tokensReturn)).not.to.be.reverted;
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});
