import { AaveV2FlashLoanCallback__factory, LendingPool__factory } from './contracts';
import { BigNumberish, constants } from 'ethers';
import { InterestRateMode } from './types';
import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getContractAddress, supportedChainIds } from './configs';
import invariant from 'tiny-invariant';

export type FlashLoanLogicTokenList = common.Token[];

export type FlashLoanLogicParams = core.FlashLoanParams;

export type FlashLoanLogicQuotation = core.FlashLoanQuotation;

export type FlashLoanLogicFields = core.FlashLoanFields<{ referralCode?: number }>;

export class FlashLoanLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static id = 'flash-loan';
  static protocolId = 'aave-v2';
  static readonly supportedChainIds = supportedChainIds;

  get callbackAddress() {
    return getContractAddress(this.chainId, 'AaveV2FlashLoanCallback');
  }

  async calcCallbackFee(loan: common.TokenAmount) {
    const callback = AaveV2FlashLoanCallback__factory.connect(this.callbackAddress, this.provider);
    const feeRate = await callback.feeRate();
    const callbackFee = new common.TokenAmount(loan.token).setWei(common.calcFee(loan.amountWei, feeRate.toNumber()));

    return callbackFee;
  }

  async getTokenList() {
    const service = new Service(this.chainId, this.provider);
    const tokens = await service.getAssets();
    const { assetInfos } = await service.getFlashLoanConfiguration(tokens);

    const tokenList: FlashLoanLogicTokenList = [];
    for (let i = 0; i < assetInfos.length; i++) {
      const { isActive } = assetInfos[i];
      if (!isActive) continue;
      tokenList.push(tokens[i]);
    }

    return tokenList;
  }

  // https://github.com/aave/protocol-v2/blob/master/contracts/protocol/lendingpool/LendingPool.sol#L483
  // https://github.com/aave/protocol-v2/blob/master/contracts/protocol/lendingpool/LendingPool.sol#L504
  async quote(params: FlashLoanLogicParams) {
    const assets = core.isFlashLoanLoanParams(params)
      ? params.loans.map(({ token }) => token)
      : params.repays.map(({ token }) => token);

    const service = new Service(this.chainId, this.provider);
    const { feeBps, assetInfos } = await service.getFlashLoanConfiguration(assets);

    let loans: common.TokenAmounts;
    let repays: common.TokenAmounts;
    if (core.isFlashLoanLoanParams(params)) {
      ({ loans } = params);

      repays = new common.TokenAmounts();
      for (let i = 0; i < loans.length; i++) {
        const loan = loans.at(i);

        const { isActive, availableToBorrow } = assetInfos[i];
        invariant(isActive, `asset is not active: ${loan.token.address}`);
        invariant(availableToBorrow.gte(loan), `insufficient borrowing capacity for the asset: ${loan.token.address}`);

        const feeAmountWei = common.calcFee(loan.amountWei, feeBps);
        const fee = new common.TokenAmount(loan.token).setWei(feeAmountWei);
        const repay = loan.clone().add(fee);
        repays.add(repay);
      }
    } else {
      loans = new common.TokenAmounts();
      repays = new common.TokenAmounts();
      for (let i = 0; i < params.repays.length; i++) {
        const repay = params.repays.at(i);

        const loanAmountWei = common.reverseAmountWithFee(repay.amountWei, feeBps);
        const loan = new common.TokenAmount(repay.token).setWei(loanAmountWei);
        loans.add(loan);

        const { isActive, availableToBorrow } = assetInfos[i];
        invariant(isActive, `asset is not active: ${loan.token.address}`);
        invariant(availableToBorrow.gte(loan), `insufficient borrowing capacity for the asset: ${loan.token.address}`);

        const feeAmountWei = common.calcFee(loan.amountWei, feeBps);
        const fee = new common.TokenAmount(loan.token).setWei(feeAmountWei);
        repays.add(loan.clone().add(fee));
      }
    }

    const quotation: FlashLoanLogicQuotation = { loans, repays, feeBps };

    return quotation;
  }

  async build(fields: FlashLoanLogicFields) {
    const { loans, params, referralCode = 0 } = fields;

    const service = new Service(this.chainId, this.provider);
    const to = await service.getLendingPoolAddress();

    const assets: string[] = [];
    const amounts: BigNumberish[] = [];
    const modes: number[] = [];
    loans.forEach((loan) => {
      assets.push(loan.token.address);
      amounts.push(loan.amountWei);
      modes.push(InterestRateMode.none);
    });
    const data = LendingPool__factory.createInterface().encodeFunctionData('flashLoan', [
      this.callbackAddress,
      assets,
      amounts,
      modes,
      constants.AddressZero,
      params,
      referralCode,
    ]);

    const callback = this.callbackAddress;

    return core.newLogic({ to, data, callback });
  }
}
