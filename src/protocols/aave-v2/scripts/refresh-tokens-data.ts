import { AaveV2Service } from '../service';
import * as core from 'src/core';
import fs from 'fs-extra';
import { resolve } from 'path';

export default async function () {
  const chainIds = [core.network.ChainId.mainnet];

  for (const chainId of chainIds) {
    const aavev2 = new AaveV2Service({ chainId });
    const assets = await aavev2.getAssets();
    const aTokens = await aavev2.getATokens();

    const tokenMap = assets.reduce((accumulator, asset, i) => {
      accumulator[asset.symbol] = asset;
      const aToken = aTokens[i];
      accumulator[aToken.symbol] = aToken;
      return accumulator;
    }, {} as Record<string, core.tokens.Token>);

    const tokenDataPath = resolve(__dirname, '..', 'tokens', 'data', `${core.network.getNetworkId(chainId)}.json`);
    fs.outputJSONSync(tokenDataPath, tokenMap, { spaces: 2 });
  }
}
