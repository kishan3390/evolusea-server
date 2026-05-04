import { BusinessRulable } from './business-rulable';

export abstract class ValueObject<Props> extends BusinessRulable {
  abstract getProps(): Props;
}
