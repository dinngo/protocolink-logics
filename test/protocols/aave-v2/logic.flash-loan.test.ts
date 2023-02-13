import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test AaveV2FlashLoan Logic', function () {
  let chainId: number;
  let router: rt.contracts.Router;
  let erc20Spender: rt.contracts.SpenderERC20Approval;
  let flashLoanCallbackAaveV2: rt.contracts.FlashLoanCallbackAaveV2;
  let flashLoanPremiumTotal: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await utils.network.getChainId();
    [, user] = await hre.ethers.getSigners();
    router = await utils.deployer.deployRouter();
    erc20Spender = await utils.deployer.deploySpenderERC20Approval(router.address);

    const aaveV2Service = new protocols.aavev2.AaveV2Service({ chainId, provider: hre.ethers.provider });
    const aaveV2AddressesProvider = await aaveV2Service.protocolDataProvider.ADDRESSES_PROVIDER();
    flashLoanCallbackAaveV2 = await utils.deployer.deployFlashLoanCallbackAaveV2(
      router.address,
      aaveV2AddressesProvider
    );
    flashLoanPremiumTotal = await aaveV2Service.getFlashLoanPremiumTotal();

    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '2'), user.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '2'), user.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.WBTC, '2'), user.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.DAI, '2'), user.address);
  });

  const cases = [
    {
      outputs: [
        new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WETH, '1'),
        new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.USDC, '1'),
      ],
    },
    {
      outputs: [
        new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.WBTC, '1'),
        new core.tokens.TokenAmount(protocols.aavev2.tokens.mainnet.DAI, '1'),
      ],
    },
  ];

  cases.forEach(({ outputs }, i) => {
    it(`case ${i + 1}`, async function () {
      const logics: rt.IRouter.LogicStruct[] = [];

      const funds = new core.tokens.TokenAmounts();
      const flashLoanLogics: rt.IRouter.LogicStruct[] = [];
      const sendToken = new protocols.tokens.SendTokenLogic({ chainId });
      for (const output of outputs) {
        const feeWei = core.utils.calcFee(output.amountWei, flashLoanPremiumTotal);
        const fund = new core.tokens.TokenAmount(output.token).addWei(feeWei);
        funds.add(fund);
        flashLoanLogics.push(
          await sendToken.getLogic({ input: output.clone().addWei(feeWei), recipient: flashLoanCallbackAaveV2.address })
        );
      }

      const erc20Funds = funds.erc20;
      await utils.web3.approves(user, erc20Spender.address, erc20Funds);
      const routerDeposit = new protocols.router.RouterDepositLogic({
        chainId,
        spenderAddress: erc20Spender.address,
      });
      logics.push(await routerDeposit.getLogic({ funds: erc20Funds }));

      const params = rt.contracts.Router__factory.createInterface().encodeFunctionData('execute', [
        flashLoanLogics,
        [],
      ]);
      const aaveV2FlashLoan = new protocols.aavev2.AaveV2FlashLoanLogic({
        chainId,
        callbackAddress: flashLoanCallbackAaveV2.address,
      });
      logics.push(await aaveV2FlashLoan.getLogic({ outputs, params }));

      await expect(router.connect(user).execute(logics, [])).not.to.be.reverted;
      for (const fund of funds.toArray()) {
        await expect(user.address).to.changeBalance(fund.token, -fund.amount);
      }
    });
  });

  after(async function () {
    await utils.network.reset();
  });
});
