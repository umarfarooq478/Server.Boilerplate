import { Body, Controller, Post } from '@nestjs/common';
import { CustomLogger } from 'src/logger/services/logger.service';
import { UnhandledRejectionDTO } from './unhandledRejection.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('unhandled_rejections')
@Controller('unhandled_rejections')
export class UnhandledRejectionLogger {
  constructor(private readonly logger: CustomLogger) {}

  // @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'))
  @ApiBody({
    description: 'Log an Unhandled Exception',
    type: UnhandledRejectionDTO,
  })
  @Post()
  postUnhandledRejection(@Body() error: UnhandledRejectionDTO) {
    this.logger.error({
      message: '[UNCAUGHT_PROMISE_REJECTION] ',
      stack: error.reason,
      topicName: 'UNCAUGHT_EXCEPTIONS',
    });

    return;
  }
}
