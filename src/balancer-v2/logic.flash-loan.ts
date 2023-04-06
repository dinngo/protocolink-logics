import { BigNumberish } from 'ethers';
import { TokenList } from '@uniswap/token-lists';
import { Vault__factory } from './contracts';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { getContractAddress } from './config';

axiosRetry(axios, { retries: 5, retryDelay: axiosRetry.exponentialDelay });

export type FlashLoanLogicFields = core.FlashLoanFields;

@core.LogicDefinitionDecorator()
export class FlashLoanLogic extends core.Logic {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon, common.ChainId.arbitrum];

  async getTokenList() {
    const { data } = await axios.get<TokenList>(
      'https://raw.githubusercontent.com/balancer/tokenlists/main/generated/listed-old.tokenlist.json'
    );

    const tmp: Record<string, boolean> = {};
    const tokenList: common.TokenTypes[] = [];
    for (const token of data.tokens) {
      if (tmp[token.address] || token.chainId !== this.chainId || !token.name || !token.symbol || !token.decimals) {
        continue;
      }
      tokenList.push({
        chainId: token.chainId,
        address: token.address,
        decimals: token.decimals,
        symbol: token.symbol,
        name: token.name,
      });
      tmp[token.address] = true;
    }

    return tokenList;
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
      getContractAddress(this.chainId, 'FlashLoanCallbackBalancerV2'),
      assets,
      amounts,
      params,
    ]);

    const callback = getContractAddress(this.chainId, 'FlashLoanCallbackBalancerV2');

    return core.newLogic({ to, data, callback });
  }
}
