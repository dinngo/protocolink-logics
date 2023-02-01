import { BigNumber, BigNumberish, utils } from 'ethers';
import { ToBigUnitOptions, toBigUnit, toSmallUnit } from './bignumber';

describe('Test toSmallUnit', () => {
  test.each<{ name: string; amount: string; decimals: number; expected: BigNumberish }>([
    {
      name: '1 ETH',
      amount: '1',
      decimals: 18,
      expected: BigNumber.from(10).pow(18),
    },
    {
      name: '1 USDC',
      amount: '1',
      decimals: 6,
      expected: 1e6,
    },
    {
      name: '1 CHI',
      amount: '1',
      decimals: 1,
      expected: 10,
    },
  ])('case $#: $name', async ({ amount, decimals, expected }) => {
    expect(toSmallUnit(amount, decimals).eq(expected)).toBeTruthy();
  });
});

describe('Test toBigUnit', () => {
  test.each<{ name: string; amountWei: BigNumberish; decimals: number; options?: ToBigUnitOptions; expected: string }>([
    {
      name: '1 ETH',
      amountWei: BigNumber.from(10).pow(18),
      decimals: 18,
      expected: '1',
    },
    {
      name: '1 USDC',
      amountWei: BigNumber.from(1e6),
      decimals: 6,
      expected: '1',
    },
    {
      name: '1 CHI',
      amountWei: BigNumber.from(10),
      decimals: 1,
      expected: '1',
    },
    {
      name: 'round',
      amountWei: BigNumber.from(2345).mul(BigNumber.from(10).pow(15)),
      decimals: 18,
      options: { displayDecimals: 2, mode: 'round' },
      expected: '2.35',
    },
    {
      name: 'ceil',
      amountWei: BigNumber.from(2341).mul(BigNumber.from(10).pow(15)),
      decimals: 18,
      options: { displayDecimals: 2, mode: 'ceil' },
      expected: '2.35',
    },
    {
      name: 'floor',
      amountWei: BigNumber.from(2345).mul(BigNumber.from(10).pow(15)),
      decimals: 18,
      options: { displayDecimals: 2, mode: 'floor' },
      expected: '2.34',
    },
    {
      name: 'negative',
      amountWei: BigNumber.from(2345).mul(BigNumber.from(10).pow(15)).mul(-1),
      decimals: 18,
      options: { displayDecimals: 3 },
      expected: '-2.345',
    },
    {
      name: 'round 0.99959',
      amountWei: BigNumber.from(99959),
      decimals: 5,
      options: { displayDecimals: 3, mode: 'round' },
      expected: '1',
    },
    {
      name: 'ceil 0.99949',
      amountWei: BigNumber.from(99949),
      decimals: 5,
      options: { displayDecimals: 3, mode: 'ceil' },
      expected: '1',
    },
    {
      name: '96.096',
      amountWei: BigNumber.from('960968427608232789'),
      decimals: 16,
      options: { displayDecimals: 2, mode: 'round' },
      expected: '96.1',
    },
    {
      name: '0.006',
      amountWei: BigNumber.from('68427608232789'),
      decimals: 16,
      options: { displayDecimals: 2, mode: 'round' },
      expected: '0.01',
    },
    {
      name: 'CEL decimals 4',
      amountWei: BigNumber.from('1000000'),
      decimals: 4,
      options: { displayDecimals: 5 },
      expected: '100',
    },
    {
      name: '1000001071195923456',
      amountWei: BigNumber.from('1000001071195923456'),
      decimals: 18,
      options: { displayDecimals: 5 },
      expected: '1',
    },
    {
      name: '1000001071195923456 ceil',
      amountWei: BigNumber.from('1000001071195923456'),
      decimals: 18,
      options: { displayDecimals: 5, mode: 'ceil' },
      expected: '1.00001',
    },
    {
      name: '0.450700378639366919',
      amountWei: BigNumber.from(utils.parseUnits('0.450700378639366919', 18)),
      decimals: 18,
      options: { displayDecimals: 5, mode: 'ceil' },
      expected: '0.45071',
    },
    {
      name: '0.000000962931699371',
      amountWei: BigNumber.from(utils.parseUnits('0.000000962931699371', 18)),
      decimals: 18,
      options: { displayDecimals: 5 },
      expected: '0',
    },
  ])('case $#: $name', async ({ amountWei, decimals, options, expected }) => {
    expect(toBigUnit(amountWei, decimals, options)).toBe(expected);
  });
});
