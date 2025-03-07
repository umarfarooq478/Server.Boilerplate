import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { rateLimit } from 'express-rate-limit';
import { AppModule } from './app.module';
import validationOptions from './utils/validation-options';
import * as compression from 'compression';
// import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    // bufferLogs: true,
    // logger: ['log', 'error', 'warn']s,
  });
  // app.useLogger(app.get(Logger));
  const configService = app.get(ConfigService);
  app.setGlobalPrefix(configService.get('app.apiPrefix'), {
    exclude: ['/'],
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  /* The is setting up a middleware in the Express application (`app`) to handle requests to the `/api/webhooks` endpoint. */
  app.use(compression());
  app.use('/api/webhooks', express.raw({ type: 'application/json' }));

  // //helmet adds http headers to protest against Cross-Site Scripting (XSS) and click-jacking attacks.
  // app.use(helmet());

  // rate limit protects against brute-force attacks & Defending against DDoS attacks
  // const limiter = rateLimit({
  //   windowMs: Number(process.env.SECURITY_RATE_LIMIT_WINDOW ?? 1 * 60 * 1000), // 1 minute
  //   limit: Number(process.env.SECURITY_RATE_LIMIT_MAX_CONNECTIONS ?? 100), // Limit each IP to 100 requests per `window` (here, per 1 minute).
  //   standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  //   legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  //   // store: ... , // Use an external store for consistency across multiple server instances.
  // });

  // // Apply the rate limiting middleware to all requests.
  // app.use(limiter);

  // Setting Up swagger APIs
  const options = new DocumentBuilder()
    .setTitle('Server BoilerPlate')
    .setDescription('API docs')
    .setVersion(configService.get('app.version'))
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document, {
    // *  Every time we have to test, we need to login and pass the token. So I am  saving the auth token  in local storage by passing this configuration
    swaggerOptions: { persistAuthorization: true },
  });

  // await app.listen(configService.get('app.port'));
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
