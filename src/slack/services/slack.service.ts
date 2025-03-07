import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendSlackMessageDto } from '../dto/send-message.dto';
import { messageTemplates } from '../templates/message-templates';

@Injectable()
export class SlackService {
  private webhookUrl: string;
  private environment: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.webhookUrl = this.configService.get<string>(
      'app.slackWebhookUrl',
    );

    this.environment =
      this.configService.get<string>('app.environmentPrefix') || 'DEV';
  }

  async sendMessage(messageDto: SendSlackMessageDto) {
    const template =
      messageTemplates[messageDto.template] || messageTemplates.default;
    const message = this.formatMessage(template, messageDto.data);

    try {
      await this.httpService.axiosRef.post(this.webhookUrl, message);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendAlert(type: string, data: any) {
    const template = messageTemplates[type] || messageTemplates.alert;
    const message = this.formatMessage(template, data);

    try {
      await this.httpService.axiosRef.post(this.webhookUrl, message);
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  private formatMessage(template: any, data: any) {
    // Deep clone the template to avoid modifying the original
    const message = JSON.parse(JSON.stringify(template));

    // Add environment to data
    const enrichedData = {
      ...data,
      environment: this.environment,
    };

    // Replace all placeholders in the message structure
    const replaceInObject = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].replace(
            /\${(\w+)}/g,
            (_, p1) => enrichedData[p1] || '',
          );
        } else if (typeof obj[key] === 'object') {
          replaceInObject(obj[key]);
        }
      }
    };

    replaceInObject(message);
    return message;
  }
}
