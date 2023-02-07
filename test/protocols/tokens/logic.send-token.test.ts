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
      if (!erc20Funds.isEmpty()) {
        await utils.web3.approves(user1, erc20Spender.address, erc20Funds);
        const routerDeposit = new protocols.router.RouterDepositLogic({
          chainId,
          spenderAddress: erc20Spender.address,
        });
        logics.push(await routerDeposit.getLogic({ funds: erc20Funds }));
      }

      const sendToken = new protocols.tokens.SendTokenLogic({ chainId });
      logics.push(await sendToken.getLogic({ input, recipient: user2.address }));

      const value = funds.native?.amountWei ?? 0;

      await expect(router.connect(user1).execute(logics, [], { value })).not.to.be.reverted;
      await expect(user1.address).to.changeBalance(input.token, -input.amount);
      await expect(user2.address).to.changeBalance(input.token, input.amount);
    });
  });
});
