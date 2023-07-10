import { Service } from '../service';
import * as common from '@protocolink/common';
import fs from 'fs-extra';
import { getMarkets, supportedChainIds } from '../configs';
import { resolve } from 'path';

export default async function () {
  for (const chainId of supportedChainIds) {
    const markets = getMarkets(chainId);
    const service = new Service(chainId);

    const tokenMap: Record<string, common.Token> = {};
    for (const market of markets) {
      const { cToken, baseToken } = await service.getCometTokens(market.id);
      tokenMap[cToken.symbol] = cToken;
      tokenMap[baseToken.symbol] = baseToken;
      if (baseToken.isWrapped) {
        const unwrappedBaseToken = baseToken.unwrapped;
        tokenMap[unwrappedBaseToken.symbol] = unwrappedBaseToken;
      }

      const collaterals = await service.getCollaterals(market.id);
      for (const collateral of collaterals) {
        tokenMap[collateral.symbol] = collateral;
      }
    }

    const tokenDataPath = resolve(__dirname, '..', 'tokens', 'data', `${common.toNetworkId(chainId)}.json`);
    fs.outputJSONSync(tokenDataPath, tokenMap, { spaces: 2 });
  }
}
