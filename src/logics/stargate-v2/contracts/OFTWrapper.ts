/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from 'ethers';
import type { FunctionFragment, Result, EventFragment } from '@ethersproject/abi';
import type { Listener, Provider } from '@ethersproject/providers';
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from './common';

export declare namespace IOFTWrapper {
  export type FeeObjStruct = {
    callerBps: BigNumberish;
    caller: string;
    partnerId: BytesLike;
  };

  export type FeeObjStructOutput = [BigNumber, string, string] & {
    callerBps: BigNumber;
    caller: string;
    partnerId: string;
  };
}

export declare namespace ICommonOFT {
  export type LzCallParamsStruct = {
    refundAddress: string;
    zroPaymentAddress: string;
    adapterParams: BytesLike;
  };

  export type LzCallParamsStructOutput = [string, string, string] & {
    refundAddress: string;
    zroPaymentAddress: string;
    adapterParams: string;
  };
}

export interface OFTWrapperInterface extends utils.Interface {
  functions: {
    'BPS_DENOMINATOR()': FunctionFragment;
    'MAX_UINT()': FunctionFragment;
    'defaultBps()': FunctionFragment;
    'estimateSendFee(address,uint16,bytes,uint256,bool,bytes,(uint256,address,bytes2))': FunctionFragment;
    'estimateSendFeeV2(address,uint16,bytes32,uint256,bool,bytes,(uint256,address,bytes2))': FunctionFragment;
    'getAmountAndFees(address,uint256,uint256)': FunctionFragment;
    'oftBps(address)': FunctionFragment;
    'owner()': FunctionFragment;
    'renounceOwnership()': FunctionFragment;
    'sendOFT(address,uint16,bytes,uint256,uint256,address,address,bytes,(uint256,address,bytes2))': FunctionFragment;
    'sendOFTFeeV2(address,uint16,bytes32,uint256,uint256,(address,address,bytes),(uint256,address,bytes2))': FunctionFragment;
    'sendOFTV2(address,uint16,bytes32,uint256,uint256,(address,address,bytes),(uint256,address,bytes2))': FunctionFragment;
    'sendProxyOFT(address,uint16,bytes,uint256,uint256,address,address,bytes,(uint256,address,bytes2))': FunctionFragment;
    'sendProxyOFTFeeV2(address,uint16,bytes32,uint256,uint256,(address,address,bytes),(uint256,address,bytes2))': FunctionFragment;
    'sendProxyOFTV2(address,uint16,bytes32,uint256,uint256,(address,address,bytes),(uint256,address,bytes2))': FunctionFragment;
    'setDefaultBps(uint256)': FunctionFragment;
    'setOFTBps(address,uint256)': FunctionFragment;
    'transferOwnership(address)': FunctionFragment;
    'withdrawFees(address,address,uint256)': FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | 'BPS_DENOMINATOR'
      | 'MAX_UINT'
      | 'defaultBps'
      | 'estimateSendFee'
      | 'estimateSendFeeV2'
      | 'getAmountAndFees'
      | 'oftBps'
      | 'owner'
      | 'renounceOwnership'
      | 'sendOFT'
      | 'sendOFTFeeV2'
      | 'sendOFTV2'
      | 'sendProxyOFT'
      | 'sendProxyOFTFeeV2'
      | 'sendProxyOFTV2'
      | 'setDefaultBps'
      | 'setOFTBps'
      | 'transferOwnership'
      | 'withdrawFees'
  ): FunctionFragment;

