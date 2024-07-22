import { DepositLogicTokenList } from './logic.deposit';
import { WithdrawLogicTokenList } from './logic.withdraw';

export function createDepositTokenList(reserveTokens: any[], tokenKey: 'aToken' | 'rToken'): DepositLogicTokenList {
  return reserveTokens.flatMap((reserveToken) => {
    const tokenList: DepositLogicTokenList = [];

    if (reserveToken.asset.isWrapped) {
      tokenList.push([reserveToken.asset.unwrapped, reserveToken[tokenKey]]);
    }
    tokenList.push([reserveToken.asset, reserveToken[tokenKey]]);

    return tokenList;
  });
}

export function createWithdrawTokenList(reserveTokens: any[], tokenKey: 'aToken' | 'rToken'): WithdrawLogicTokenList {
  return reserveTokens.flatMap((reserveToken) => {
    const tokenList: WithdrawLogicTokenList = [];

    if (reserveToken.asset.isWrapped) {
      tokenList.push([reserveToken[tokenKey], reserveToken.asset.unwrapped]);
    }
    tokenList.push([reserveToken[tokenKey], reserveToken.asset]);

    return tokenList;
  });
}
