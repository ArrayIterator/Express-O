// noinspection JSUnusedGlobalSymbols

import {E_NONE} from "./ErrorCode.js";
import {is_integer, is_string} from "../../helpers/Is.js";
import {__} from "../../l10n/Translator.js";

export default class Exception extends Error {

    /**
     * Constructor
     *
     * @param {string} message Error message
     * @param {number} error_code Error code
     * @param {?Error} previous Previous error
     */
    constructor(message, error_code = E_NONE, previous = null) {
        message = message && is_string(message) ? message : __("Unknown Error");
        super(message);
        this._error_code = is_integer(error_code) ? error_code : E_NONE;
        this._name = this.constructor.name;
        if (previous instanceof Error) {
            this.code = previous.code;
            this._previous = previous;
        }
    }

    /**
     * Error code
     *
     * @type {number}
     * @private
     */
    _error_code = E_NONE;

    /**
     * Get error code
     *
     * @return {number}
     */
    get error_code() {
        return this._error_code;
    }

    /**
     * Previous error
     *
     * @type {?Error}
     * @private
     */
    _previous = null;

    /**
     * Get previous error
     *
     * @return {?Error}
     */
    get previous() {
        return this._previous;
    }

    /**
     * Error name
     *
     * @type {string}
     * @private
     */
    _name;

    /**
     * Get error name
     *
     * @return {string}
     */
    get name() {
        return this._name;
    }

    get stack() {
        return super.stack + "\n" + this.previous?.stack;
    }
}
