import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test WrappedNativeToken Logic', function () {
  let chainId: number;
  let router: rt.contracts.Router;
  let erc20Spender: rt.contracts.SpenderERC20Approval;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await utils.network.getChainId();
    [, user] = await hre.ethers.getSigners();
    router = await utils.deployer.deployRouter();
    erc20Spender = await utils.deployer.deploySpenderERC20Approval(router.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '100'), user.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '100'), user.address);
  });

  const cases = [
    {
      input: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'),
      output: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1'),
    },
    {
      input: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1'),
      output: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'),
    },
    {
      input: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'),
      output: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1'),
      amountBps: 5000,
    },
    {
      input: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1'),
      output: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'),
      amountBps: 5000,
    },
  ];

  cases.forEach(({ input, output, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new core.tokens.TokenAmounts();
      if (amountBps) {
        funds.add(utils.router.calcRequiredFundByAmountBps(input, amountBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 2. build router logics
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

      const wrappedNativeToken = new protocols.tokens.WrappedNativeTokenLogic({ chainId });
      logics.push(await wrappedNativeToken.getLogic({ input, output, amountBps }));

      // 3. send router tx
      const value = funds.native?.amountWei ?? 0;
      await expect(router.connect(user).execute(logics, tokensReturn, { value })).not.to.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });

  after(async function () {
    await utils.network.reset();
  });
});
