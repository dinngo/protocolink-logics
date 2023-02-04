import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test SendToken Logic', function () {
  let chainId: number;
  let router: rt.contracts.Router;
  let erc20Spender: rt.contracts.SpenderERC20Approval;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  before(async function () {
    chainId = await utils.network.getChainId();
    [, user1, user2] = await hre.ethers.getSigners();
    router = await utils.deployer.deployRouter();
    erc20Spender = await utils.deployer.deploySpenderERC20Approval(router.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '100'), user1.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '100'), user1.address);
  });

  const cases = [
    { input: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1') },
    { input: new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '1') },
  ];

  cases.forEach(({ input }, i) => {
    it(`case ${i + 1}`, async function () {
      const funds = new core.tokens.TokenAmounts(input);

      const logics: rt.IRouter.LogicStruct[] = [];

      const erc20Funds = funds.erc20;
      await utils.web3.approves(user1, erc20Spender.address, erc20Funds);
      const routerDeposit = new protocols.router.RouterDepositLogic({ chainId, spender: erc20Spender.address });
      logics.push(await routerDeposit.getLogic({ funds: erc20Funds }));

      const sendToken = new protocols.tokens.SendTokenLogic({ chainId });
      logics.push(await sendToken.getLogic({ input, recipient: user2.address }));

      const user1BalanceBefore = await utils.web3.getBalance(user1.address, input.token);
      const user2BalanceBefore = await utils.web3.getBalance(user2.address, input.token);

      await expect(router.connect(user1).execute(logics, [])).not.to.be.reverted;

      const user1BalanceAfter = await utils.web3.getBalance(user1.address, input.token);
      const user2BalanceAfter = await utils.web3.getBalance(user2.address, input.token);

      expect(user1BalanceBefore.sub(user1BalanceAfter).amount).to.eq(input.amount);
      expect(user2BalanceAfter.sub(user2BalanceBefore).amount).to.eq(input.amount);
    });
  });
});
