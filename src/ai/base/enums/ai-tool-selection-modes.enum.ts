export enum AiToolSelectionModes {
  /**
   * Tool call might be skipped depending on the model decision
   */
  AllCallsOptional = 'all-calls-optional',

  /**
   * One of the defined tools must be called
   */
  AnyCallRequired = 'any-call-required',
}
