import { AllowanceTransfer, MaxUint160, PermitBatch, PermitDetails } from '@uniswap/permit2-sdk';
import { PERMIT_EXPIRATION, PERMIT_SIG_DEADLINE } from './constants';
import { Permit2__factory } from './contracts';
import * as core from 'src/core';
import { getContractAddress } from './config';
import { getDeadline } from './utils';
import * as rt from 'src/router';

export type RouterPermitTokenLogicGetPermitDetailsOptions = Pick<rt.RouterGlobalOptions, 'account' | 'erc20Funds'> & {
  spender: string;
};

export type RouterPermitTokenLogicGetPermitOptions = { details: PermitDetails[]; spender: string };

export type RouterPermitTokenLogicGetLogicOptions = Pick<rt.RouterGlobalOptions, 'account'> & {
  permit: PermitBatch;
  sig: string;
};

export class RouterPermitTokenLogic extends rt.logics.LogicBase {
  permit2Address: string;

  constructor(options: rt.logics.LogicBaseOptions) {
    super(options);
    this.permit2Address = getContractAddress(options.chainId, 'Permit2');
  }

  async getPermitDetails(account: string, erc20Funds: core.tokens.TokenAmounts, spender: string) {
    const details: PermitDetails[] = [];
    if (!erc20Funds.isEmpty()) {
      const funds = erc20Funds.toArray();
      const iface = Permit2__factory.createInterface();
      const calls: core.contracts.Multicall2.CallStruct[] = [];
      for (const fund of funds) {
        calls.push({
          target: this.permit2Address,
          callData: iface.encodeFunctionData('allowance', [account, fund.token.address, spender]),
        });
      }
      const { returnData } = await this.multicall2.callStatic.aggregate(calls);

      for (let i = 0; i < funds.length; i++) {
        const fund = funds[i];
        const [amount, expiration, nonce] = iface.decodeFunctionResult('allowance', returnData[i]);
        if (amount.lt(fund.amountWei) || expiration <= getDeadline(PERMIT_SIG_DEADLINE)) {
          details.push({
            token: funds[i].token.address,
            amount: MaxUint160,
            expiration: getDeadline(PERMIT_EXPIRATION),
            nonce,
          });
        }
      }
    }

    return details;
  }

  getPermit(details: PermitDetails[], spender: string): PermitBatch {
    return { details, spender, sigDeadline: getDeadline(PERMIT_SIG_DEADLINE) };
  }

  getPermitData(permit: PermitBatch) {
    return AllowanceTransfer.getPermitData(permit, this.permit2Address, this.chainId);
  }

  async getLogic(options: RouterPermitTokenLogicGetLogicOptions) {
    const { account, permit, sig } = options;

    const to = this.permit2Address;
    const data = Permit2__factory.createInterface().encodeFunctionData(
      'permit(address,((address,uint160,uint48,uint48)[],address,uint256),bytes)',
      [account, permit, sig]
    );

    return rt.logics.newLogic({ to, data });
  }
}
