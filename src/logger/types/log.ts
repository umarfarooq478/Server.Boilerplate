export enum LOG_LEVEL {
  Error,
  Info,
  Warn,
}

export interface ILog {
  message: string;
  timestamp?: number;
  topicName: string;
  context?: string;
  stack?: string;
  payload?: any;
  logLevel?: LOG_LEVEL;
}

export interface IParsedLog extends ILog {
  timestamp: number;
}
