import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../guards';
import { RevenueCatWebhookDto } from './dto';
import { ConfigProvider } from '@config';
import { RevenueCatWebhookTriggeredEvent } from '@domain/purchase/application';
import { EventEmitter } from '../../event-emitter';

@Controller('purchases')
export class PurchaseController {
  constructor(private readonly eventEmitter: EventEmitter) {}

  @UseGuards(
    ApiKeyGuard({
      header: 'authorization',
      expectedKey: ConfigProvider.revenueCat.webhookKey,
    }),
  )
  @Post('/webhooks/revenue-cat')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: RevenueCatWebhookDto): Promise<void> {
    // When the request is processed for too long, RevenueCat will retry sending the webhook again,
    // So it is recommended to handle the webhook asynchronously to avoid blocking the request
    this.eventEmitter.emit(new RevenueCatWebhookTriggeredEvent(payload.event));
  }
}
