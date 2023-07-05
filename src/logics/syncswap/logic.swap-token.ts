import { BigNumber, constants } from 'ethers';
import { RouteHelper__factory, Router__factory } from './contracts';
import { SwapPath } from './types';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { findAllPossiblePaths, findBestAmountFromPaths, normalizeRoutePools, toSwapPaths } from './utils';
import { getConfig, getContractAddress, supportedChainIds } from './configs';

export type SwapTokenLogicTokenList = common.Token[];

export type SwapTokenLogicParams = core.TokenToTokenExactInParams<{ slippage?: number }>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<{ paths: SwapPath[]; slippage?: number }>;

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class SwapTokenLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    return getConfig(this.chainId).tokens;
  }

  async quote(params: SwapTokenLogicParams) {
    const { input, tokenOut } = params;
    const tokenInAddress = input.token.wrapped.address;
    const tokenOutAddress = tokenOut.wrapped.address;

    const config = getConfig(this.chainId);
    const routeHelper = RouteHelper__factory.connect(config.contract.RouteHelper, this.provider);
    const routePools = await routeHelper.getRoutePools(
      tokenInAddress,
      tokenOutAddress,
      [config.contract.ClassicPoolFactory, config.contract.StablePoolFactory],
      config.baseTokenAddresses,
      config.contract.PoolMaster,
      constants.AddressZero
    );
    const paths = findAllPossiblePaths(
      tokenInAddress,
      tokenOutAddress,
      normalizeRoutePools(routePools),
      config.baseTokenAddresses
    );
    const bestAmount = await findBestAmountFromPaths(this.chainId, paths, input.amountWei);
    const output = new common.TokenAmount(tokenOut).setWei(bestAmount.amountOut);

    return { input, output, paths: bestAmount.paths };
  }

  // https://syncswap.gitbook.io/api-documentation/guides/request-swap-with-router/swap-eth-for-dai
  async build(fields: SwapTokenLogicFields, options: SwapTokenLogicOptions) {
    const { input, output, slippage, paths } = fields;
    const { account } = options;
    const userAgent = core.calcAccountAgent(this.chainId, account);

    const swapPaths = toSwapPaths(paths, userAgent);
    const amountOutMin = slippage ? common.calcSlippage(output.amountWei, slippage) : output.amountWei;
    const deadline = BigNumber.from(Math.floor(Date.now() / 1000)).add(1800); // 30m
    const data = Router__factory.createInterface().encodeFunctionData('swap', [swapPaths, amountOutMin, deadline]);

    const inputs = [core.newLogicInput({ input: new common.TokenAmount(input.token.wrapped, input.amount) })];

    const wrapMode = input.token.isNative
      ? core.WrapMode.wrapBefore
      : output.token.isNative
      ? core.WrapMode.unwrapAfter
      : core.WrapMode.none;

    return core.newLogic({ to: getContractAddress(this.chainId, 'Router'), data, inputs, wrapMode });
  }
}
