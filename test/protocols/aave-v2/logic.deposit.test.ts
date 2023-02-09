import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test AaveV2Deposit Logic', function () {
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
      input: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
      output: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.aWETH, '1'),
    },
    {
      input: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '1'),
      output: new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.aUSDC, '1'),
    },
  ];

  cases.forEach(({ input, output }, i) => {
    it(`case ${i + 1}`, async function () {
      const funds = new core.tokens.TokenAmounts(input);
      const balances = new core.tokens.TokenAmounts(output);

      const logics: rt.IRouter.LogicStruct[] = [];

      const erc20Funds = funds.erc20;
      await utils.web3.approves(user, erc20Spender.address, erc20Funds);
      const routerDeposit = new protocols.router.RouterDepositLogic({
        chainId,
        spenderAddress: erc20Spender.address,
      });
      logics.push(await routerDeposit.getLogic({ funds: erc20Funds }));

      const aaveV2Deposit = new protocols.aavev2.AaveV2DepositLogic({ chainId });
      logics.push(await aaveV2Deposit.getLogic({ input, output, routerAddress: router.address }));

      const tokensReturn = rt.utils.toTokensReturn(balances);

      await expect(router.connect(user).execute(logics, tokensReturn)).not.to.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(user.address).to.changeBalance(output.token, output.amount, 3);
    });
  });

  after(async function () {
    await utils.network.reset();
  });
});
