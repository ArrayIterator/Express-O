// noinspection JSUnusedGlobalSymbols

import RuntimeException from "../errors/exceptions/RuntimeException.js";
import {sprintf} from "../helpers/Formatting.js";
import {is_number, is_numeric, is_numeric_integer} from "../helpers/Is.js";
import {floatval, intval} from "../helpers/DataType.js";
import {__} from "../l10n/Translator.js";

let id = 0;

/**
 * @property {((err: Error, req: Request, res: Response, next: (err: any) => any) => (Promise<?>|any))|((req: Request, res: Response, next: (err: any) => any) => (Promise<?>|any))} dispatch
 * @abstract
 */
export default class Middleware {
    /**
     * @constructor
     */
    constructor() {
        if (this.constructor === Middleware) {
            throw new RuntimeException(
                sprintf(
                    __('Can not create an instance of %s class'),
                    this.constructor.name
                )
            );
        }
        if (this.middlewareId !== Middleware.prototype.middlewareId) {
            throw new RuntimeException(
                sprintf(
                    __('Can not override the middleware id of %s class'),
                    this.constructor.name
                )
            );
        }
        if (!is_numeric(this._priority)) {
            this._priority = 0;
        }
        if (!is_number(this._priority)) {
            this._priority = is_numeric_integer(this._priority) ? intval(this._priority) : floatval(this._priority);
        }
        this._id = ++id;
        Object.defineProperty(this, '_id', {value: this._id, enumerable: false, writable: false});
    }

    /**
     * Middleware id
     *
     * @type {number}
     */
    _id;

    /**
     * Get the middleware id.
     *
     * @return {number}
     */
    get id() {
        return this.middlewareId;
    }

    /**
     * Get the middleware id.
     *
     * @return {number}
     */
    get middlewareId() {
        return this._id;
    }

    /**
     * Get the priority of the middleware.
     *
     * @return {number}
     */
    get priority() {
        return this.getPriority();
    }

    /**
     * Get the priority of the middleware.
     *
     * @return {number}
     */
    getPriority() {
        return this._priority;
    }
}
