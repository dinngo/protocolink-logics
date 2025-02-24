/**
 * This module handles the parsing of Radiant V2 reserve configuration data.
 *
 * Background:
 * Due to the deprecation of aaveProtocolDataProvider in Radiant V2,
 * reserve configuration data can only be obtained through the getLendingPool().getReserveData() method.
 * The configuration returned is packed into a single uint256 value where different bits represent different settings.
 * This parser is necessary to decode these bit-packed values into readable configuration parameters.
 *
 * Reference:
 * @see https://github.com/radiant-capital/radiant-protocol/blob/3e58ca80b7c2f18abe559412a2389b968bbb4649/contracts/protocol/libraries/types/DataTypes.sol#L30
 */

interface ReserveConfiguration {
  ltv: number; // bits 0-15
  liquidationThreshold: number; // bits 16-31
  liquidationBonus: number; // bits 32-47
  decimals: number; // bits 48-55
  isActive: boolean; // bit 56
  isFrozen: boolean; // bit 57
  borrowingEnabled: boolean; // bit 58
  stableBorrowingEnabled: boolean; // bit 59
  reserveFactor: number; // bits 64-79
}

/**
 * Parses the reserve configuration data from Radiant V2 protocol
 * @param configuration - Configuration object containing data field
 * @returns Parsed configuration parameters
 */
export const parseReserveConfiguration = (configuration: any): ReserveConfiguration => {
  // Convert configuration data to BigInt
  const configurationData = BigInt(configuration.data.toString());

  // Define bit masks for different parameters
  const LTV_MASK = BigInt('0xFFFF'); // 16 bits
  const LIQUIDATION_THRESHOLD_MASK = BigInt('0xFFFF0000'); // 16 bits
  const LIQUIDATION_BONUS_MASK = BigInt('0xFFFF00000000'); // 16 bits
  const DECIMALS_MASK = BigInt('0xFF0000000000000'); // 8 bits
  const ACTIVE_MASK = BigInt(1) << BigInt(56); // bit 56
  const FROZEN_MASK = BigInt(1) << BigInt(57); // bit 57
  const BORROWING_MASK = BigInt(1) << BigInt(58); // bit 58
  const STABLE_BORROWING_MASK = BigInt(1) << BigInt(59); // bit 59
  const RESERVE_FACTOR_MASK = BigInt('0xFFFF000000000000000000'); // 16 bits

  // Extract values using bit operations
  const ltv = Number(configurationData & LTV_MASK);
  const liquidationThreshold = Number((configurationData & LIQUIDATION_THRESHOLD_MASK) >> BigInt(16));
  const liquidationBonus = Number((configurationData & LIQUIDATION_BONUS_MASK) >> BigInt(32));
  const decimals = Number((configurationData & DECIMALS_MASK) >> BigInt(48));
  const isActive = (configurationData & ACTIVE_MASK) !== BigInt(0);
  const isFrozen = (configurationData & FROZEN_MASK) !== BigInt(0);
  const borrowingEnabled = (configurationData & BORROWING_MASK) !== BigInt(0);
  const stableBorrowingEnabled = (configurationData & STABLE_BORROWING_MASK) !== BigInt(0);
  const reserveFactor = Number((configurationData & RESERVE_FACTOR_MASK) >> BigInt(64));

  return {
    ltv, // Loan to Value ratio
    liquidationThreshold, // Threshold at which a position is defined as undercollateralized
    liquidationBonus, // Bonus for liquidators
    decimals, // Number of decimals of the underlying asset
    isActive, // Whether the reserve is active
    isFrozen, // Whether the reserve is frozen
    borrowingEnabled, // Whether borrowing is enabled
    stableBorrowingEnabled, // Whether stable rate borrowing is enabled
    reserveFactor, // The portion of borrower's interest that goes to the reserve
  };
};
