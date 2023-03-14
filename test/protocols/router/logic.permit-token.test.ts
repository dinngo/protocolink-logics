import { BigNumber, constants } from 'ethers';
import { MaxUint160 } from '@uniswap/permit2-sdk';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import sinon from 'sinon';

describe('Test Router PermitToken Logic', function () {
  let chainId: number;
  let permit2: protocols.router.Permit2;
  let erc20SpenderAaddress: string;
  let user: SignerWithAddress;
  let clock: sinon.SinonFakeTimers;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    const permit2Address = protocols.router.getContractAddress(chainId, 'Permit2');
    permit2 = protocols.router.Permit2__factory.connect(permit2Address, hre.ethers.provider);
    erc20SpenderAaddress = protocols.router.getContractAddress(chainId, 'SpenderPermit2ERC20');
    await claimToken(chainId, user.address, mainnetTokens.USDC, '100');
    await claimToken(chainId, user.address, mainnetTokens.WETH, '100');
  });

  beforeEach(async function () {
    clock = sinon.useFakeTimers({ now: Date.now(), toFake: ['Date'] });
  });

  afterEach(async function () {
    clock.restore();
  });

  const testCases = [
    { funds: new common.TokenAmounts([mainnetTokens.ETH, '1'], [mainnetTokens.WETH, '1']) },
    { funds: new common.TokenAmounts([mainnetTokens.ETH, '1'], [mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']) },
    { funds: new common.TokenAmounts([mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']) },
  ];

  testCases.forEach(({ funds }, i) => {
    it(`case ${i + 1}`, async function () {
      const erc20Funds = funds.erc20;
      const erc20Tokens = erc20Funds.tokens;
      for (const token of erc20Tokens) {
        // 1. user approve permit2 to spend fund erc20 token
        const erc20 = common.ERC20__factory.connect(token.address, user);
        await expect(erc20.approve(permit2.address, constants.MaxUint256)).to.not.be.reverted;

        // 2. check erc20 fund allowance
        const allowance = await permit2.allowance(user.address, token.address, erc20SpenderAaddress);
        expect(allowance.amount).to.eq(0);
        expect(allowance.expiration).to.eq(0);
        expect(allowance.nonce).to.eq(0);
      }

      // 3. get user permit sig
      const routerPermitTokenLogic = new protocols.router.PermitTokenLogic(chainId, hre.ethers.provider);
      let permitDetails = await routerPermitTokenLogic.getPermitDetails(user.address, erc20Funds, erc20SpenderAaddress);
      expect(permitDetails.length).to.eq(erc20Funds.length);
      const permit = routerPermitTokenLogic.getPermit(permitDetails, erc20SpenderAaddress);
      const permitData = routerPermitTokenLogic.getPermitData(permit);
      const permitSig = await user._signTypedData(permitData.domain, permitData.types, permitData.values);

      // 4. build router logics
      const routerLogics: core.IParam.LogicStruct[] = [];
      routerLogics.push(await routerPermitTokenLogic.getLogic({ permit, sig: permitSig }, { account: user.address }));

      // 5. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

      // 6. check erc20 funds allowance
      for (let i = 0; i < erc20Tokens.length; i++) {
        const token = erc20Tokens[i];
        const allowance = await permit2.allowance(user.address, token.address, erc20SpenderAaddress);
        expect(allowance.amount).to.eq(MaxUint160);
        expect(allowance.expiration).to.eq(permitDetails[i].expiration);
        expect(allowance.nonce).to.eq(BigNumber.from(permitDetails[i].nonce).add(1));
      }

      // 7. get permit details again, and should be empty.
      permitDetails = await routerPermitTokenLogic.getPermitDetails(user.address, erc20Funds, erc20SpenderAaddress);
      expect(permitDetails.length).to.eq(0);

      // 8. get permit details again after 30d, and should be permit again.
      clock.tick(30 * 86400 * 1000);
      permitDetails = await routerPermitTokenLogic.getPermitDetails(user.address, erc20Funds, erc20SpenderAaddress);
      expect(permitDetails.length).to.eq(erc20Funds.length);
    });
  });
});
