import { Service } from '../service';
import * as common from '@furucombo/composable-router-common';
import fs from 'fs-extra';
import { getMarkets } from '../config';
import { resolve } from 'path';

export default async function () {
  const chainIds = [common.ChainId.mainnet, common.ChainId.polygon];
  for (const chainId of chainIds) {
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

    const tokenDataPath = resolve(__dirname, '..', 'tokens', 'data', `${common.getNetworkId(chainId)}.json`);
    fs.outputJSONSync(tokenDataPath, tokenMap, { spaces: 2 });
  }
}
