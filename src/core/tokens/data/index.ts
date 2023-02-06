import mainnetJSON from './mainnet.json';
import { toTokenMap } from '../token';

type MainnetTokenSymbols = keyof typeof mainnetJSON;

export const mainnet = toTokenMap<MainnetTokenSymbols>(mainnetJSON);
