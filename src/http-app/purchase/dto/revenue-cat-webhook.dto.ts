import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  Equals,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RevenueCatWebhookEventTypes } from '../../../lib/purchase';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

export abstract class RevenueCatWebhookEventBaseDto {
  @IsEnum(RevenueCatWebhookEventTypes)
  abstract type: RevenueCatWebhookEventTypes;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  app_id: string;

  @IsInt()
  @IsPositive()
  event_timestamp_ms: number;

  @IsString()
  @IsNotEmpty()
  environment: string;

  @IsString()
  @IsNotEmpty()
  store: string;

  @IsObject()
  subscriber_attributes: Record<string, any>;
}

export class RevenueCatWebhookTestEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.Test] })
  @Equals(RevenueCatWebhookEventTypes.Test)
  type: RevenueCatWebhookEventTypes.Test;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookInitialPurchaseEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.InitialPurchase] })
  @Equals(RevenueCatWebhookEventTypes.InitialPurchase)
  type: RevenueCatWebhookEventTypes.InitialPurchase;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookNonRenewingPurchaseEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.NonRenewingPurchase] })
  @Equals(RevenueCatWebhookEventTypes.NonRenewingPurchase)
  type: RevenueCatWebhookEventTypes.NonRenewingPurchase;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookRenewalEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.Renewal] })
  @Equals(RevenueCatWebhookEventTypes.Renewal)
  type: RevenueCatWebhookEventTypes.Renewal;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookProductChangeEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.ProductChange] })
  @Equals(RevenueCatWebhookEventTypes.ProductChange)
  type: RevenueCatWebhookEventTypes.ProductChange;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookCancellationEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.Cancellation] })
  @Equals(RevenueCatWebhookEventTypes.Cancellation)
  type: RevenueCatWebhookEventTypes.Cancellation;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookBillingIssueEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.BillingIssue] })
  @Equals(RevenueCatWebhookEventTypes.BillingIssue)
  type: RevenueCatWebhookEventTypes.BillingIssue;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookSubscriberAliasEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.SubscriberAlias] })
  @Equals(RevenueCatWebhookEventTypes.SubscriberAlias)
  type: RevenueCatWebhookEventTypes.SubscriberAlias;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookSubscriptionPausedEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.SubscriptionPaused] })
  @Equals(RevenueCatWebhookEventTypes.SubscriptionPaused)
  type: RevenueCatWebhookEventTypes.SubscriptionPaused;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookUncancellationEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.Uncancellation] })
  @Equals(RevenueCatWebhookEventTypes.Uncancellation)
  type: RevenueCatWebhookEventTypes.Uncancellation;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookSubscriptionExtendedEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.SubscriptionExtended] })
  @Equals(RevenueCatWebhookEventTypes.SubscriptionExtended)
  type: RevenueCatWebhookEventTypes.SubscriptionExtended;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookExpirationEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.Expiration] })
  @Equals(RevenueCatWebhookEventTypes.Expiration)
  type: RevenueCatWebhookEventTypes.Expiration;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookTemporaryEntitlementGrantEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({
    enum: [RevenueCatWebhookEventTypes.TemporaryEntitlementGrant],
  })
  @Equals(RevenueCatWebhookEventTypes.TemporaryEntitlementGrant)
  type: RevenueCatWebhookEventTypes.TemporaryEntitlementGrant;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookInvoiceIssuanceEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.InvoiceIssuance] })
  @Equals(RevenueCatWebhookEventTypes.InvoiceIssuance)
  type: RevenueCatWebhookEventTypes.InvoiceIssuance;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookVirtualCurrencyTransactionEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({
    enum: [RevenueCatWebhookEventTypes.VirtualCurrencyTransaction],
  })
  @Equals(RevenueCatWebhookEventTypes.VirtualCurrencyTransaction)
  type: RevenueCatWebhookEventTypes.VirtualCurrencyTransaction;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookExperimentEnrollmentEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.ExperimentEnrollment] })
  @Equals(RevenueCatWebhookEventTypes.ExperimentEnrollment)
  type: RevenueCatWebhookEventTypes.ExperimentEnrollment;

  @IsString()
  @IsNotEmpty()
  app_user_id: string;

  @IsString()
  @IsNotEmpty()
  original_app_user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  aliases: string[];
}

