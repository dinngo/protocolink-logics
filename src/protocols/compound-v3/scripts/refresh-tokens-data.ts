import { Service } from '../service';
import * as common from '@composable-router/common';
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
      const [cToken, baseToken] = await service.getTokens([market.cTokenAddress, market.baseTokenAddress]);
      tokenMap[cToken.symbol] = cToken;
      const unwrappedBaseToken = baseToken.unwrapped;
      tokenMap[unwrappedBaseToken.symbol] = unwrappedBaseToken;

      const collaterals = await service.getCollaterals(cToken);
      for (const collateral of collaterals) {
        tokenMap[collateral.symbol] = collateral;
      }
    }

    const tokenDataPath = resolve(__dirname, '..', 'tokens', 'data', `${common.getNetworkId(chainId)}.json`);
    fs.outputJSONSync(tokenDataPath, tokenMap, { spaces: 2 });
  }
}
