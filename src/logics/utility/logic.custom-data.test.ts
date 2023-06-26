import { CustomDataLogic, CustomDataLogicFields } from './logic.custom-data';
import { LogicTestCase } from 'test/types';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';

describe('Utility CustomDataLogic', function () {
  context('Test build', function () {
    const chainId = common.ChainId.mainnet;
    const logic = new CustomDataLogic(chainId);

    const testCases: LogicTestCase<CustomDataLogicFields>[] = [
      {
        fields: {
          to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          data: '0x23b872dd00000000000000000000000062c9c36ed8bd4ae6226507080991a4cade23cbdb0000000000000000000000006dfc34609a05bc22319fa4cce1d1e2929548c0d70000000000000000000000000000000000000000000000000000000032d12f90',
        },
      },
    ];

    testCases.forEach(({ fields }, i) => {
      it(`case ${i + 1}`, async function () {
        const routerLogic = await logic.build(fields);
        const { to, data } = fields;

        expect(routerLogic.to).to.eq(to);
        expect(routerLogic.data).to.eq(data);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});
