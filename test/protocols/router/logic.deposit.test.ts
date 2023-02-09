import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test Router Deposit Logic', function () {
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
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '100'), user.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '100'), user.address);
  });

  const cases = [
    {
      funds: new core.tokens.TokenAmounts([core.tokens.mainnet.ETH, '1']),
      balances: new core.tokens.TokenAmounts([core.tokens.mainnet.ETH, '1']),
    },
    {
      funds: new core.tokens.TokenAmounts([core.tokens.mainnet.ETH, '1'], [core.tokens.mainnet.USDC, '1']),
      balances: new core.tokens.TokenAmounts([core.tokens.mainnet.ETH, '1'], [core.tokens.mainnet.USDC, '1']),
    },
    {
      funds: new core.tokens.TokenAmounts([core.tokens.mainnet.WETH, '1'], [core.tokens.mainnet.USDC, '1']),
      balances: new core.tokens.TokenAmounts([core.tokens.mainnet.WETH, '1'], [core.tokens.mainnet.USDC, '1']),
    },
  ];

  cases.forEach(({ funds, balances }, i) => {
    it(`case ${i + 1}`, async function () {
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

      const tokensReturn = rt.utils.toTokensReturn(balances);

      await expect(router.connect(user).execute(logics, tokensReturn)).not.to.be.reverted;
    });
  });

  after(async function () {
    await utils.network.reset();
  });
});
