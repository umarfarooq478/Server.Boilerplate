import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

import {
  convertMomentToTimestamp,
  getCurrentUtcMoment,
} from 'src/utils/date';
import { ILog, IParsedLog, LOG_LEVEL } from '../types/log';

@Injectable()
export class CustomLogger extends Logger {
  private logs: ILog[];
  private timeoutId: NodeJS.Timeout | null;
  private logFilePath: string;

  public featureActive = true;

  constructor(private configService: ConfigService) {
    super();
    this.logFilePath = path.join(__dirname, 'logs.txt');
    this.initializeLogArray();
  }

  public updateFeatureFlagValue(newValue: boolean) {
    if (newValue === false) {
      this.flushLogs();
    }
    this.featureActive = newValue;
  }

  initializeLogArray() {
    this.logs = [];
    const logFlushInterval = this.configService.get('app.logFlushInterval');
    this.timeoutId = setTimeout(() => {
      this.flushLogs();
    }, logFlushInterval);
  }

  addLog(logData: ILog, logLevel: LOG_LEVEL) {
    const parsedLogData: IParsedLog = {
      ...logData,
      timestamp:
        logData.timestamp ?? convertMomentToTimestamp(getCurrentUtcMoment()),
      logLevel,
    };
    if (logData.payload) {
      try {
        parsedLogData.message =
          parsedLogData.message +
          ' Payload -> ' +
          JSON.stringify(logData.payload);
      } catch { }
    }
    this.logs.push(parsedLogData);
    if (
      this.logs.length >= this.configService.get('app.maxLogsToKeepInMemory')
    ) {
      this.flushLogs();
    }
  }

  log(logData: ILog) {
    super.log(logData.message);
    this.addLog(logData, LOG_LEVEL.Info);
  }

  error(logData: ILog) {
    super.error(logData.message, logData.stack, '');
    this.addLog(logData, LOG_LEVEL.Error);
  }

  warn(logData: ILog) {
    super.warn(logData.message, logData.context);
    this.addLog(logData, LOG_LEVEL.Warn);
  }

  private async flushLogs() {
    const oldLogMessages = this.logs;
    const oldTimeoutId = this.timeoutId;
    this.initializeLogArray();
    oldTimeoutId && clearTimeout(oldTimeoutId);
    if (this.featureActive) {
      if (oldLogMessages.length === 0) {
        return;
      }

      console.log('Writing logs to file');
      const logMessages = oldLogMessages.map(log => this.generateLogMessage(log)).join('\n');
      fs.appendFileSync(this.logFilePath, logMessages + '\n');
    } else {
      console.log('Logging feature not active!');
    }
  }

  generateLogMessage(log: ILog) {
    if (log.logLevel === LOG_LEVEL.Info) return '[INFO] ' + log.message;
    else if (log.logLevel === LOG_LEVEL.Error)
      return '[ERROR] ' + log.message + log.stack;
    else if (log.logLevel === LOG_LEVEL.Warn)
      return '[WARN] ' + log.message + ' ' + log.stack;
  }
}
