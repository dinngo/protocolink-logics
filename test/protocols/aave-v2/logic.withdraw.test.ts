import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test AaveV2 Withdraw Logic', function () {
  let chainId: number;
  let router: rt.contracts.Router;
  let erc20Spender: protocols.router.contracts.SpenderPermit2ERC20;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await utils.network.getChainId();
    [, user] = await hre.ethers.getSigners();
    router = await utils.deployer.deployRouter();
    erc20Spender = await utils.deployer.deploySpenderPermit2ERC20(
      router.address,
      protocols.router.config.getContractAddress(chainId, 'Permit2')
    );
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '100'), user.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '100'), user.address);
  });

  after(async function () {
    await utils.network.reset();
  });

  const cases = [
    {
      input: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.aWETH, '1'),
      tokenOut: protocols.aavev2.tokens.mainnet.WETH,
    },
    {
      input: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.aUSDC, '1'),
      tokenOut: protocols.aavev2.tokens.mainnet.USDC,
    },
    {
      input: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.aWETH, '1'),
      tokenOut: protocols.aavev2.tokens.mainnet.WETH,
      amountBps: 5000,
    },
    {
      input: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.aUSDC, '1'),
      tokenOut: protocols.aavev2.tokens.mainnet.USDC,
      amountBps: 5000,
    },
  ];

  cases.forEach(({ input, tokenOut, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. deposit first
      const assetsAmount = new core.tokens.TokenAmount(tokenOut, '3');
      await helpers.deposit(chainId, user, assetsAmount);

      // 2. get output
      const aaveV2Withdraw = new protocols.aavev2.AaveV2WithdrawLogic({ chainId });
      const output = await aaveV2Withdraw.getPrice({ input, tokenOut });

      // 3. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new core.tokens.TokenAmounts();
      if (amountBps) {
        funds.add(utils.router.calcRequiredFundByAmountBps(input, amountBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 4. build router logics
      const erc20Funds = funds.erc20;
      const logics = await utils.router.getPermitAndPullTokenLogics(
        chainId,
        user,
        erc20Funds,
        router.address,
        erc20Spender.address
      );

      logics.push(await aaveV2Withdraw.getLogic({ input, output, amountBps, routerAddress: router.address }));

      // 5. send router tx
      await expect(router.connect(user).execute(logics, tokensReturn)).not.to.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount, 1);
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});
