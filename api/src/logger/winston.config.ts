/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const auditFilter = winston.format((info) => (info.isAudit ? info : false));
const systemFilter = winston.format((info) => (!info.isAudit ? info : false));

export const winstonConfig: winston.LoggerOptions = {
  transports: [
    // 1. Log no Console (Para o terminal de desenvolvimento)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('Dashify', {
          colors: true,
        }),
      ),
    }),

    // 2. Log de Auditoria em TXT (Pastas por Mês)
    new DailyRotateFile({
      // O %DATE% será substituído pelo datePattern. Como tem uma "/", ele cria a pasta do mês.
      filename: 'logs/auditoria/%DATE%.txt',
      datePattern: 'MM-YYYY/DD-MM-YYYY', // Ex: 03-2026/04-03-2026.txt
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d',
      level: 'info',
      format: winston.format.combine(
        auditFilter(),
        winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
        winston.format.printf(({ timestamp, message }) => {
          const msg =
            typeof message === 'object'
              ? (message as any).message || JSON.stringify(message)
              : message;
          return `[${timestamp}] ${msg}`;
        }),
      ),
    }),

    // 3. Log de Sistema em TXT (Pastas por Mês)
    new DailyRotateFile({
      filename: 'logs/sistema/%DATE%.txt',
      datePattern: 'MM-YYYY/DD-MM-YYYY',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'info',
      format: winston.format.combine(
        systemFilter(),
        winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
        winston.format.printf(
          ({ timestamp, level, context, message, trace }) => {
            const msg =
              typeof message === 'object'
                ? (message as any).message || JSON.stringify(message)
                : message;
            return `[${timestamp}] [${level.toUpperCase()}] [${context || 'System'}] ${msg} ${trace ? `\n${trace}` : ''}`;
          },
        ),
      ),
    }),

    // 4. Log de Erros em TXT (Pastas por Mês)
    new DailyRotateFile({
      filename: 'logs/erros/%DATE%.txt',
      datePattern: 'MM-YYYY/DD-MM-YYYY',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
        winston.format.printf(
          ({ timestamp, level, context, message, trace }) => {
            const msg =
              typeof message === 'object'
                ? (message as any).message || JSON.stringify(message)
                : message;
            return `[${timestamp}] [${level.toUpperCase()}] [${context || 'System'}] ${msg} ${trace ? `\n${trace}` : ''}`;
          },
        ),
      ),
    }),
  ],
};
