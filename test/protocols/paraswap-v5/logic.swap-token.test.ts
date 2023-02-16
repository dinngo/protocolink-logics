import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test ParaswapV5 SwapToken Logic', function () {
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
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '100'), user.address);
  });

  after(async function () {
    await utils.network.reset();
  });

  const cases = [
    {
      input: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'),
      tokenOut: core.tokens.mainnet.USDC,
      slippage: 500,
    },
    {
      input: new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '1'),
      tokenOut: core.tokens.mainnet.ETH,
      slippage: 500,
    },
    {
      input: new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '1'),
      tokenOut: core.tokens.mainnet.DAI,
      slippage: 500,
    },
  ];

  cases.forEach(({ input, tokenOut, slippage }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const paraswapV5SwapToken = new protocols.paraswapv5.ParaswapV5SwapTokenLogic({ chainId });
      const output = await paraswapV5SwapToken.getPrice({ input, tokenOut });

      // 2. build funds, tokensReturn
      const funds = new core.tokens.TokenAmounts(input);
      const tokensReturn = [output.token.elasticAddress];

      // 3. build router logics
      const erc20Funds = funds.erc20;
      const logics = await utils.router.getPermitAndPullTokenLogics(
        chainId,
        user,
        erc20Funds,
        router.address,
        erc20Spender.address
      );

      logics.push(await paraswapV5SwapToken.getLogic({ account: user.address, input, output, slippage }));

      // 4. send router tx
      const value = funds.native?.amountWei ?? 0;
      await expect(router.connect(user).execute(logics, tokensReturn, { value })).not.to.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(user.address).to.changeBalance(output.token, output.amount, 100);
    });
  });
});
