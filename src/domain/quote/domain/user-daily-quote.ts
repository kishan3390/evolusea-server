import { EntityIdGenerator } from '@building-blocks/domain';
import { QuotePoolItem } from './quote-pool-item';

export interface UserDailyQuoteCreateArgs {
  userProfileId: string;
  quotePoolId: string;
  date: string;
  orderIndex: number;
  entityIdGenerator: EntityIdGenerator;
}

export class UserDailyQuote {
  private readonly id: string;
  private readonly userProfileId: string;
  private readonly quotePoolId: string;
  private readonly date: string;
  private readonly orderIndex: number;
  private readonly createdAt: Date;
  private quotePoolItem?: QuotePoolItem;

  constructor(props: {
    id: string;
    userProfileId: string;
    quotePoolId: string;
    date: string;
    orderIndex: number;
    createdAt: Date;
    quotePoolItem?: QuotePoolItem;
  }) {
    this.id = props.id;
    this.userProfileId = props.userProfileId;
    this.quotePoolId = props.quotePoolId;
    this.date = props.date;
    this.orderIndex = props.orderIndex;
    this.createdAt = props.createdAt;
    this.quotePoolItem = props.quotePoolItem;
  }

  static create(args: UserDailyQuoteCreateArgs): UserDailyQuote {
    return new UserDailyQuote({
      id: args.entityIdGenerator.generate(),
      userProfileId: args.userProfileId,
      quotePoolId: args.quotePoolId,
      date: args.date,
      orderIndex: args.orderIndex,
      createdAt: new Date(),
    });
  }

  getId(): string {
    return this.id;
  }

  getUserProfileId(): string {
    return this.userProfileId;
  }

  getQuotePoolId(): string {
    return this.quotePoolId;
  }

  getDate(): string {
    return this.date;
  }

  getOrderIndex(): number {
    return this.orderIndex;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getQuotePoolItem(): QuotePoolItem | undefined {
    return this.quotePoolItem;
  }

  setQuotePoolItem(item: QuotePoolItem): void {
    this.quotePoolItem = item;
  }
}
