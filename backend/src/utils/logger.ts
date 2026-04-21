import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

const logFile = path.join(LOG_DIR, `system-${new Date().toISOString().slice(0, 10)}.log`);

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function formatMessage(level: LogLevel, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
}

export const logger = {
  info: (msg: string, meta?: any) => {
    const formatted = formatMessage('INFO', msg, meta);
    console.log(formatted.trim());
    fs.appendFileSync(logFile, formatted);
  },
  warn: (msg: string, meta?: any) => {
    const formatted = formatMessage('WARN', msg, meta);
    console.warn(formatted.trim());
    fs.appendFileSync(logFile, formatted);
  },
  error: (msg: string, meta?: any) => {
    const formatted = formatMessage('ERROR', msg, meta);
    console.error(formatted.trim());
    fs.appendFileSync(logFile, formatted);
  },
  debug: (msg: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const formatted = formatMessage('DEBUG', msg, meta);
      console.debug(formatted.trim());
      fs.appendFileSync(logFile, formatted);
    }
  }
};
