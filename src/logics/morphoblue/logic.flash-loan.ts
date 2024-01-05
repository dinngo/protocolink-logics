import { MorphoFlashLoanCallback__factory, Morpho__factory } from './contracts';
import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getContractAddress, getMarkets, supportedChainIds } from './configs';
import invariant from 'tiny-invariant';

export type FlashLoanLogicTokenList = common.Token[];

export type FlashLoanLogicParams = core.FlashLoanParams;

export type FlashLoanLogicQuotation = core.FlashLoanQuotation;

export type FlashLoanLogicFields = core.FlashLoanFields;

export class FlashLoanLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static id = 'flash-loan';
  static protocolId = 'morphoblue';
  static readonly supportedChainIds = supportedChainIds;

  get callbackAddress() {
    return getContractAddress(this.chainId, 'MorphoFlashLoanCallback');
  }

  async calcCallbackFee(loan: common.TokenAmount) {
    const callback = MorphoFlashLoanCallback__factory.connect(this.callbackAddress, this.provider);
    const feeRate = await callback.feeRate();
    const callbackFee = new common.TokenAmount(loan.token).setWei(common.calcFee(loan.amountWei, feeRate.toNumber()));

    return callbackFee;
  }

  async getTokenList() {
    const tokenSet = new Set<string>();
    const service = new Service(this.chainId, this.provider);

    const markets = getMarkets(this.chainId);
    for (const market of markets) {
      const tokens = await service.getMarketTokens(market.id);
      tokenSet.add(tokens.loanToken);
      tokenSet.add(tokens.collateralToken);
    }

    const tokenList: FlashLoanLogicTokenList = await service.getTokens([...tokenSet]);
    return tokenList;
  }

  async quote(params: FlashLoanLogicParams) {
    const assets = core.isFlashLoanLoanParams(params)
      ? params.loans.map(({ token }) => token)
      : params.repays.map(({ token }) => token);
    invariant(assets.length === 1, 'flashLoan more than one token');

    const morphoAddress = getContractAddress(this.chainId, 'Morpho');
    const asset = assets[0];
    const calls: common.Multicall3.CallStruct[] = [
      {
        target: asset.address,
        callData: this.erc20Iface.encodeFunctionData('balanceOf', [morphoAddress]),
      },
    ];

    const { returnData } = await this.multicall3.callStatic.aggregate(calls);
    const feeBps = 0;

    let loans: common.TokenAmounts;
    let repays: common.TokenAmounts;
    if (core.isFlashLoanLoanParams(params)) {
      ({ loans } = params);

      repays = new common.TokenAmounts();
      const loan = loans.at(0);

      const [balance] = this.erc20Iface.decodeFunctionResult('balanceOf', returnData[0]);
      const availableToBorrow = new common.TokenAmount(loan.token).setWei(balance);
      invariant(availableToBorrow.gte(loan), `insufficient borrowing capacity for the asset: ${loan.token.address}`);

      const feeAmountWei = common.calcFee(loan.amountWei, feeBps);
      const fee = new common.TokenAmount(loan.token).setWei(feeAmountWei);
      const repay = loan.clone().add(fee);
      repays.add(repay);
    } else {
      loans = new common.TokenAmounts();
      repays = new common.TokenAmounts();
      const repay = params.repays.at(0);

      const loanAmountWei = common.reverseAmountWithFee(repay.amountWei, feeBps);
      const loan = new common.TokenAmount(repay.token).setWei(loanAmountWei);
      loans.add(loan);

      const [balance] = this.erc20Iface.decodeFunctionResult('balanceOf', returnData[0]);
      const availableToBorrow = new common.TokenAmount(loan.token).setWei(balance);
      invariant(availableToBorrow.gte(loan), `insufficient borrowing capacity for the asset: ${loan.token.address}`);

      const feeAmountWei = common.calcFee(loan.amountWei, feeBps);
      const fee = new common.TokenAmount(loan.token).setWei(feeAmountWei);
      repays.add(loan.clone().add(fee));
    }

    const quotation: FlashLoanLogicQuotation = { loans, repays, feeBps };

    return quotation;
  }

  async build(fields: FlashLoanLogicFields) {
    const { loans, params } = fields;

    const to = this.callbackAddress;
    const loan = loans.toArray()[0];
    const asset = loan.token.address;
    const amount = loan.amountWei;
    const data = Morpho__factory.createInterface().encodeFunctionData('flashLoan', [asset, amount, params]);
    const callback = this.callbackAddress;

    return core.newLogic({ to, data, callback });
  }
}
