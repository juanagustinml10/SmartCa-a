import { Injectable, Logger } from '@nestjs/common';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

@Injectable()
export class LoggerService {
  private readonly logger = new Logger('SmartCaña');

  info(
    message: string,
    context?: string,
    data?: Record<string, unknown>,
  ): void {
    this.log({
      level: 'info',
      message,
      context,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  warn(
    message: string,
    context?: string,
    data?: Record<string, unknown>,
  ): void {
    this.log({
      level: 'warn',
      message,
      context,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  error(
    message: string,
    context?: string,
    data?: Record<string, unknown>,
  ): void {
    this.log({
      level: 'error',
      message,
      context,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  debug(
    message: string,
    context?: string,
    data?: Record<string, unknown>,
  ): void {
    this.log({
      level: 'debug',
      message,
      context,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  private log(entry: LogEntry): void {
    const prefix = entry.context ? `[${entry.context}]` : '';

    switch (entry.level) {
      case 'info':
        this.logger.log(`${prefix} ${entry.message}`, entry.data ?? '');
        break;
      case 'warn':
        this.logger.warn(`${prefix} ${entry.message}`, entry.data ?? '');
        break;
      case 'error':
        this.logger.error(
          `${prefix} ${entry.message}`,
          undefined,
          entry.data ?? '',
        );
        break;
      case 'debug':
        this.logger.debug(`${prefix} ${entry.message}`, entry.data ?? '');
        break;
    }
  }
}
