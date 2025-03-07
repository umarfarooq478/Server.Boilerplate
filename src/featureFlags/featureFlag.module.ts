import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagController } from './controllers/featureFlag.controller';
import { FeatureFlag } from './entities/featureFlag.entity';
import { FeatureFlagService } from './services/featureFlag.service';

@Global()
@Module({
  controllers: [FeatureFlagController],
  providers: [FeatureFlagService],
  imports: [TypeOrmModule.forFeature([FeatureFlag])],
  exports: [FeatureFlagService],
})
export class FeatureFlagModule {}
