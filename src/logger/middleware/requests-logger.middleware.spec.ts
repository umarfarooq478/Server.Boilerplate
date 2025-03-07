import { RequestsLoggerMiddleware } from './requests-logger.middleware';

describe('RequestsLoggerMiddleware', () => {
  it('should be defined', () => {
    expect(new RequestsLoggerMiddleware()).toBeDefined();
  });
});
