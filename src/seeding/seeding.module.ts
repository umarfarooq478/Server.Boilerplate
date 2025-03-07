import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/featureFlags/featureFlag.module';
import { SettingsModule } from 'src/settings/settings.module';
import { UsersModule } from 'src/users/users.module';
import { SeedingService } from './seeding.service';

@Module({
  imports: [
    FeatureFlagModule,
    SettingsModule,
    UsersModule,
  ],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class SeedingModule { }
