import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test BalancerV2 FlashLoan Logic', function () {
  let chainId: number;
  let router: rt.contracts.Router;
  let flashLoanCallbackBalancerV2: protocols.balancerv2.contracts.FlashLoanCallbackBalancerV2;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await utils.network.getChainId();
    [, user] = await hre.ethers.getSigners();
    router = await utils.deployer.deployRouter();
    flashLoanCallbackBalancerV2 = await utils.deployer.deployFlashLoanCallbackBalancerV2(
      router.address,
      protocols.balancerv2.config.getContractAddress(chainId, 'Vault')
    );
  });

  after(async function () {
    await utils.network.reset();
  });

  const cases = [
    {
      outputs: [
        new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1'),
        new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '1'),
      ],
    },
    {
      outputs: [
        new core.tokens.TokenAmount(core.tokens.mainnet.USDT, '1'),
        new core.tokens.TokenAmount(core.tokens.mainnet.DAI, '1'),
      ],
    },
  ];

  cases.forEach(({ outputs }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. build funds and router logics for flash loan
      const flashLoanLogics: rt.IRouter.LogicStruct[] = [];
      const sendToken = new protocols.tokens.SendTokenLogic({ chainId });
      for (const output of outputs) {
        flashLoanLogics.push(
          await sendToken.getLogic({
            input: output,
            recipient: flashLoanCallbackBalancerV2.address,
          })
        );
      }

      // 2. build router logics
      const logics: rt.IRouter.LogicStruct[] = [];

      const userData = rt.contracts.Router__factory.createInterface().encodeFunctionData('execute', [
        flashLoanLogics,
        [],
      ]);
      const balancerV2FlashLoan = new protocols.balancerv2.BalancerV2FlashLoanLogic({
        chainId,
        callbackAddress: flashLoanCallbackBalancerV2.address,
      });
      logics.push(await balancerV2FlashLoan.getLogic({ outputs, userData }));

      // 3. send router tx
      await expect(router.connect(user).execute(logics, [])).not.to.be.reverted;
    });
  });
});
