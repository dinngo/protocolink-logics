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
    const { outputs: loans } = params;
    invariant(new Set(loans.map(({ token }) => token.address)).size === loans.length, 'loans have duplicate tokens');

    const vaultAddress = getContractAddress(this.chainId, 'Vault');
    const protocolFeesCollectorIface = ProtocolFeesCollector__factory.createInterface();

    const calls: common.Multicall2.CallStruct[] = [
      {
        target: getContractAddress(this.chainId, 'ProtocolFeesCollector'),
        callData: protocolFeesCollectorIface.encodeFunctionData('getFlashLoanFeePercentage'),
      },
    ];
    loans.forEach(({ token }) => {
      calls.push({
        target: token.address,
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

    const repays = new common.TokenAmounts();
    const fees = new common.TokenAmounts();
    for (let i = 0; i < loans.length; i++) {
      const loan = loans.at(i);
      const [balance] = this.erc20Iface.decodeFunctionResult('balanceOf', returnData[j]);
      const availableToBorrow = new common.TokenAmount(loan.token).setWei(balance);
      invariant(availableToBorrow.gte(loan), `insufficient borrowing capacity for the asset: ${loan.token.address}`);
      j++;

      const feeAmountWei = common.calcFee(loan.amountWei, feeBps);
      const fee = new common.TokenAmount(loan.token).setWei(feeAmountWei);
      fees.add(fee);

      const repay = loan.clone().add(fee);
      repays.add(repay);
    }
    const quotation: FlashLoanLogicQuotation = { loans, repays, fees, feeBps };

    return quotation;
  }

  async build(fields: FlashLoanLogicFields) {
    const { outputs, params } = fields;

    const to = getContractAddress(this.chainId, 'Vault');

    const assets: string[] = [];
    const amounts: BigNumberish[] = [];
    for (const output of common.sortByAddress(outputs.toArray())) {
      assets.push(output.token.address);
      amounts.push(output.amountWei);
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
