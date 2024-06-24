import configuration, {LOG_DIR} from "./Config.js";
import {is_boolean, is_integer, is_object, is_string} from "../helpers/Is.js";
import {existsSync, mkdirSync} from "node:fs";
import path, {resolve as resolvePath} from "node:path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import chalk from "chalk";
import {ucfirst} from "../helpers/Formatting.js";
import {ServerResponse} from "http";
import {str_pad} from "../helpers/DataType.js";

let config = configuration.getObject('log');

const DEFAULT = {
    debug: {
        enable: false,
        type: 'console',
    },
    info: {
        enable: false,
        type: 'console'
    },
    warn: {
        enable: true,
        type: 'rotating-file',
        path: resolvePath(LOG_DIR, 'warn.log'),
        count: 3,
        period: 30,
    },
    error: {
        enable: true,
        type: 'rotating-file',
        path: resolvePath(LOG_DIR, 'error.log'),
        count: 3,
        period: 30,
    },
    access: {
        enable: false,
        type: 'rotating-file',
        path: resolvePath(LOG_DIR, 'access.log'),
        count: 3,
        period: 30,
    }
};
if (!is_object(config)) {
    config = DEFAULT;
}
const LEVELS = [
    'debug',
    'info',
    'warn',
    'error',
    'access',
];
const Logger = {};
const format = winston.format.printf(({level, message, label, timestamp}) => {
    return JSON.stringify({
        label,
        timestamp,
        level,
        message
    })
});

const consoleFormat = winston.format.printf(({level, message, label, timestamp}) => {
    timestamp = timestamp || formatDate(new Date());
    label = label || level;
    if (message instanceof Error) {
        message = message.stack;
        if (level === 'error') {
            message = chalk.red(message);
        } else if (level === 'warn') {
            message = chalk.yellow(message);
        }
    }
    const arrow_icon = level === 'error' ? '🚨' : level === 'warn' ? '⚠️' : level === 'debug' ? '🤖' : 'ℹ️';
    return `· ${arrow_icon} ${chalk.gray(`[${timestamp}]`)} ${chalk.cyan(`(${label})`)} ${message}`;
});

const accessFormat = winston.format.printf(({message, timestamp}) => {
    const response = message;
    if (!(response instanceof ServerResponse)) {
        return '';
    }
    timestamp = new Date(timestamp).toISOString();
    const contentLength = (is_integer(response['_contentLength']) ? response['_contentLength'] : response.outputLength) || 0;
    message = `${response.req['ip']} [${timestamp}]`;
    message += ` "${response.req.method} ${response.req.url}" ${response.statusCode} ${contentLength} `;
    message += `"${response.req.headers['referer'] || '-'}" "${response.req.headers['user-agent']}"`;
    return message;
});

const consoleAccessFormat = winston.format.printf(({message, timestamp}) => {
    const response = message;
    if (!(response instanceof ServerResponse)) {
        return '';
    }
    const contentLength = (is_integer(response['_contentLength']) ? response['_contentLength'] : response.outputLength) || 0;
    const status = response.statusCode > 399 ? chalk.red(response.statusCode) : chalk.green(response.statusCode);
    message = `· ⚡️ ${chalk.gray(`[${timestamp}]`)} ${chalk.cyan(`(access)`)} ${chalk.bold(response.req['ip'])}`;
    message += ` "${response.req.method} ${response.req.url}" ${status} ${contentLength} `;
    message += `"${response.req.headers['referer'] || '-'}" "${response.req.headers['user-agent']}"`;
    return message;
});

