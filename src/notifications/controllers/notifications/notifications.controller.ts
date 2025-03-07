import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { AddNotifcationTokenDTO } from 'src/notifications/dto/addNotificationToken.dto';
import { GenerateDataNotificationDto } from 'src/notifications/dto/generateMsg.dto';
import { GenerateNotificationDTO } from 'src/notifications/dto/generateNotification.dto';
import { GetNotificationsQueryDTO } from 'src/notifications/dto/getNotifications.dto';
import { GetNotificationTokensQueryDTO } from 'src/notifications/dto/getNotificationTokens.dto';
import { MarkNotificationAsReadDTO } from 'src/notifications/dto/markNotificationAsRead.dto';
import { NotificationTokenEntity } from 'src/notifications/entities/notificationTokens/notificationTokens.entity';
import { NotificationsService } from 'src/notifications/services/notifications/notifications.service';
import { NotificationMessage } from 'src/notifications/types/notificationMessage';

import { TokenInfo } from 'src/notifications/types/notificationTokens';

@ApiTags('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationService: NotificationsService) {}

  @Post('saveToken')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save FCM token for user' })
  @ApiBody({
    description: 'an object containing Token details',
    type: AddNotifcationTokenDTO,
  })
  @ApiCreatedResponse({
    description: 'Token saved',
    type: NotificationTokenEntity,
  })
  async saveToken(
    @Body() addNotifcationTokenDTO: AddNotifcationTokenDTO,
    @Req() req: Request,
  ) {
    return await this.notificationService.saveTokenForUser(
      req.user['sub'],
      addNotifcationTokenDTO,
    );
  }

  @Get('getTokens')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Get FCM tokens for a user' })
  @ApiOkResponse({
    description: 'Generated Tokens',
    type: [TokenInfo],
  })
  async getTokens(
    @Query() query: GetNotificationTokensQueryDTO,
    @Req() req: Request,
  ) {
    return await this.notificationService.getNotificationTokensForUser(
      req.user['sub'],
      query.limit,
    );
  }

  @Get('getNotifications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Get Notifications for a user' })
  @ApiOkResponse({
    description: 'Notifications',
    type: [NotificationMessage],
  })
  async getNotifications(
    @Query() query: GetNotificationsQueryDTO,
    @Req() req: Request,
  ) {
    return await this.notificationService.getNotificationsForUser(
      req.user['sub'],
      query.limit,
    );
  }

  @Post('markOwnNotificationsAsRead')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark Notifications for a user as READ' })
  @ApiOkResponse({
    description: 'Notifications',
    type: [NotificationMessage],
  })
  async markUserNotificationsAsRead(@Req() req: Request) {
    return await this.notificationService.markOwnNotificationsAsRead(
      req.user['sub'],
    );
  }

  @Post('generateNotification')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate push notification' })
  @ApiBody({
    description: 'Notification Details',
    type: GenerateNotificationDTO,
  })
  async generateNotification(
    @Body() generateNotificationDTO: GenerateNotificationDTO,
  ) {
    return await this.notificationService.generateNotificationForUser(
      generateNotificationDTO,
    );
  }

  @Post('generateMessageNotification')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate data notification for multiple users.',
  })
  @ApiBody({
    description: 'Notification Details',
    type: GenerateDataNotificationDto,
  })
  async generateMessageNotification(
    @Body() generateNotificationDTO: GenerateDataNotificationDto,
  ) {
    return await this.notificationService.generateDataMessageForMultipleUsers(
      generateNotificationDTO,
    );
  }

  @Post('markAsRead')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiBody({
    description: 'Notification Details',
    type: MarkNotificationAsReadDTO,
  })
  async markAsRead(
    @Body() markAsReadDTO: MarkNotificationAsReadDTO,
    @Req() req: Request,
  ) {
    return await this.notificationService.markNotificationAsRead(
      req.user['sub'],
      markAsReadDTO.notificationId,
    );
  }
}
