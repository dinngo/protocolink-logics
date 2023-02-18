import { Service } from '../service';
import * as common from '@composable-router/common';
import fs from 'fs-extra';
import { resolve } from 'path';

export default async function () {
  const chainIds = [common.ChainId.mainnet];

  for (const chainId of chainIds) {
    const aaveV2Service = new Service(chainId);
    const assets = await aaveV2Service.getAssets();
    const aTokens = await aaveV2Service.getATokens();

    const tokenMap = assets.reduce((accumulator, asset, i) => {
      accumulator[asset.symbol] = asset;
      const aToken = aTokens[i];
      accumulator[aToken.symbol] = aToken;
      return accumulator;
    }, {} as Record<string, common.Token>);

    const tokenDataPath = resolve(__dirname, '..', 'tokens', 'data', `${common.getNetworkId(chainId)}.json`);
    fs.outputJSONSync(tokenDataPath, tokenMap, { spaces: 2 });
  }
}
