import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import { metisTokens } from 'src/logics/openocean-v2/tokens';
import * as openoceanV2 from 'src/logics/openocean-v2';
import * as utils from 'test/utils';

describe('metis: Test OpenOceanV2 SwapToken Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, metisTokens.METIS, '100', '0x7314Ef2CA509490f65F52CC8FC9E0675C66390b8');
    await claimToken(chainId, user.address, metisTokens.USDC, '3000', '0x885C8AEC5867571582545F894A5906971dB9bf27');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      params: {
        input: new common.TokenAmount(metisTokens.METIS, '1'),
        tokenOut: metisTokens.DAI,
        slippage: 100,
      },
    },
    {
      params: {
        input: new common.TokenAmount(metisTokens.USDC, '1'),
        tokenOut: metisTokens.METIS,
        slippage: 100,
      },
    },
    {
      params: {
        input: new common.TokenAmount(metisTokens.USDC, '1'),
        tokenOut: metisTokens.DAI,
        slippage: 100,
      },
    },
  ];

  testCases.forEach(({ params }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const openoceanV2SwapTokenLogic = new openoceanV2.SwapTokenLogic(chainId);
      const quotation = await openoceanV2SwapTokenLogic.quote(params);
      const { input, output } = quotation;

      // 2. build funds, tokensReturn
      const funds = new common.TokenAmounts(input);
      const tokensReturn = [output.token.elasticAddress];

      // 3. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await openoceanV2SwapTokenLogic.build(quotation, { account: user.address }));

      // 4. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, user, funds.erc20);

      // 5. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({
        permit2Datas,
        routerLogics,
        tokensReturn,
        value: 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(user.address).to.changeBalance(output.token, output.amount, quotation.slippage);
    });
  });
});
