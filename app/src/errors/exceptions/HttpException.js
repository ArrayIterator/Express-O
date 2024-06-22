import {is_integer} from "../../helpers/Is.js";
import {http_message} from "../../helpers/HttpCode.js";
import {__} from "../../l10n/Translator.js";

export default class HttpException extends Error {

    /**
     * Http error code
     *
     * @type {number} #code
     * @private
     */
    #code;

    /**
     * Http error message
     * @type {string} #message
     * @private
     */
    #message;

    /**
     * Previous error
     * @type {?Error} #previous
     * @private
     */
    #previous;

    /**
     * Current stack
     * @type {string|undefined} currentStack
     */
    currentStack;

    constructor(code, message, previous = null) {
        code = is_integer(code) ? code : 500;
        if (!message) {
            message = http_message(code);
            if (!message) {
                code = 500;
                message = __('Internal Server Error');
            }
        }
        super(message);
        this.#code = code;
        this.#message = message;
        this.#previous = previous;
        this.currentStack = this.stack;
        if (this.previous) {
            this.stack = this.previous.stack;
        }
    }

    /**
     * Get error code
     *
     * @return {number}
     */
    get code() {
        return this.#code;
    }

    get stack() {
        return super.stack + "\n" + this.currentStack;
    }

    /**
     * Get error message
     *
     * @return {string}
     */
    get message() {
        return this.#message;
    }

    /**
     * Get previous error
     *
     * @return {?Error}
     */
    get previous() {
        return this.#previous;
    }
}
