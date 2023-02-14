import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as hrehelpers from '@nomicfoundation/hardhat-network-helpers';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test CompoundV2Repay Logic', function () {
  let chainId: number;
  let router: rt.contracts.Router;
  let erc20Spender: rt.contracts.SpenderERC20Approval;
  let user: SignerWithAddress;
  let snapshotId: string;
  const compoundV2Service = new protocols.compoundv2.CompoundV2Service({ provider: hre.ethers.provider });

  before(async function () {
    chainId = await utils.network.getChainId();
    [, user] = await hre.ethers.getSigners();
    router = await utils.deployer.deployRouter();
    erc20Spender = await utils.deployer.deploySpenderERC20Approval(router.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '100'), user.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '5000'), user.address);
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
      supply: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.ETH, '1'),
      borrow: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.USDC, '100'),
    },
    {
      supply: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.USDC, '3000'),
      borrow: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.ETH, '1'),
    },
    {
      supply: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.ETH, '1'),
      borrow: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.USDC, '100'),
      amountBps: 5000,
    },
    {
      supply: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.USDC, '3000'),
      borrow: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.ETH, '1'),
      amountBps: 5000,
    },
  ];

  cases.forEach(({ supply, borrow, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. supply, enterMarkets and borrow first
      await helpers.supply(user, supply);
      await helpers.enterMarkets(user, [supply.token]);
      await helpers.borrow(user, borrow);

      // 2. get borrow balance after 1000 blocks
      await hrehelpers.mine(1000);
      const borrowBalance = await compoundV2Service.getBorrowBalance(user.address, borrow.token);
      expect(borrowBalance.amountWei).to.gt(0);

      // 3. build input, funds, tokensReturn
      const input = borrowBalance.clone().setWei(borrowBalance.amountWei);
      const funds = new core.tokens.TokenAmounts();
      if (amountBps) {
        funds.add(utils.router.calcRequiredFundByAmountBps(input, amountBps));
      } else {
        funds.add(input);
      }
      const tokensReturn = [input.token.elasticAddress];

      // 4. build router logics
      const logics: rt.IRouter.LogicStruct[] = [];

      const erc20Funds = funds.erc20;
      if (!erc20Funds.isEmpty()) {
        await utils.web3.approves(user, erc20Spender.address, erc20Funds);
        const routerDeposit = new protocols.router.RouterDepositLogic({
          chainId,
          spenderAddress: erc20Spender.address,
        });
        logics.push(await routerDeposit.getLogic({ funds: erc20Funds }));
      }

      const compoundV2Repay = new protocols.compoundv2.CompoundV2RepayLogic({ chainId });
      logics.push(await compoundV2Repay.getLogic({ input, amountBps, borrower: user.address }));

      // 5. send router tx
      const value = funds.native?.amountWei ?? 0;
      await expect(router.connect(user).execute(logics, tokensReturn, { value })).not.to.be.reverted;
    });
  });
});
