import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test AaveV2Repay Logic', function () {
  let chainId: number;
  let router: rt.contracts.Router;
  let erc20Spender: rt.contracts.SpenderERC20Approval;
  let users: SignerWithAddress[];
  let aaveV2Service: protocols.aavev2.AaveV2Service;

  before(async function () {
    chainId = await utils.network.getChainId();
    const [, user1, user2, user3] = await hre.ethers.getSigners();
    users = [user1, user2, user3];
    router = await utils.deployer.deployRouter();
    erc20Spender = await utils.deployer.deploySpenderERC20Approval(router.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '10000'), user1.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '100'), user1.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '100'), user2.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '100'), user2.address);
    aaveV2Service = new protocols.aavev2.AaveV2Service({ chainId, provider: hre.ethers.provider });
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
  ];

  cases.forEach(({ userIndex, deposit, borrow, interestRateMode }, i) => {
    it(`case ${i + 1}`, async function () {
      const user = users[userIndex];

      // 1. deposit and borrow first
      await helpers.deposit(chainId, user, deposit);
      await helpers.borrow(chainId, user, borrow, interestRateMode);

      // 2. check current debt is zero
      let currentDebt = await aaveV2Service.getUserCurrentDebt(user.address, borrow.token, interestRateMode);
      expect(currentDebt.amountWei).to.gt(0);

      // 3. repay by router
      const input = new core.tokens.TokenAmount(borrow.token).setWei(
        core.utils.calcSlippage(currentDebt.amountWei, -100) // slightly higher than the current borrowed amount
      );
      const funds = new core.tokens.TokenAmounts(input);
      const balances = new core.tokens.TokenAmounts(input); // maybe have dust

      const logics: rt.IRouter.LogicStruct[] = [];

      const erc20Funds = funds.erc20;
      await utils.web3.approves(user, erc20Spender.address, erc20Funds);
      const routerRepay = new protocols.router.RouterDepositLogic({
        chainId,
        spenderAddress: erc20Spender.address,
      });
      logics.push(await routerRepay.getLogic({ funds: erc20Funds }));

      const aaveV2Repay = new protocols.aavev2.AaveV2RepayLogic({ chainId });
      logics.push(await aaveV2Repay.getLogic({ input, account: user.address, interestRateMode }));

      const tokensReturn = rt.utils.toTokensReturn(balances);

      await expect(router.connect(user).execute(logics, tokensReturn)).not.to.be.reverted;

      currentDebt = await aaveV2Service.getUserCurrentDebt(user.address, borrow.token, interestRateMode);
      await expect(currentDebt.amountWei).to.eq(0);
    });
  });

  after(async function () {
    await utils.network.reset();
  });
});
