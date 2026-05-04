import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '@building-blocks/domain';
import { EntitlementsTypes } from '@domain/account/domain/enums';

export interface AccountEntitlementProps extends EntityProps {
  id: string;
  accountId: string;
  type: EntitlementsTypes;
  purchasedAt: Date;
  expiresAt: Date | null;
}

export interface AccountEntitlementCreateArgs {
  accountId: string;
  type: EntitlementsTypes;
  purchasedAt: Date;
  expiresAt: Date | null;
  entityIdGenerator: EntityIdGenerator;
}

export class AccountEntitlement extends Entity<AccountEntitlementProps> {
  private id: string;
  private accountId: string;
  private type: EntitlementsTypes;
  private purchasedAt: Date;
  private expiresAt: Date | null;

  constructor(props: AccountEntitlementProps) {
    super();

    this.id = props.id;
    this.accountId = props.accountId;
    this.type = props.type;
    this.purchasedAt = props.purchasedAt;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    accountId,
    type,
    purchasedAt,
    expiresAt,
    entityIdGenerator,
  }: AccountEntitlementCreateArgs): AccountEntitlement {
    const now = new Date();

    return new AccountEntitlement({
      id: entityIdGenerator.generate(),
      accountId,
      type,
      purchasedAt,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });
  }

  getId(): string {
    return this.id;
  }

  getAccountId(): string {
    return this.accountId;
  }

  getType(): EntitlementsTypes {
    return this.type;
  }

  getPurchasedAt(): Date {
    return this.purchasedAt;
  }

  getExpiresAt(): Date | null {
    return this.expiresAt;
  }

  getIsEntitlementExpired(): boolean {
    return this.expiresAt !== null && this.expiresAt <= new Date();
  }

  setPurchasedAt(purchasedAt: Date) {
    this.purchasedAt = purchasedAt;
    this.entityUpdated();
    return this;
  }

  setExpiresAt(expiresAt: Date | null) {
    this.expiresAt = expiresAt;
    this.entityUpdated();
    return this;
  }

  getProps(): AccountEntitlementProps {
    return {
      id: this.id,
      accountId: this.accountId,
      type: this.type,
      purchasedAt: this.purchasedAt,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): AccountEntitlement {
    return new AccountEntitlement(this.getProps());
  }
}
