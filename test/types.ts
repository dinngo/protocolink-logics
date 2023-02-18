export interface LogicTestCaseWithoutOptions<TField> {
  fields: TField;
}
export interface LogicTestCaseWithOptions<TField, TOptions> extends LogicTestCaseWithoutOptions<TField> {
  options: TOptions;
}

export type LogicTestCase<TField, TOptions = void> = TOptions extends void
  ? LogicTestCaseWithoutOptions<TField>
  : LogicTestCaseWithOptions<TField, TOptions>;
