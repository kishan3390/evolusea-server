import { Module } from '@nestjs/common';
import { PurchaseController } from './purchase.controller';
import { PurchaseModule } from '@domain/purchase/purchase.module';
import { EventEmitterModule } from '../../event-emitter';

@Module({
  imports: [PurchaseModule, EventEmitterModule],
  controllers: [PurchaseController],
})
export class PurchaseApiModule {}
