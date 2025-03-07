import { Global, Module } from '@nestjs/common';
import { CustomLogger } from './services/logger.service';

@Global()
@Module({
  controllers: [],
  providers: [CustomLogger],
  imports: [],
  exports: [CustomLogger],
})
export class CustomLoggerModule {}
