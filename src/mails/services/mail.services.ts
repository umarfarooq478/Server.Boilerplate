import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CustomLogger } from 'src/logger/services/logger.service';
import handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import {
  IAccountConfirmation,
  IAccountConfirmationInstructor,
  IContactUs,
  IForgotPassword,
  IPaymentConfirmationClient,
} from '../types';
import { User } from 'src/users/entities/user.entity';
@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
    private httpService: HttpService,
    private readonly customLogger: CustomLogger,
  ) { }

  async sendEmailWithSES(
    templateName: string,
    dynamicData:
      | IAccountConfirmation
      | IForgotPassword
      | IAccountConfirmationInstructor
      | IPaymentConfirmationClient
      | IContactUs,
    recipentEmail: string,
    subject: string,
  ) {
    try {
      // Construct the path to the template
      const templatePath = path.join(
        __dirname,
        `../templates/${templateName}.hbs`,
      );

      // Read the Handlebars template
      const templateSource = fs.readFileSync(templatePath, 'utf-8');

      // Compile the Handlebars template
      const template = handlebars.compile(templateSource);

      // Use the compiled template to generate HTML content
      const htmlContent = template(dynamicData);

      await this.mailerService.sendMail({
        sender: 'Server',
        from: 'notifications@server-boilerplate.com',
        to: recipentEmail,
        subject: subject,
        html: htmlContent,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'An Error Occured. Please try again.',
      );
    }
  }

}
