import { Controller, Get } from '@nestjs/common';

import { ConfigProvider } from '../config/config';

@Controller(ConfigProvider.healthcheck.path)
export class HealthCheckController {
  @Get()
  healthCheck(): { status: 'up' | 'down' } {
    return { status: 'up' };
  }
}
