import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test AaveV2Withdraw Logic', function () {
  let chainId: number;
  let router: rt.contracts.Router;
  let erc20Spender: rt.contracts.SpenderERC20Approval;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await utils.network.getChainId();
    [, user] = await hre.ethers.getSigners();
    router = await utils.deployer.deployRouter();
    erc20Spender = await utils.deployer.deploySpenderERC20Approval(router.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '100'), user.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '100'), user.address);
  });

  const cases = [
    {
      input: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.aWETH, '1'),
      output: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
    },
    {
      input: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.aUSDC, '1'),
      output: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '1'),
    },
    {
      input: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.aWETH, '1'),
      output: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
      amountBps: 5000,
    },
    {
      input: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.aUSDC, '1'),
      output: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '1'),
      amountBps: 5000,
    },
  ];

  cases.forEach(({ input, output, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      const tokensReturn = [output.token.elasticAddress];
      let funds: core.tokens.TokenAmounts;
      if (amountBps) {
        funds = new core.tokens.TokenAmounts(
          new core.tokens.TokenAmount(input.token).setWei(input.amountWei.mul(rt.constants.BPS_BASE).div(amountBps))
        );
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds = new core.tokens.TokenAmounts(input);
      }

      // 1. deposit first
      await helpers.deposit(chainId, user, new core.tokens.TokenAmount(output.token, funds.at(0).amount));

      // 2. withdraw by router
      const logics: rt.IRouter.LogicStruct[] = [];

      const erc20Funds = funds.erc20;
      await utils.web3.approves(user, erc20Spender.address, erc20Funds);
      const routerDeposit = new protocols.router.RouterDepositLogic({
        chainId,
        spenderAddress: erc20Spender.address,
      });
      logics.push(await routerDeposit.getLogic({ funds: erc20Funds }));

      const aaveV2Withdraw = new protocols.aavev2.AaveV2WithdrawLogic({ chainId });
      logics.push(await aaveV2Withdraw.getLogic({ input, output, amountBps, routerAddress: router.address }));

      await expect(router.connect(user).execute(logics, tokensReturn)).not.to.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount, 3);
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });

  after(async function () {
    await utils.network.reset();
  });
});
