import { FlashLoanLogic, FlashLoanLogicFields } from './logic.flash-loan';
import { LogicTestCase } from 'test/types';
import { Pool__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { getContractAddress } from './config';
import { mainnetTokens } from './tokens';

describe('AaveV3 FlashLoanLogic', function () {
  context('Test getTokenList', async function () {
    FlashLoanLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const flashLoanLogic = new FlashLoanLogic(chainId);
        const tokens = await flashLoanLogic.getTokenList();
        expect(tokens.length).to.be.gt(0);
      });
    });
  });

  context('Test getLogic', function () {
    const chainId = common.ChainId.mainnet;
    const aaveV3FlashLoanLogic = new FlashLoanLogic(chainId);
    let poolAddress: string;
    const poolIface = Pool__factory.createInterface();

    before(async function () {
      const service = new Service(chainId);
      poolAddress = await service.getPoolAddress();
    });

    const testCases: LogicTestCase<FlashLoanLogicFields>[] = [
      {
        fields: {
          outputs: new common.TokenAmounts([mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']),
          params: '0x',
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`flash loan ${fields.outputs.map((output) => output.token.symbol).join(',')}`, async function () {
        const routerLogic = await aaveV3FlashLoanLogic.getLogic(fields);
        const sig = routerLogic.data.substring(0, 10);

        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(routerLogic.to).to.eq(poolAddress);
        expect(sig).to.eq(poolIface.getSighash('flashLoan'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(getContractAddress(chainId, 'FlashLoanCallbackAaveV3'));
      });
    });
  });
});
