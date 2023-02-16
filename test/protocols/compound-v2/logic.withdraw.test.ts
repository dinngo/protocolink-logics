import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test CompoundV2 Withdraw Logic', function () {
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
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '100'), user.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '100'), user.address);
  });

  after(async function () {
    await utils.network.reset();
  });

  const cases = [
    {
      input: new core.tokens.TokenAmount(protocols.compoundv2.tokens.cTokens.cETH, '50'),
      tokenOut: protocols.compoundv2.tokens.underlyingTokens.ETH,
    },
    {
      input: new core.tokens.TokenAmount(protocols.compoundv2.tokens.cTokens.cUSDC, '50'),
      tokenOut: protocols.compoundv2.tokens.underlyingTokens.USDC,
    },
    {
      input: new core.tokens.TokenAmount(protocols.compoundv2.tokens.cTokens.cETH, '50'),
      tokenOut: protocols.compoundv2.tokens.underlyingTokens.ETH,
      amountBps: 5000,
    },
    {
      input: new core.tokens.TokenAmount(protocols.compoundv2.tokens.cTokens.cUSDC, '50'),
      tokenOut: protocols.compoundv2.tokens.underlyingTokens.USDC,
      amountBps: 5000,
    },
  ];

  cases.forEach(({ input, tokenOut, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const compoundV2Withdraw = new protocols.compoundv2.CompoundV2WithdrawLogic({
        chainId,
        provider: hre.ethers.provider,
      });
      const output = await compoundV2Withdraw.getPrice({ input, tokenOut });

      // 2. supply
      const underlyingToken = output.token;
      const supplyAmount = new core.tokens.TokenAmount(underlyingToken, '3');
      await helpers.supply(user, supplyAmount);

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

      logics.push(await compoundV2Withdraw.getLogic({ input, output, amountBps }));

      // 5. send router tx
      await expect(router.connect(user).execute(logics, tokensReturn)).not.to.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(user.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});