export class RevenueCatWebhookTransferEventDto extends RevenueCatWebhookEventBaseDto {
  @ApiProperty({ enum: [RevenueCatWebhookEventTypes.Transfer] })
  @Equals(RevenueCatWebhookEventTypes.Transfer)
  type: RevenueCatWebhookEventTypes.Transfer;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  transferred_from: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  transferred_to: string[];
}

const subTypes = {
  [RevenueCatWebhookEventTypes.Test]: RevenueCatWebhookTestEventDto,
  [RevenueCatWebhookEventTypes.InitialPurchase]:
    RevenueCatWebhookInitialPurchaseEventDto,
  [RevenueCatWebhookEventTypes.NonRenewingPurchase]:
    RevenueCatWebhookNonRenewingPurchaseEventDto,
  [RevenueCatWebhookEventTypes.Renewal]: RevenueCatWebhookRenewalEventDto,
  [RevenueCatWebhookEventTypes.ProductChange]:
    RevenueCatWebhookProductChangeEventDto,
  [RevenueCatWebhookEventTypes.Cancellation]:
    RevenueCatWebhookCancellationEventDto,
  [RevenueCatWebhookEventTypes.BillingIssue]:
    RevenueCatWebhookBillingIssueEventDto,
  [RevenueCatWebhookEventTypes.SubscriberAlias]:
    RevenueCatWebhookSubscriberAliasEventDto,
  [RevenueCatWebhookEventTypes.SubscriptionPaused]:
    RevenueCatWebhookSubscriptionPausedEventDto,
  [RevenueCatWebhookEventTypes.Uncancellation]:
    RevenueCatWebhookUncancellationEventDto,
  [RevenueCatWebhookEventTypes.SubscriptionExtended]:
    RevenueCatWebhookSubscriptionExtendedEventDto,
  [RevenueCatWebhookEventTypes.Expiration]: RevenueCatWebhookExpirationEventDto,
  [RevenueCatWebhookEventTypes.TemporaryEntitlementGrant]:
    RevenueCatWebhookTemporaryEntitlementGrantEventDto,
  [RevenueCatWebhookEventTypes.InvoiceIssuance]:
    RevenueCatWebhookInvoiceIssuanceEventDto,
  [RevenueCatWebhookEventTypes.VirtualCurrencyTransaction]:
    RevenueCatWebhookVirtualCurrencyTransactionEventDto,
  [RevenueCatWebhookEventTypes.ExperimentEnrollment]:
    RevenueCatWebhookExperimentEnrollmentEventDto,
  [RevenueCatWebhookEventTypes.Transfer]: RevenueCatWebhookTransferEventDto,
} as const satisfies Record<
  RevenueCatWebhookEventTypes,
  typeof RevenueCatWebhookEventBaseDto
>;

export type RevenueCatWebhookEvent = InstanceType<
  (typeof subTypes)[RevenueCatWebhookEventTypes]
>;

@ApiExtraModels(...Object.values(subTypes))
export class RevenueCatWebhookDto {
  @IsString()
  @IsNotEmpty()
  api_version: string;

  @ApiProperty({
    oneOf: Object.values(subTypes).map((subType) => ({
      $ref: getSchemaPath(subType),
    })),
  })
  @Type(() => RevenueCatWebhookEventBaseDto, {
    discriminator: {
      property: 'type' satisfies keyof RevenueCatWebhookEventBaseDto,
      subTypes: Object.entries(subTypes).map(([name, value]) => ({
        name,
        value,
      })),
    },
    keepDiscriminatorProperty: true,
  })
  @IsObject()
  @ValidateNested()
  event: RevenueCatWebhookEvent;
}
