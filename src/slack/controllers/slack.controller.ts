import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/users/roles/roles.decorator';
import { Role } from 'src/users/roles/roles.enum';
import { RolesGuard } from 'src/users/roles/roles.guard';
import { SendSlackMessageDto } from '../dto/send-message.dto';
import { SlackService } from '../services/slack.service';

@ApiTags('slack')
@Controller('slack')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Post('send')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Send a message to Slack (Admin only)' })
  async sendMessage(@Body() messageDto: SendSlackMessageDto) {
    return await this.slackService.sendMessage(messageDto);
  }
}
