import { BigNumberish } from 'ethers';
import { ProtocolFeesCollector__factory, Vault__factory } from './contracts';
import { TokenList } from '@uniswap/token-lists';
import { axios } from 'src/utils';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getContractAddress, supportedChainIds } from './configs';
import invariant from 'tiny-invariant';

export type FlashLoanLogicTokenList = common.Token[];

export type FlashLoanLogicParams = core.FlashLoanParams;

export type FlashLoanLogicQuotation = core.FlashLoanQuotation;

export type FlashLoanLogicFields = core.FlashLoanFields;

@core.LogicDefinitionDecorator()
export class FlashLoanLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static readonly supportedChainIds = supportedChainIds;

  get callbackAddress() {
    return getContractAddress(this.chainId, 'BalancerV2FlashLoanCallback');
  }

  async getTokenList() {
    const { data } = await axios.get<TokenList>(
      'https://raw.githubusercontent.com/balancer/tokenlists/main/generated/balancer.tokenlist.json'
    );

    const tmp: Record<string, boolean> = {};
    const tokenList: FlashLoanLogicTokenList = [];
    for (const { chainId, address, decimals, symbol, name } of data.tokens) {
      if (tmp[address] || chainId !== this.chainId || !name || !symbol || !decimals) continue;
      tokenList.push(new common.Token(chainId, address, decimals, symbol, name));
      tmp[address] = true;
    }

    return tokenList;
  }

  async quote(params: FlashLoanLogicParams) {
    const assets = core.isFlashLoanLoanParams(params)
      ? params.loans.map(({ token }) => token)
      : params.repays.map(({ token }) => token);
    invariant(new Set(assets.map((asset) => asset.address)).size === assets.length, 'loans have duplicate tokens');

    const vaultAddress = getContractAddress(this.chainId, 'Vault');
    const protocolFeesCollectorIface = ProtocolFeesCollector__factory.createInterface();

    const calls: common.Multicall2.CallStruct[] = [
      {
        target: getContractAddress(this.chainId, 'ProtocolFeesCollector'),
        callData: protocolFeesCollectorIface.encodeFunctionData('getFlashLoanFeePercentage'),
      },
    ];
    assets.forEach((asset) => {
      calls.push({
        target: asset.address,
        callData: this.erc20Iface.encodeFunctionData('balanceOf', [vaultAddress]),
      });
    });
    const { returnData } = await this.multicall2.callStatic.aggregate(calls);

    let j = 0;
    const [flashLoanFeePercentage] = protocolFeesCollectorIface.decodeFunctionResult(
      'getFlashLoanFeePercentage',
      returnData[j]
    );
    const feeBps = flashLoanFeePercentage.toNumber();
    j++;

    let loans: common.TokenAmounts;
    let repays: common.TokenAmounts;
    if (core.isFlashLoanLoanParams(params)) {
      ({ loans } = params);

      repays = new common.TokenAmounts();
      for (let i = 0; i < loans.length; i++) {
        const loan = loans.at(i);

        const [balance] = this.erc20Iface.decodeFunctionResult('balanceOf', returnData[j]);
        const availableToBorrow = new common.TokenAmount(loan.token).setWei(balance);
        invariant(availableToBorrow.gte(loan), `insufficient borrowing capacity for the asset: ${loan.token.address}`);
        j++;

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

        const [balance] = this.erc20Iface.decodeFunctionResult('balanceOf', returnData[j]);
        const availableToBorrow = new common.TokenAmount(loan.token).setWei(balance);
        invariant(availableToBorrow.gte(loan), `insufficient borrowing capacity for the asset: ${loan.token.address}`);
        j++;

        const feeAmountWei = common.calcFee(loan.amountWei, feeBps);
        const fee = new common.TokenAmount(loan.token).setWei(feeAmountWei);
        repays.add(loan.clone().add(fee));
      }
    }

    const quotation: FlashLoanLogicQuotation = { loans, repays, feeBps };

    return quotation;
  }

  async build(fields: FlashLoanLogicFields) {
    const { loans, params } = fields;

    const to = getContractAddress(this.chainId, 'Vault');

    const assets: string[] = [];
    const amounts: BigNumberish[] = [];
    for (const loan of common.sortByAddress(loans.toArray())) {
      assets.push(loan.token.address);
      amounts.push(loan.amountWei);
    }
    const data = Vault__factory.createInterface().encodeFunctionData('flashLoan', [
      this.callbackAddress,
      assets,
      amounts,
      params,
    ]);

    const callback = this.callbackAddress;

    return core.newLogic({ to, data, callback });
  }
}
