import { BigNumber, constants } from 'ethers';
import { MaxUint160 } from '@uniswap/permit2-sdk';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import sinon from 'sinon';
import * as utils from 'test/utils';

describe('Test Router PermitToken Logic', function () {
  let chainId: number;
  let router: rt.contracts.Router;
  let permit2: protocols.router.contracts.Permit2;
  let erc20Spender: protocols.router.contracts.SpenderPermit2ERC20;
  let user: SignerWithAddress;
  let snapshotId: string;
  let clock: sinon.SinonFakeTimers;

  before(async function () {
    chainId = await utils.network.getChainId();
    [, user] = await hre.ethers.getSigners();
    router = await utils.deployer.deployRouter();
    const permit2Address = protocols.router.config.getContractAddress(chainId, 'Permit2');
    permit2 = protocols.router.contracts.Permit2__factory.connect(permit2Address, hre.ethers.provider);
    erc20Spender = await utils.deployer.deploySpenderPermit2ERC20(router.address, permit2.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '100'), user.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '100'), user.address);
  });

  after(async function () {
    await utils.network.reset();
  });

  beforeEach(async function () {
    snapshotId = await utils.network.takeSnapshot();
    clock = sinon.useFakeTimers({ now: Date.now(), toFake: ['Date'] });
  });

  afterEach(async function () {
    await utils.network.restoreSnapshot(snapshotId);
    clock.restore();
  });

  const cases = [
    { funds: new core.tokens.TokenAmounts([core.tokens.mainnet.ETH, '1'], [core.tokens.mainnet.WETH, '1']) },
    {
      funds: new core.tokens.TokenAmounts(
        [core.tokens.mainnet.ETH, '1'],
        [core.tokens.mainnet.WETH, '1'],
        [core.tokens.mainnet.USDC, '1']
      ),
    },
    { funds: new core.tokens.TokenAmounts([core.tokens.mainnet.WETH, '1'], [core.tokens.mainnet.USDC, '1']) },
  ];

  cases.forEach(({ funds }, i) => {
    it(`case ${i + 1}`, async function () {
      const erc20Funds = funds.erc20;
      const erc20Tokens = erc20Funds.tokens;
      for (const token of erc20Tokens) {
        // 1. user approve permit2 to spend fund erc20 token
        const erc20 = core.contracts.ERC20__factory.connect(token.address, user);
        await expect(erc20.approve(permit2.address, constants.MaxUint256)).not.to.be.reverted;

        // 2. check erc20 fund allowance
        const allowance = await permit2.allowance(user.address, token.address, erc20Spender.address);
        expect(allowance.amount).to.eq(0);
        expect(allowance.expiration).to.eq(0);
        expect(allowance.nonce).to.eq(0);
      }

      // 3. get user permit sig
      const routerPermitTokenLogic = new protocols.router.RouterPermitTokenLogic({
        chainId,
        provider: hre.ethers.provider,
      });
      let permitDetails = await routerPermitTokenLogic.getPermitDetails(user.address, erc20Funds, erc20Spender.address);
      expect(permitDetails.length).to.eq(erc20Funds.length);

      const permit = routerPermitTokenLogic.getPermit(permitDetails, erc20Spender.address);
      const permitData = routerPermitTokenLogic.getPermitData(permit);
      const permitSig = await user._signTypedData(permitData.domain, permitData.types, permitData.values);

      // 4. build router logics
      const logics: rt.IRouter.LogicStruct[] = [];

      logics.push(await routerPermitTokenLogic.getLogic({ account: user.address, permit, sig: permitSig }));

      // 5. send router tx
      await expect(router.connect(user).execute(logics, [])).not.to.be.reverted;

      // 6. check erc20 funds allowance
      for (let i = 0; i < erc20Tokens.length; i++) {
        const token = erc20Tokens[i];
        const allowance = await permit2.allowance(user.address, token.address, erc20Spender.address);
        expect(allowance.amount).to.eq(MaxUint160);
        expect(allowance.expiration).to.eq(permitDetails[i].expiration);
        expect(allowance.nonce).to.eq(BigNumber.from(permitDetails[i].nonce).add(1));
      }

      // 7. get permit details again, and should be empty.
      permitDetails = await routerPermitTokenLogic.getPermitDetails(user.address, erc20Funds, erc20Spender.address);
      expect(permitDetails.length).to.eq(0);

      // 8. get permit details again after 30d, and should be permit again.
      clock.tick(30 * 86400 * 1000);
      permitDetails = await routerPermitTokenLogic.getPermitDetails(user.address, erc20Funds, erc20Spender.address);
      expect(permitDetails.length).to.eq(erc20Funds.length);
    });
  });
});
