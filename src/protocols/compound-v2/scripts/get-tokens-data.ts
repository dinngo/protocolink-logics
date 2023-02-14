import { CompoundV2Service } from '../service';
import * as core from 'src/core';
import fs from 'fs-extra';
import { resolve } from 'path';

const cTokenAddresses = [
  '0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c', // cAAVE
  '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E', // cBAT
  '0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4', // cCOMP
  '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', // cDAI
  '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5', // cETH
  '0x7713DD9Ca933848F6819F38B8352D9A15EA73F67', // cFEI
  '0xFAce851a4921ce59e912d19329929CE6da6EB0c7', // cLINK
  '0x95b4eF2869eBD94BEb4eEE400a99824BF5DC325b', // cMKR
  '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1', // cREP
  '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC', // cSAI
  '0x4B0181102A0112A2ef11AbEE5563bb4a3176c9d7', // cSUSHI
  '0x12392F67bdf24faE0AF363c24aC620a2f67DAd86', // cTUSD
  '0x35A18000230DA775CAc24873d00Ff85BccdeD550', // cUNI
  '0x39AA39c021dfbaE8faC545936693aC917d5E7563', // cUSDC
  '0x041171993284df560249B57358F931D9eB7b925D', // cUSDP
  '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9', // cUSDT
  '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4', // cWBTC
  '0xccF4429DB6322D5C611ee964527D42E5d685DD6a', // cWBTC2
  '0x80a2AE356fc9ef4305676f7a3E2Ed04e12C33946', // cYFI
  '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407', // cZRX
];

export default async function () {
  const chainId = core.network.ChainId.mainnet;
  const compoundV2Service = new CompoundV2Service({ chainId });

  const cTokens = await compoundV2Service.getTokens(cTokenAddresses);
  const underlyingTokens = await compoundV2Service.toUnderlyingTokens(cTokens);

  const cTokenMap: Record<string, core.tokens.Token> = {};
  const underlyingTokenMap: Record<string, core.tokens.Token> = {};
  cTokens.forEach((cToken, i) => {
    cTokenMap[cToken.symbol] = cToken;
    const underlyingToken = underlyingTokens[i];
    underlyingTokenMap[underlyingToken.symbol] = underlyingToken;
  });

  const cTokenDataPath = resolve(__dirname, '..', 'tokens', 'data', 'cTokens.json');
  fs.outputJSONSync(cTokenDataPath, cTokenMap, { spaces: 2 });
  const underlyingTokenDataPath = resolve(__dirname, '..', 'tokens', 'data', 'underlyingTokens.json');
  fs.outputJSONSync(underlyingTokenDataPath, underlyingTokenMap, { spaces: 2 });
}
