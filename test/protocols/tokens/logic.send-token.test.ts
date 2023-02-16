import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test Tokens SendToken Logic', function () {
  let chainId: number;
  let router: rt.contracts.Router;
  let erc20Spender: protocols.router.contracts.SpenderPermit2ERC20;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  before(async function () {
    chainId = await utils.network.getChainId();
    [, user1, user2] = await hre.ethers.getSigners();
    router = await utils.deployer.deployRouter();
    erc20Spender = await utils.deployer.deploySpenderPermit2ERC20(
      router.address,
      protocols.router.config.getContractAddress(chainId, 'Permit2')
    );
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '100'), user1.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '100'), user1.address);
  });

  after(async function () {
    await utils.network.reset();
  });

  const cases = [
    { input: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1') },
    { input: new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '1') },
    { input: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1'), amountBps: 5000 },
    { input: new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '1'), amountBps: 5000 },
  ];

  cases.forEach(({ input, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. build funds, tokensReturn
      const tokensReturn = [];
      const funds = new core.tokens.TokenAmounts();
      if (amountBps) {
        funds.add(utils.router.calcRequiredFundByAmountBps(input, amountBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 2. build router logics
      const erc20Funds = funds.erc20;
      const logics = await utils.router.getPermitAndPullTokenLogics(
        chainId,
        user1,
        erc20Funds,
        router.address,
        erc20Spender.address
      );

      const sendToken = new protocols.tokens.SendTokenLogic({ chainId });
      logics.push(await sendToken.getLogic({ input, recipient: user2.address }));

      // 3. send router tx
      const value = funds.native?.amountWei ?? 0;
      await expect(router.connect(user1).execute(logics, tokensReturn, { value })).not.to.be.reverted;
      await expect(user1.address).to.changeBalance(input.token, -input.amount);
      await expect(user2.address).to.changeBalance(input.token, input.amount);
    });
  });
});
