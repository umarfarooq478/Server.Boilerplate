import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthPasswordlessModule } from './auth/auth-paswordless.module';
import { AuthModule } from './auth/auth.module';

import S3Config from './config/S3.config';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import mailConfig from './config/mail.config';
import profilePicConfig from './config/profilePic.config';

import { FeatureFlagModule } from './featureFlags/featureFlag.module';

import { CustomLoggerModule } from './logger/logger.module';
import { LoggerMiddleware } from './logger/middleware/requests-logger.middleware';
import { MailModule } from './mails/mail.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProfilesModule } from './profile/profile.module';
import { SeedingModule } from './seeding/seeding.module';
import { SettingsModule } from './settings/settings.module';
import { UsersModule } from './users/users.module';
import { BucketModule } from './utils/S3/s3_bucket_separation_script/bucket.module';
import { AllExceptionsFilter } from './utils/exceptionFilters/exception.filter';

import { UnhandledRejectionLogger } from './utils/exceptionFilters/unhandledRejection.controller';
import { SlackModule } from './slack/slack.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [

        appConfig,
        authConfig,
        mailConfig,
        S3Config,

        profilePicConfig,

      ],
      envFilePath: ['.env'],
    }),
    AuthModule,
    MailModule,
    ProfilesModule,
    SeedingModule,
    AuthPasswordlessModule,
    CustomLoggerModule,
    SettingsModule,
    SlackModule,

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      logging: false,
      // entities: ['src/**/**/*.entity{.ts,.js}'],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        transport: {
          host: process.env.SES_HOST,
          secure: true,
          port: 465,
          auth: {
            user: process.env.SES_AUTH_USER,
            pass: process.env.SES_AUTH_PASSWORD,
          },
        },
        defaults: {
          from: process.env.SES_AUTH_FROM,
        },
        template: {
          dir: join(__dirname, 'mails/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    FeatureFlagModule,
    NotificationsModule,
    BucketModule,
  ],

  controllers: [AppController, UnhandledRejectionLogger],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply the middleware to all routes
  }
}
