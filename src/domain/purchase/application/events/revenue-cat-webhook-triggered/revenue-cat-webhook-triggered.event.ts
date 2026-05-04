import { EventBase } from '../../../../../event-emitter';
import { RevenueCatWebhookEvent } from '../../../../../http-app/purchase/dto';

export class RevenueCatWebhookTriggeredEvent extends EventBase<RevenueCatWebhookEvent> {}
