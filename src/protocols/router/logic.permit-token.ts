import { AllowanceTransfer, MaxUint160, PermitBatch, PermitBatchData, PermitDetails } from '@uniswap/permit2-sdk';
import { PERMIT_EXPIRATION, PERMIT_SIG_DEADLINE } from './constants';
import { Permit2__factory } from './contracts';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { getContractAddress } from './config';
import { getDeadline } from './utils';

export interface PermitTokenLogicFields {
  permit: PermitBatch;
  sig: string;
}

export type PermitTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class PermitTokenLogic extends core.Logic {
  static readonly supportedChainIds = [
    common.ChainId.mainnet,
    common.ChainId.polygon,
    common.ChainId.arbitrum,
    common.ChainId.optimism,
    common.ChainId.avalanche,
  ];

  async getPermitDetails(account: string, erc20Funds: common.TokenAmounts, spender: string) {
    const details: PermitDetails[] = [];
    if (!erc20Funds.isEmpty()) {
      const iface = Permit2__factory.createInterface();
      const calls: common.Multicall2.CallStruct[] = erc20Funds.map((fund) => ({
        target: getContractAddress(this.chainId, 'Permit2'),
        callData: iface.encodeFunctionData('allowance', [account, fund.token.address, spender]),
      }));
      const { returnData } = await this.multicall2.callStatic.aggregate(calls);

      erc20Funds.forEach((fund, i) => {
        const [amount, expiration, nonce] = iface.decodeFunctionResult('allowance', returnData[i]);
        if (amount.lt(fund.amountWei) || expiration <= getDeadline(PERMIT_SIG_DEADLINE)) {
          details.push({
            token: fund.token.address,
            amount: MaxUint160,
            expiration: getDeadline(PERMIT_EXPIRATION),
            nonce,
          });
        }
      });
    }

    return details;
  }

  getPermit(details: PermitDetails[], spender: string): PermitBatch {
    return { details, spender, sigDeadline: getDeadline(PERMIT_SIG_DEADLINE) };
  }

  getPermitData(permit: PermitBatch): PermitBatchData {
    return AllowanceTransfer.getPermitData(
      permit,
      getContractAddress(this.chainId, 'Permit2'),
      this.chainId
    ) as PermitBatchData;
  }

  async getLogic(fields: PermitTokenLogicFields, options: PermitTokenLogicOptions) {
    const { permit, sig } = fields;
    const { account } = options;

    const to = getContractAddress(this.chainId, 'Permit2');
    const data = Permit2__factory.createInterface().encodeFunctionData(
      'permit(address,((address,uint160,uint48,uint48)[],address,uint256),bytes)',
      [account, permit, sig]
    );

    return core.newLogic({ to, data });
  }
}
