import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test AaveV2 Repay Logic', function () {
  let chainId: number;
  let router: rt.contracts.Router;
  let erc20Spender: protocols.router.contracts.SpenderPermit2ERC20;
  let users: SignerWithAddress[];
  let snapshotId: string;

  before(async function () {
    chainId = await utils.network.getChainId();
    const [, user1, user2, user3] = await hre.ethers.getSigners();
    users = [user1, user2, user3];
    router = await utils.deployer.deployRouter();
    erc20Spender = await utils.deployer.deploySpenderPermit2ERC20(
      router.address,
      protocols.router.config.getContractAddress(chainId, 'Permit2')
    );
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '20000'), user1.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '100'), user1.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '100'), user2.address);
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
      borrow: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      deposit: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '5000'),
      borrow: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.stable,
    },
    {
      userIndex: 1,
      deposit: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
      borrow: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.variable,
    },
    {
      userIndex: 1,
      deposit: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
      borrow: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.stable,
    },
    {
      userIndex: 0,
      deposit: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '5000'),
      borrow: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.variable,
      amountBps: 5000,
    },
    {
      userIndex: 0,
      deposit: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '5000'),
      borrow: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.stable,
      amountBps: 5000,
    },
    {
      userIndex: 1,
      deposit: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
      borrow: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.variable,
      amountBps: 5000,
    },
    {
      userIndex: 1,
      deposit: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
      borrow: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.stable,
      amountBps: 5000,
    },
  ];

  cases.forEach(({ userIndex, deposit, borrow, interestRateMode, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. deposit and borrow first
      const user = users[userIndex];
      await helpers.deposit(chainId, user, deposit);
      await helpers.borrow(chainId, user, borrow, interestRateMode);

      // 2. get user debt
      const aaveV2Repay = new protocols.aavev2.AaveV2RepayLogic({ chainId, provider: hre.ethers.provider });
      let debt = await aaveV2Repay.getDebt(user.address, borrow.token, interestRateMode);

      // 3. build funds and tokensReturn
      const input = debt;
      const funds = new core.tokens.TokenAmounts();
      if (amountBps) {
        funds.add(utils.router.calcRequiredFundByAmountBps(input, amountBps));
      } else {
        funds.add(input);
      }
      const tokensReturn = [input.token.elasticAddress];

      // 4. build router logics
      const erc20Funds = funds.erc20;
      const logics = await utils.router.getPermitAndPullTokenLogics(
        chainId,
        user,
        erc20Funds,
        router.address,
        erc20Spender.address
      );

      logics.push(await aaveV2Repay.getLogic({ input, account: user.address, interestRateMode, amountBps }));

      // 5. send router tx
      await expect(router.connect(user).execute(logics, tokensReturn)).not.to.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount, 100);

      // 6. check user's debt should be zero
      debt = await aaveV2Repay.getDebt(user.address, borrow.token, interestRateMode);
      expect(debt.amountWei).to.eq(0);
    });
  });
});