  encodeFunctionData(functionFragment: 'BPS_DENOMINATOR', values?: undefined): string;
  encodeFunctionData(functionFragment: 'MAX_UINT', values?: undefined): string;
  encodeFunctionData(functionFragment: 'defaultBps', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'estimateSendFee',
    values: [string, BigNumberish, BytesLike, BigNumberish, boolean, BytesLike, IOFTWrapper.FeeObjStruct]
  ): string;
  encodeFunctionData(
    functionFragment: 'estimateSendFeeV2',
    values: [string, BigNumberish, BytesLike, BigNumberish, boolean, BytesLike, IOFTWrapper.FeeObjStruct]
  ): string;
  encodeFunctionData(functionFragment: 'getAmountAndFees', values: [string, BigNumberish, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'oftBps', values: [string]): string;
  encodeFunctionData(functionFragment: 'owner', values?: undefined): string;
  encodeFunctionData(functionFragment: 'renounceOwnership', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'sendOFT',
    values: [
      string,
      BigNumberish,
      BytesLike,
      BigNumberish,
      BigNumberish,
      string,
      string,
      BytesLike,
      IOFTWrapper.FeeObjStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: 'sendOFTFeeV2',
    values: [
      string,
      BigNumberish,
      BytesLike,
      BigNumberish,
      BigNumberish,
      ICommonOFT.LzCallParamsStruct,
      IOFTWrapper.FeeObjStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: 'sendOFTV2',
    values: [
      string,
      BigNumberish,
      BytesLike,
      BigNumberish,
      BigNumberish,
      ICommonOFT.LzCallParamsStruct,
      IOFTWrapper.FeeObjStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: 'sendProxyOFT',
    values: [
      string,
      BigNumberish,
      BytesLike,
      BigNumberish,
      BigNumberish,
      string,
      string,
      BytesLike,
      IOFTWrapper.FeeObjStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: 'sendProxyOFTFeeV2',
    values: [
      string,
      BigNumberish,
      BytesLike,
      BigNumberish,
      BigNumberish,
      ICommonOFT.LzCallParamsStruct,
      IOFTWrapper.FeeObjStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: 'sendProxyOFTV2',
    values: [
      string,
      BigNumberish,
      BytesLike,
      BigNumberish,
      BigNumberish,
      ICommonOFT.LzCallParamsStruct,
      IOFTWrapper.FeeObjStruct
    ]
  ): string;
  encodeFunctionData(functionFragment: 'setDefaultBps', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'setOFTBps', values: [string, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'transferOwnership', values: [string]): string;
  encodeFunctionData(functionFragment: 'withdrawFees', values: [string, string, BigNumberish]): string;

  decodeFunctionResult(functionFragment: 'BPS_DENOMINATOR', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'MAX_UINT', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'defaultBps', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'estimateSendFee', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'estimateSendFeeV2', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getAmountAndFees', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'oftBps', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'owner', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'renounceOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'sendOFT', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'sendOFTFeeV2', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'sendOFTV2', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'sendProxyOFT', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'sendProxyOFTFeeV2', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'sendProxyOFTV2', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setDefaultBps', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setOFTBps', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'withdrawFees', data: BytesLike): Result;

  events: {
    'OwnershipTransferred(address,address)': EventFragment;
    'WrapperFeeWithdrawn(address,address,uint256)': EventFragment;
    'WrapperFees(bytes2,address,uint256,uint256)': EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: 'OwnershipTransferred'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'WrapperFeeWithdrawn'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'WrapperFees'): EventFragment;
}

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<[string, string], OwnershipTransferredEventObject>;

export type OwnershipTransferredEventFilter = TypedEventFilter<OwnershipTransferredEvent>;

export interface WrapperFeeWithdrawnEventObject {
  oft: string;
  to: string;
  amount: BigNumber;
}
export type WrapperFeeWithdrawnEvent = TypedEvent<[string, string, BigNumber], WrapperFeeWithdrawnEventObject>;

export type WrapperFeeWithdrawnEventFilter = TypedEventFilter<WrapperFeeWithdrawnEvent>;

export interface WrapperFeesEventObject {
  partnerId: string;
  token: string;
  wrapperFee: BigNumber;
  callerFee: BigNumber;
}
export type WrapperFeesEvent = TypedEvent<[string, string, BigNumber, BigNumber], WrapperFeesEventObject>;

export type WrapperFeesEventFilter = TypedEventFilter<WrapperFeesEvent>;

export interface OFTWrapper extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: OFTWrapperInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    BPS_DENOMINATOR(overrides?: CallOverrides): Promise<[BigNumber]>;

    MAX_UINT(overrides?: CallOverrides): Promise<[BigNumber]>;

    defaultBps(overrides?: CallOverrides): Promise<[BigNumber]>;

    estimateSendFee(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _useZro: boolean,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber] & { nativeFee: BigNumber; zroFee: BigNumber }>;

    estimateSendFeeV2(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _useZro: boolean,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber] & { nativeFee: BigNumber; zroFee: BigNumber }>;

    getAmountAndFees(
      _token: string,
      _amount: BigNumberish,
      _callerBps: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        amount: BigNumber;
        wrapperFee: BigNumber;
        callerFee: BigNumber;
      }
    >;

    oftBps(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(overrides?: Overrides & { from?: string }): Promise<ContractTransaction>;

    sendOFT(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _refundAddress: string,
      _zroPaymentAddress: string,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<ContractTransaction>;

    sendOFTFeeV2(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<ContractTransaction>;

    sendOFTV2(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<ContractTransaction>;

    sendProxyOFT(
      _proxyOft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _refundAddress: string,
      _zroPaymentAddress: string,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<ContractTransaction>;

    sendProxyOFTFeeV2(
      _proxyOft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<ContractTransaction>;

    sendProxyOFTV2(
      _proxyOft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<ContractTransaction>;

    setDefaultBps(_defaultBps: BigNumberish, overrides?: Overrides & { from?: string }): Promise<ContractTransaction>;

    setOFTBps(
      _token: string,
      _bps: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    transferOwnership(newOwner: string, overrides?: Overrides & { from?: string }): Promise<ContractTransaction>;

    withdrawFees(
      _oft: string,
      _to: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  BPS_DENOMINATOR(overrides?: CallOverrides): Promise<BigNumber>;

  MAX_UINT(overrides?: CallOverrides): Promise<BigNumber>;

  defaultBps(overrides?: CallOverrides): Promise<BigNumber>;

  estimateSendFee(
    _oft: string,
    _dstChainId: BigNumberish,
    _toAddress: BytesLike,
    _amount: BigNumberish,
    _useZro: boolean,
    _adapterParams: BytesLike,
    _feeObj: IOFTWrapper.FeeObjStruct,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber] & { nativeFee: BigNumber; zroFee: BigNumber }>;

  estimateSendFeeV2(
    _oft: string,
    _dstChainId: BigNumberish,
    _toAddress: BytesLike,
    _amount: BigNumberish,
    _useZro: boolean,
    _adapterParams: BytesLike,
    _feeObj: IOFTWrapper.FeeObjStruct,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber] & { nativeFee: BigNumber; zroFee: BigNumber }>;

  getAmountAndFees(
    _token: string,
    _amount: BigNumberish,
    _callerBps: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber] & {
      amount: BigNumber;
      wrapperFee: BigNumber;
      callerFee: BigNumber;
    }
  >;

  oftBps(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(overrides?: Overrides & { from?: string }): Promise<ContractTransaction>;

  sendOFT(
    _oft: string,
    _dstChainId: BigNumberish,
    _toAddress: BytesLike,
    _amount: BigNumberish,
    _minAmount: BigNumberish,
    _refundAddress: string,
    _zroPaymentAddress: string,
    _adapterParams: BytesLike,
    _feeObj: IOFTWrapper.FeeObjStruct,
    overrides?: PayableOverrides & { from?: string }
  ): Promise<ContractTransaction>;

  sendOFTFeeV2(
    _oft: string,
    _dstChainId: BigNumberish,
    _toAddress: BytesLike,
    _amount: BigNumberish,
    _minAmount: BigNumberish,
    _callParams: ICommonOFT.LzCallParamsStruct,
    _feeObj: IOFTWrapper.FeeObjStruct,
    overrides?: PayableOverrides & { from?: string }
  ): Promise<ContractTransaction>;

  sendOFTV2(
    _oft: string,
    _dstChainId: BigNumberish,
    _toAddress: BytesLike,
    _amount: BigNumberish,
    _minAmount: BigNumberish,
    _callParams: ICommonOFT.LzCallParamsStruct,
    _feeObj: IOFTWrapper.FeeObjStruct,
    overrides?: PayableOverrides & { from?: string }
  ): Promise<ContractTransaction>;

  sendProxyOFT(
    _proxyOft: string,
    _dstChainId: BigNumberish,
    _toAddress: BytesLike,
    _amount: BigNumberish,
    _minAmount: BigNumberish,
    _refundAddress: string,
    _zroPaymentAddress: string,
    _adapterParams: BytesLike,
    _feeObj: IOFTWrapper.FeeObjStruct,
    overrides?: PayableOverrides & { from?: string }
  ): Promise<ContractTransaction>;

  sendProxyOFTFeeV2(
    _proxyOft: string,
    _dstChainId: BigNumberish,
    _toAddress: BytesLike,
    _amount: BigNumberish,
    _minAmount: BigNumberish,
    _callParams: ICommonOFT.LzCallParamsStruct,
    _feeObj: IOFTWrapper.FeeObjStruct,
    overrides?: PayableOverrides & { from?: string }
  ): Promise<ContractTransaction>;

  sendProxyOFTV2(
    _proxyOft: string,
    _dstChainId: BigNumberish,
    _toAddress: BytesLike,
    _amount: BigNumberish,
    _minAmount: BigNumberish,
    _callParams: ICommonOFT.LzCallParamsStruct,
    _feeObj: IOFTWrapper.FeeObjStruct,
    overrides?: PayableOverrides & { from?: string }
  ): Promise<ContractTransaction>;

  setDefaultBps(_defaultBps: BigNumberish, overrides?: Overrides & { from?: string }): Promise<ContractTransaction>;

  setOFTBps(
    _token: string,
    _bps: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  transferOwnership(newOwner: string, overrides?: Overrides & { from?: string }): Promise<ContractTransaction>;

  withdrawFees(
    _oft: string,
    _to: string,
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    BPS_DENOMINATOR(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_UINT(overrides?: CallOverrides): Promise<BigNumber>;

    defaultBps(overrides?: CallOverrides): Promise<BigNumber>;

    estimateSendFee(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _useZro: boolean,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber] & { nativeFee: BigNumber; zroFee: BigNumber }>;

    estimateSendFeeV2(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _useZro: boolean,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber] & { nativeFee: BigNumber; zroFee: BigNumber }>;

    getAmountAndFees(
      _token: string,
      _amount: BigNumberish,
      _callerBps: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        amount: BigNumber;
        wrapperFee: BigNumber;
        callerFee: BigNumber;
      }
    >;

    oftBps(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    sendOFT(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _refundAddress: string,
      _zroPaymentAddress: string,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    sendOFTFeeV2(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    sendOFTV2(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    sendProxyOFT(
      _proxyOft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _refundAddress: string,
      _zroPaymentAddress: string,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    sendProxyOFTFeeV2(
      _proxyOft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    sendProxyOFTV2(
      _proxyOft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    setDefaultBps(_defaultBps: BigNumberish, overrides?: CallOverrides): Promise<void>;

    setOFTBps(_token: string, _bps: BigNumberish, overrides?: CallOverrides): Promise<void>;

    transferOwnership(newOwner: string, overrides?: CallOverrides): Promise<void>;

    withdrawFees(_oft: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    'OwnershipTransferred(address,address)'(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): OwnershipTransferredEventFilter;

    'WrapperFeeWithdrawn(address,address,uint256)'(
      oft?: string | null,
      to?: null,
      amount?: null
    ): WrapperFeeWithdrawnEventFilter;
    WrapperFeeWithdrawn(oft?: string | null, to?: null, amount?: null): WrapperFeeWithdrawnEventFilter;

    'WrapperFees(bytes2,address,uint256,uint256)'(
      partnerId?: BytesLike | null,
      token?: null,
      wrapperFee?: null,
      callerFee?: null
    ): WrapperFeesEventFilter;
    WrapperFees(
      partnerId?: BytesLike | null,
      token?: null,
      wrapperFee?: null,
      callerFee?: null
    ): WrapperFeesEventFilter;
  };

  estimateGas: {
    BPS_DENOMINATOR(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_UINT(overrides?: CallOverrides): Promise<BigNumber>;

    defaultBps(overrides?: CallOverrides): Promise<BigNumber>;

    estimateSendFee(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _useZro: boolean,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    estimateSendFeeV2(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _useZro: boolean,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAmountAndFees(
      _token: string,
      _amount: BigNumberish,
      _callerBps: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    oftBps(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(overrides?: Overrides & { from?: string }): Promise<BigNumber>;

    sendOFT(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _refundAddress: string,
      _zroPaymentAddress: string,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<BigNumber>;

    sendOFTFeeV2(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<BigNumber>;

    sendOFTV2(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<BigNumber>;

    sendProxyOFT(
      _proxyOft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _refundAddress: string,
      _zroPaymentAddress: string,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<BigNumber>;

    sendProxyOFTFeeV2(
      _proxyOft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<BigNumber>;

    sendProxyOFTV2(
      _proxyOft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<BigNumber>;

    setDefaultBps(_defaultBps: BigNumberish, overrides?: Overrides & { from?: string }): Promise<BigNumber>;

    setOFTBps(_token: string, _bps: BigNumberish, overrides?: Overrides & { from?: string }): Promise<BigNumber>;

    transferOwnership(newOwner: string, overrides?: Overrides & { from?: string }): Promise<BigNumber>;

    withdrawFees(
      _oft: string,
      _to: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    BPS_DENOMINATOR(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    MAX_UINT(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    defaultBps(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    estimateSendFee(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _useZro: boolean,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    estimateSendFeeV2(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _useZro: boolean,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAmountAndFees(
      _token: string,
      _amount: BigNumberish,
      _callerBps: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    oftBps(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(overrides?: Overrides & { from?: string }): Promise<PopulatedTransaction>;

    sendOFT(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _refundAddress: string,
      _zroPaymentAddress: string,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    sendOFTFeeV2(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    sendOFTV2(
      _oft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    sendProxyOFT(
      _proxyOft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _refundAddress: string,
      _zroPaymentAddress: string,
      _adapterParams: BytesLike,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    sendProxyOFTFeeV2(
      _proxyOft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    sendProxyOFTV2(
      _proxyOft: string,
      _dstChainId: BigNumberish,
      _toAddress: BytesLike,
      _amount: BigNumberish,
      _minAmount: BigNumberish,
      _callParams: ICommonOFT.LzCallParamsStruct,
      _feeObj: IOFTWrapper.FeeObjStruct,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setDefaultBps(_defaultBps: BigNumberish, overrides?: Overrides & { from?: string }): Promise<PopulatedTransaction>;

    setOFTBps(
      _token: string,
      _bps: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    transferOwnership(newOwner: string, overrides?: Overrides & { from?: string }): Promise<PopulatedTransaction>;

    withdrawFees(
      _oft: string,
      _to: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}
