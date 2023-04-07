import { BigNumber, constants } from 'ethers';
import { MaxUint160 } from '@uniswap/permit2-sdk';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  claimToken,
  getChainId,
  mainnetTokens,
  snapshotAndRevertEach,
} from '@furucombo/composable-router-test-helpers';
import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as permit2 from 'src/permit2';
import sinon from 'sinon';

describe('Test Permit2 PermitToken Logic', function () {
  let chainId: number;
  let contractPermit2: permit2.Permit2;
  let user: SignerWithAddress;
  let userAgent: string;
  let clock: sinon.SinonFakeTimers;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    const permit2Address = permit2.getContractAddress(chainId, 'Permit2');
    contractPermit2 = permit2.Permit2__factory.connect(permit2Address, hre.ethers.provider);
    userAgent = core.calcAccountAgent(chainId, user.address);
    await claimToken(chainId, user.address, mainnetTokens.USDC, '100');
    await claimToken(chainId, user.address, mainnetTokens.WETH, '100');
  });

  snapshotAndRevertEach();

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
        const contractErc20 = common.ERC20__factory.connect(token.address, user);
        await expect(contractErc20.approve(contractPermit2.address, constants.MaxUint256)).to.not.be.reverted;

        // 2. check erc20 fund allowance
        const allowance = await contractPermit2.allowance(user.address, token.address, userAgent);
        expect(allowance.amount).to.eq(0);
        expect(allowance.expiration).to.eq(0);
        expect(allowance.nonce).to.eq(0);
      }

      // 3. get user permit sig
      const logicPermit2PermitToken = new permit2.PermitTokenLogic(chainId, hre.ethers.provider);
      let permitData = await logicPermit2PermitToken.getPermitData(user.address, erc20Funds);
      expect(permitData).to.not.be.undefined;
      let permit = permitData!.values;
      const permitSig = await user._signTypedData(permitData!.domain, permitData!.types, permitData!.values);

      // 4. build router logics
      const routerLogics: core.IParam.LogicStruct[] = [];
      routerLogics.push(await logicPermit2PermitToken.build({ permit, sig: permitSig }, { account: user.address }));

      // 5. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

      // 6. check erc20 funds allowance
      if (permit2.isPermitSingle(permit)) {
        const token = erc20Tokens[0];
        const allowance = await contractPermit2.allowance(user.address, token.address, userAgent);
        expect(allowance.amount).to.eq(MaxUint160);
        expect(allowance.expiration).to.eq(permit.details.expiration);
        expect(allowance.nonce).to.eq(BigNumber.from(permit.details.nonce).add(1));
      } else {
        for (let i = 0; i < erc20Tokens.length; i++) {
          const token = erc20Tokens[i];
          const allowance = await contractPermit2.allowance(user.address, token.address, userAgent);
          expect(allowance.amount).to.eq(MaxUint160);
          expect(allowance.expiration).to.eq(permit.details[i].expiration);
          expect(allowance.nonce).to.eq(BigNumber.from(permit.details[i].nonce).add(1));
        }
      }

      // 7. get permit details again, and should be empty.
      permitData = await logicPermit2PermitToken.getPermitData(user.address, erc20Funds);
      expect(permitData).to.be.undefined;

      // 8. get permit details again after 30d, and should be permit again.
      clock.tick(30 * 86400 * 1000);
      permitData = await logicPermit2PermitToken.getPermitData(user.address, erc20Funds);
      expect(permitData).to.not.be.undefined;
      permit = permitData!.values;
      if (permit2.isPermitSingle(permit)) {
        expect(erc20Funds.length).to.eq(1);
      } else {
        expect(permit.details.length).to.eq(erc20Funds.length);
      }
    });
  });
});