for (let level of LEVELS) {
    if (!config.hasOwnProperty(level) || !is_object(config[level])) {
        config[level] = DEFAULT[level];
    }
    if (!is_boolean(config[level].enable)) {
        config[level].enable = !!config[level].enable;
    }
    if (!is_string(config[level].type)) {
        config[level].type = DEFAULT[level].type;
    }
    if (!is_string(config[level].path)) {
        config[level].path = DEFAULT[level].path || resolvePath(LOG_DIR,  level + '.log');
    }
    if (!is_integer(config[level].count)) {
        config[level].count = DEFAULT[level].count || 3;
    }
    if (!is_integer(config[level].period)) {
        config[level].period = DEFAULT[level].period || 30;
    }
    if (!is_integer(config[level].size)) {
        config[level].size = DEFAULT[level].size || 10;
    }

    if (config[level].size > 1) {
        config[level].size = 1;
    }
    if (config[level].type !== 'console' && config[level].type !== 'stdout') {
        if (!existsSync(config[level].path)) {
            mkdirSync(path.dirname(config[level].path), {recursive: true});
        }
    }
    if (!config[level].enable) {
        if (!configuration.is_production) {
            Logger[level] = winston.createLogger({
                level,
                transports: [new winston.transports.Console({
                    format: consoleFormat,
                    handleExceptions: true,
                })],
                exitOnError: false,
            });
        }
        continue;
    }
    config[level].type = config[level].type.toLowerCase();
    let transport = [];

    switch (config[level].type) {
        case 'rotating-file':
        case 'file':
            if (!configuration.is_test) {
                transport = [new DailyRotateFile({
                    json: true,
                    format: level === 'access' ? accessFormat : format,
                    eol: '\n',
                    datePattern: 'YYYY-MM-DD',
                    filename: config[level].path.endsWith('.log') ? config[level].path : config[level].path + '.log',
                    extension: '',
                    maxFiles: config[level].count,
                    zippedArchive: true,
                    frequency: config[level].period + 'd',
                    handleRejections: true,
                })];
            }
            if (!configuration.is_production) {
                transport.push(new winston.transports.Console({
                    format: level === 'access' ? consoleAccessFormat : consoleFormat,
                    handleExceptions: true,
                }));
            }
            break;
        case 'console':
        case 'stdout':
            transport = [new winston.transports.Console({
                format: level === 'access' ? consoleAccessFormat : consoleFormat,
                handleExceptions: true,
            })];
            break;
        default:
            break;
    }
    if (transport.length === 0) {
        continue;
    }
    Logger[level] = winston.createLogger({
        level: level === 'access' ? 'info' : level,
        label: level,
        transports: transport,
        exitOnError: false,
    });
}

const formatDate = (date) => {
    // convert to utc data
    // YYYY/MM/DD HH:MM:SS UTC
    return date.getUTCFullYear()
        + '/' + str_pad(date.getUTCMonth() + 1, 2, '0', 'STR_PAD_LEFT')
        + '/' + str_pad(date.getUTCDate(), 2, '0', 'STR_PAD_LEFT')
        + ' ' + str_pad(date.getUTCHours(), 2, '0', 'STR_PAD_LEFT')
        + ':' + str_pad(date.getUTCMinutes(), 2, '0', 'STR_PAD_LEFT')
        + ':' + str_pad(date.getUTCSeconds(), 2, '0', 'STR_PAD_LEFT')
        + '.' + str_pad(date.getUTCMilliseconds(), 3, '0', 'STR_PAD_LEFT')
        + ' UTC';
}
export const log = (level, label, ...message) => {
    if (!is_string(level)) {
        return;
    }
    if (!Logger.hasOwnProperty(level)) {
        return;
    }
    if (message.length === 0) {
        message = [label];
        label = ucfirst(level);
    }
    let timestamp = formatDate(new Date());//.toISOString();
    message.forEach((msg) => {
        Logger[level].log({
            level,
            label,
            message: msg,
            timestamp
        });
    })
}

/**
 * Log debug message
 *
 * @param {string} label
 * @param {string} message
 * @return {void}
 */
export const debug = (label, ...message) => {
    log('debug', label, ...message);
}

/**
 * Log info message
 *
 * @param {string} label
 * @param {string} message
 * @return {void}
 */
export const info = (label, ...message) => {
    log('info', label, ...message);
}

/**
 * Log warn message
 *
 * @param {string} label
 * @param {string} message
 * @return {void}
 */
export const warn = (label, ...message) => {
    log('warn', label, ...message);
}

/**
 * Log error message
 *
 * @param {string} label
 * @param {string} message
 * @return {void}
 */
export const error = (label, ...message) => {
    log('error', label, ...message);
}

/**
 * Log access message
 *
 * @param {ServerResponse} response
 */
export const access = (response) => {
    if (!(response instanceof ServerResponse) || !Logger.access) {
        return;
    }
    let timestamp = formatDate(new Date());//.toISOString();
    Logger.access.log({message: response, level: 'info', label: 'access', timestamp});
}

export default {
    debug,
    info,
    warn,
    error,
};
