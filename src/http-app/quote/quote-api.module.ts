import { Module } from '@nestjs/common';
import { QuoteModule } from '@domain/quote/quote.module';
import { QuoteController } from './quote.controller';

@Module({
  imports: [QuoteModule],
  controllers: [QuoteController],
})
export class QuoteApiModule {}
