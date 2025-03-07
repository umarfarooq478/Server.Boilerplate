import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken'; // Make sure you have this package installed
import { CustomLogger } from '../services/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly customLogger: CustomLogger) {}
  /**
   * This TypeScript function is a middleware that logs the user ID and the accessed route when a
   * request is made.
   * @param {Request} req - The `req` parameter represents the HTTP request object, which contains
   * information about the incoming request such as headers, body, URL, and more.
   * @param {Response} res - The `res` parameter is an object representing the HTTP response that will
   * be sent back to the client. It is used to send the response data, set response headers, and
   * control the response status code.
   * @param {NextFunction} next - The `next` parameter is a function that is called to pass control to
   * the next middleware function in the chain. It is typically used to move to the next middleware
   * function or to the route handler function.
   */
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    let userId;

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]; // Assuming the token is in the format "Bearer <token>"
      try {
        const decodedToken = jwt.verify(token, process.env.AT_SECRET); // Replace with your JWT secret key
        userId = decodedToken.sub; // Getting UserID
      } catch (error) {
        // Token verification failed
      }
    } else if (req.body) {
      userId = req.body.email; // Use the user ID from the request body if available
    }

    if (userId) {
      this.customLogger.log({
        message: `User '${userId}' accessed ${method} ${originalUrl}`,
        topicName: 'MIDDLEWARE_LOGS',
      });
    }
    next();
  }
}
