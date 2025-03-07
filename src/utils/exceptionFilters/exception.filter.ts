import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomLogger } from 'src/logger/services/logger.service';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
@Catch()
@Injectable()
/* The `AllExceptionsFilter` class is an exception filter in TypeScript that handles all exceptions and
logs them using a custom logger. */
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(@Inject(CustomLogger) private readonly logger: CustomLogger) {}
  /**
   * The catch function handles exceptions in a TypeScript application and returns an appropriate
   * response based on the type of exception.
   * @param {any} exception - The `exception` parameter is the error or exception that was thrown in
   * the application. It can be of any type, hence the `any` type annotation.
   * @param {ArgumentsHost} host - The `host` parameter is an instance of `ArgumentsHost`, which
   * represents the execution context of the current request. It provides access to the request,
   * response, and other related objects.
   */
  catch(exception: any, host: ArgumentsHost) {
    try {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const status =
        exception instanceof HttpException ? exception.getStatus() : 500;

      //    if (exception instanceof HttpException) return exception;

      /* The code block is checking if the `exception` is not an instance of the `HttpException` class.
      If it is not, it means that the exception is a generic error or exception that was not
      specifically thrown as an `HttpException`. In this case, the code logs the exception using a
      custom logger and returns a JSON response with the exception details, including the message,
      error, status code, and stack trace. */
      if (!(exception instanceof HttpException)) {
        this.logger.error({
          message: '[UNCAUGHT]' + exception.message,
          stack: exception.stack,
          topicName: 'UNCAUGHT_EXCEPTIONS',
        });
        response.status(status).json({
          message: exception.message || 'Internal server error',
          error: exception.error,
          statusCode: status,
          stack: exception.stack ? exception.stack.split('\n') : '',
        });
      } else {
        response.status(status).json({
          message: exception.message || 'Internal server error',
          error: exception.name,
          statusCode: status,
        });
      }
    } catch (e) {
      console.log('Error while logging uncaught exception', e);
      this.logger.error({
        message: e.message,
        stack: e.stack,
        topicName: 'UNCAUGHT_EXCEPTIONS',
      });
    }
  }
}

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  const stackTrace = reason instanceof Error ? reason.stack : null;
  const data = {
    reason: stackTrace,
    promise,
  };

  try {
    const response = await axios.post(
      `${process.env.SERVER_URL}/api/unhandled_rejections`,
      data,
    );
    console.log('Posted unhandled rejection data successfully:', response.data);
  } catch (error) {
    console.error('Error posting unhandled rejection data:', error.message);
  }
});
