import { Module } from '@nestjs/common';
import { MailService } from './services/mail.services';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [HttpModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
