import winston from 'winston';

const isDev = process.env.NODE_ENV !== 'production';

const ALLOWED_LEVELS = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
const rawLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
const level = ALLOWED_LEVELS.includes(rawLevel) ? rawLevel : 'info';

const logger = winston.createLogger({
  level,
  defaultMeta: { service: 'nagpur-property-admin' },
  transports: [
    new winston.transports.Console({
      format: isDev
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
            })
          )
        : winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
    }),
  ],
});

export default logger;
