
/**
 * @typedef {http.IncomingMessage&Express.Request} Request
 * @typedef {http.OutgoingMessage&Express.Response} Response
 */

import {
    is_array,
    is_boolean,
    is_integer,
    is_maybe_response_object,
    is_numeric_integer,
    is_object,
    is_string
} from "../helpers/Is.js";
import {intval} from "../helpers/DataType.js";
import HTTP_MESSAGES from "../helpers/HttpCode.js";
import Config from "./Config.js";
import HttpException from "../errors/exceptions/HttpException.js";
import {sprintf} from "../helpers/Formatting.js";
import InvalidArgumentException from "../errors/exceptions/InvalidArgumentException.js";
import {__} from "../l10n/Translator.js";

/**
 * Json
 */
export default class Json {
    /**
     * Charset
     *
     * @type {?string}
     */
    #charset = null;

    /**
     * Pretty
     *
     * @type {boolean}
     */
    #pretty = false;

    /**
     * Constructor
     */
    constructor() {
        this.setPretty(Config.get('environment.pretty_json', false));
    }

    /**
     * Get pretty
     *
     * @return {boolean}
     */
    get pretty() {
        return this.#pretty;
    }

    /**
     * Set pretty
     *
     * @param pretty
     */
    set pretty(pretty) {
        this.setPretty(pretty);
    }

    /**
     * Get charset
     *
     * @return {?string}
     */
    get charset() {
        return this.getCharset();
    }

    /**
     * Set charset
     *
     * @param charset
     */
    set charset(charset) {
        this.setCharset(charset);
    }

    /**
     * Set pretty
     *
     * @param {boolean} pretty
     */
    setPretty(pretty) {
        this.#pretty = !!pretty;
    }

    /**
     * Set charset
     *
     * @param {?string} charset
     */
    setCharset(charset) {
        if (charset && !is_string(charset)) {
            throw new InvalidArgumentException(__('Charset must be a string'));
        }
        this.#charset = charset || null;
    }

    /**
     * Get charset
     *
     * @return {?string}
     */
    getCharset() {
        return this.#charset;
    }

    /**
     * Set charset
     *
     * @param json
     * @return {any}
     */
    decode(json) {
        if (is_object(json) || is_array(json)) {
            return json;
        }
        if (is_string(json)) {
            try {
                return JSON.parse(json);
            } catch (e) {
            }
        }
        return json;
    }

    /**
     * Encode
     *
     * @param {any} obj
     * @param {?boolean} prettify
     * @return {string}
     */
    encode(obj, prettify = null) {
        prettify = is_boolean(prettify) ? prettify : !!this.pretty;
        return prettify
            ? JSON.stringify(obj, null, 4)
            : JSON.stringify(obj);
    }

    /**
     * Success
     *
     * @param {any} message
     * @param {number} code
     * @return {{code:number, data: any}}
     */
    success(message, code = 200) {
        code = is_numeric_integer(code) ? intval(code) : 200;
        if (HTTP_MESSAGES[code] === undefined) {
            code = 200;
        }
        if (message === undefined) {
            message = HTTP_MESSAGES[code];
        }
        if (message && is_object(message) && Object.keys(message).length === 1 && message.hasOwnProperty('data')) {
            message = message.data;
        }
        return {
            code,
            data: message,
        }
    }

    /**
     * Error
     *
     * @param {any} message
     * @param {?number} code
     * @return {{code: number, message: any, metadata?:any, stack?:string}}
     */
    error(message, code = null) {
        if (!code && message instanceof HttpException) {
            code = message.code;
        }
        code = is_numeric_integer(code) ? intval(code) : 500;
        if (HTTP_MESSAGES[code] === undefined) {
            code = 500;
        }
        if (message === undefined || message === null) {
            message = HTTP_MESSAGES[code];
        }
        if (message instanceof Error) {
            if (!Config.is_production) {
                return {
                    code,
                    message: message.message,
                    stack: message.stack,
                }
            }
            return {
                code,
                message: message.message
            }
        }
        if (is_object(message) && message.hasOwnProperty('message')) {
            return {
                code,
                ...message
            }
        }
        if (is_string(message)) {
            return {
                code,
                message
            }
        }
        return {
            code,
            message: HTTP_MESSAGES[code],
            metadata: message
        }
    }

    /**
     * Code
     *
     * @param {number} code
     * @param {any} message
     * @return {{code:number, data: any}|{code: number, message: any, metadat?:any}}
     */
    code(code, message = null) {
        code = is_numeric_integer(code) ? intval(code) : code;
        if (!is_integer(code)) {
            if (message instanceof HttpException) {
                code = message.code;
            } else if (message instanceof Error) {
                code = 500;
            } else {
                code = 200;
            }
        }
        return code >= 400 ? this.error(message, code) : this.success(message, code);
    }

    /**
     * Send JSON
     *
     * @param {any} data
     * @param {number} code
     * @param {Response} res
     * @return {Promise<unknown>}
     */
    send(data, code, res) {
        return new Promise(async (resolve, reject) => {
            if (!is_maybe_response_object(res)) {
                const app = (await import('./Application.js').then(e => e.default));
                res = app.express?.response || null;
                if (!res) {
                    reject(new InvalidArgumentException(__('Response object is invalid')));
                    return;
                }
            }
            if (!is_integer(code)) {
                code = res.statusCode;
            }
            data = this.code(code, data);
            res.status(data.code);
            res.type('json');
            res.setHeader(
                'Content-Type',
                this.charset ? sprintf('application/json; charset=%s', this.charset) : 'application/json'
            );
            delete data.code;
            res.end(this.encode(data), function (err) {
                data = null;
                if (err) {
                    reject(err);
                    return;
                }
                resolve(null);
            });
        });
    }
}
