import { Module } from '@nestjs/common';
import { ProfilesModule } from 'src/profile/profile.module';

import { BucketService } from './bucket.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ProfilesModule, AuthModule],
  providers: [BucketService],
  exports: [BucketService],
})
export class BucketModule { }
