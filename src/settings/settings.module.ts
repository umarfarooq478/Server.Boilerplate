import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './controllers/settings.controller';
import { Setting } from './entities/settings.entity';
import { SettingsService } from './services/settings.service';
import { FileUploadService } from 'src/utils/S3/fileUpload';

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, FileUploadService],
  exports: [SettingsService],
})
export class SettingsModule { }
