import { DomainRuleViolationError } from '../domain-error';
import { AsyncBusinessRule, SyncBusinessRule } from './business-rule';

export abstract class BusinessRulable {
  protected checkRule(rule: SyncBusinessRule) {
    if (rule.isBroken()) {
      throw new DomainRuleViolationError(rule.getMessage(), {
        data: rule.getData?.(),
      });
    }
  }

  protected async checkAsyncRule(rule: AsyncBusinessRule) {
    if (await rule.isBroken()) {
      throw new DomainRuleViolationError(rule.getMessage(), {
        data: rule.getData?.(),
      });
    }
  }

  protected static async checkAsyncRule(rule: AsyncBusinessRule) {
    if (await rule.isBroken()) {
      throw new DomainRuleViolationError(rule.getMessage(), {
        data: rule.getData?.(),
      });
    }
  }

  protected static checkSyncRule(rule: SyncBusinessRule) {
    if (rule.isBroken()) {
      throw new DomainRuleViolationError(rule.getMessage(), {
        data: rule.getData?.(),
      });
    }
  }
}
