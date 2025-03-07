import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StubController } from './controllers/stub.controller';
import { StubService } from './services/stub.service';
import { Stub } from './entities/stub.entity';

@Module({
  controllers: [StubController],
  providers: [StubService],
  imports: [TypeOrmModule.forFeature([Stub])],
})
export class StubModule {}
