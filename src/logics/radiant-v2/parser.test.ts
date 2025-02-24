import { expect } from 'chai';
import { parseReserveConfiguration } from './parser';

describe('Radiant V2 Configuration Parser', () => {
  it('should correctly parse reserve configuration', () => {
    // https://arbiscan.io/address/0xE23B4AE3624fB6f7cDEF29bC8EAD912f1Ede6886#readProxyContract#F7
    const mockConfiguration = {
      data: '138350943141984255875928',
    };

    const result = parseReserveConfiguration(mockConfiguration);

    expect(result).to.deep.equal({
      ltv: 7000,
      liquidationThreshold: 7500,
      liquidationBonus: 11500,
      decimals: 1280,
      isActive: true,
      isFrozen: false,
      borrowingEnabled: true,
      stableBorrowingEnabled: false,
      reserveFactor: 7424,
    });
  });
});
