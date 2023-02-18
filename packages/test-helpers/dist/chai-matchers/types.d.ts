/// <reference types="chai" />
declare namespace Chai {
    interface Assertion extends LanguageChains, NumericComparison, TypeComparison {
        changeBalance(token: any, balance: any, slippage?: number): AsyncAssertion;
    }
}
