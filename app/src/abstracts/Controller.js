// noinspection JSUnusedGlobalSymbols

/**
 * @typedef {http.IncomingMessage&Express.Request} Request
 * @typedef {http.OutgoingMessage&Express.Response} Response
 */

import {sprintf} from "../helpers/Formatting.js";
import {__} from "../l10n/Translator.js";
import RuntimeException from "../errors/exceptions/RuntimeException.js";
import {
    is_array, is_empty,
    is_function,
    is_integer,
    is_numeric,
    is_numeric_integer,
    is_object,
    is_promise, is_regexp, is_renderable_object, is_renderable_string,
    is_string
} from "../helpers/Is.js";
import Json from "../app/Json.js";
import HTTP_MESSAGES from "../helpers/HttpCode.js";
import {filter_content_type, intval} from "../helpers/DataType.js";
import ResponseTimeoutException from "../errors/exceptions/ResponseTimeoutException.js";
import {ALL} from "../router/Methods.js";

/**
 * Abstract route
 *
 * @see ScanRouteDirectoryToRouter
 * @abstract
 */
export default class Controller {

    /**
     * Response
     *
     * @type {Response|undefined}
     * @private
     */
    #response;

    /**
     * Request
     *
     * @type {Request|undefined}
     * @private
     */
    #request;

    /**
     * In dispatch
     *
     * @type {boolean}
     * @private
     */
    #in_dispatch = false;

    /**
     * Json
     *
     * @type {?Json}
     * @private
     */
    #json;

    /**
     * Status code
     *
     * @type {?number}
     * @private
     */
    #statusCode = null;

    /**
     * Content type
     *
     * @type {?string}
     * @private
     */
    #contentType = null;

    /**
     * Route / Controller name
     *
     * @type {string}
     * @abstract
     * @protected
     */
    name;

    /**
     * Methods
     *
     * @type {string[]}
     * @abstract
     * @protected
     */
    methods = [];

    /**
     * Route Path
     *
     * @type {string|RegExp}
     * @abstract
     * @protected
     */
    path;

    /**
     * Priority
     *
     * @abstract
     * @type {number}
     * @protected
     */
    priority = 0;

    /**
     * Route filename
     *
     * @see ScanRouteDirectoryToRouter
     * @readonly
     */
    __filename;

    /**
     * Route id
     *
     * @see ScanRouteDirectoryToRouter
     * @readonly
     */
    __route_id;

    /**
     * Constructor
     * @final
     */
    constructor() {
        if (this.constructor === Controller) {
            throw new ReferenceError(
                sprintf(
                    __('Cannot construct %s instances directly'),
                    Controller.name
                )
            );
        }
        // check if dispatch owned by Controller
        if (this.dispatchRoute !== Controller.prototype.dispatchRoute) {
            throw new ReferenceError(
                sprintf(
                    __('Can not override %s method'),
                    'dispatchRoute'
                )
            );
        }

        this.methods = this.methods || [];
        this.methods = is_string(this.methods) ? [this.methods] : this.methods;
        // filter methods
        this.methods = this.methods.filter((method) => {
            return is_string(method);
        })
        // make unique
        this.methods = [...new Set(this.methods)];
        if (is_empty(this.methods)) {
            this.methods = [ALL];
        }
        this.path = this.path || null;
        this.name = !this.name || !is_string(this.name) ? this.constructor.name : this.name;
        this.name = !is_string(this.name) ? null : this.name;
        this.priority = this.priority || 0;
        this.priority = !is_numeric(this.priority) ? 0 : parseInt(this.priority);
    }

    /**
     * Set json
     *
     * @param {Json} json
     */
    set Json(json) {
        this.setJson(json)
    }

    /**
     * Json
     *
     * @return {Json}
     * @final
     */
    get jsonObject() {
        if (!(this.#json instanceof Json)) {
            this.#json = new Json();
        }
        return this.#json;
    }

    /**
     * Response
     *
     * @return {Response|undefined}
     * @final
     */
    get response() {
        return this.#response;
    }

    /**
     * Status code
     *
     * @return {?number}
     */
    get statusCode() {
        return this.#statusCode;
    }

    /**
     * Status code
     *
     * @param {number} code
     */
    set statusCode(code) {
        this.setStatusCode(code);
    }

    /**
     * Content type
     *
     * @return {?string}
     */
    get contentType() {
        return this.#contentType;
    }

    /**
     * Content type
     *
     * @param type
     */
    set contentType(type) {
        this.setContentType(type);
    }

    /**
     * Request
     *
     * @return {Request|undefined}
     * @final
     */
    get request() {
        return this.#request;
    }

    /**
     * Get route path
     *
     * @return {string|RegExp|null}
     */
    getPath() {
        if (!is_string(this.path) && !is_regexp(this.path)) {
            this.path = null;
            return null;
        }
        return this.path;
    }

    /**
     * Get route name
     *
     * @return {string}
     */
    getName() {
        if (!is_string(this.name)) {
            this.name = this.constructor.name;
        }
        return this.name;
    }

    /**
     * Get route priority
     *
     * @return {number}
     */
    getPriority() {
        if (!is_numeric(this.priority)) {
            this.priority = 0;
        }
        return this.priority;
    }

    /**
     * Get route methods
     *
     * @return {string[]}
     */
    getMethods() {
        if (!is_array(this.methods)) {
            if (is_object(this.methods)) {
                let methods = [];
                for (let key in this.methods) {
                    if (!this.methods.hasOwnProperty(key)) {
                        continue;
                    }
                    if (!is_string(this.methods[key])) {
                        continue;
                    }
                    methods.push(this.methods[key]);
                }
                methods = is_empty(methods) ? [ALL] : methods;
                // make unique
                this.methods = [...new Set(methods)];
            } else {
                this.methods = [ALL];
            }
        }
        return this.methods;
    }

    /**
     * Set json
     *
     * @param {Json} json
     */
    setJson(json) {
        if (json instanceof Json) {
            this.#json = json;
        }
    }

    /**
     * Send json
     *
     * @param {any} data
     * @param {number} code
     * @param {Response} response
     * @return {Promise<unknown>}
     */
    json(data, code = null, response = null) {
        return new Promise((resolve, reject) => {
            code = is_numeric_integer(code) ? code : this.statusCode;
            response = !is_object(response)
            || !is_function(response.send) ? this.response : response;
            this.jsonObject.send(data, code, response).then(resolve).catch(reject);
        });
    }

    /**
     * Response
     *
     * @param {number} code
     */
    setStatusCode(code) {
        code = is_numeric_integer(code) ? intval(code) : null;
        if (code === null || code === undefined) {
            this.#statusCode = null;
            return;
        }
        if (is_integer(code) && HTTP_MESSAGES[code] === undefined) {
            return;
        }
        this.#statusCode = code;
    }

    /**
     * Content type
     *
     * @param type
     */
    setContentType(type) {
        type = is_string(type) ? type : null;
        this.#contentType = type;
    }

    /**
     * Dispatch route
     *
     * @param {Request} request
     * @param {Response} response
     * @param {(arg: any) => void} next
     * @return {Promise<any>}
     * @final
     */
    dispatchRoute(request, response, next) {
        return new Promise(async (resolve, reject) => {
            if (this.#in_dispatch) {
                resolve(null);
                return;
            }
            this.#in_dispatch = true;
            this.#request = request;
            this.#response = response;
            let res;
            try {
                res = this.dispatch(request, response, next);
                const statusCode = this.statusCode;
                let timeoutPid;
                const try_handle = (res) => {
                    if (timeoutPid) {
                        clearTimeout(timeoutPid);
                        timeoutPid = null;
                    }
                    if (!response.headersSent) {
                        const code = statusCode || res.statusCode || null;
                        const contentType = this.contentType ? filter_content_type(this.contentType) : null;
                        if (is_renderable_string(res)) {
                            if (contentType) {
                                response.setHeader('Content-Type', contentType);
                            }
                            if (is_integer(code)) {
                                // set as multi status
                                response.status(code);
                            }
                            response.end(res, () => {
                                this.#reset();
                                resolve(res);
                            });
                            return;
                        } else if (is_renderable_object(res)) {
                            this.json(res, code, response).then(resolve).catch(reject).finally(() => {
                                this.#reset();
                            });
                            return;
                        } else {
                            next();
                        }
                    }
                    this.#reset();
                    resolve(res);
                }
                if (is_promise(res)) {
                    let timeout = new Promise((_, reject) => {
                        timeoutPid = setTimeout(() => {
                            this.#reset();
                            reject(new ResponseTimeoutException(
                                __('Route timeout')
                            ));
                        }, 5000); // 5 seconds
                    });
                    Promise.race([res, timeout]).then(try_handle).catch((e) => {
                        if (timeoutPid) {
                            clearTimeout(timeoutPid);
                            timeoutPid = null;
                        }
                        this.#reset();
                        reject(e);
                    });
                    return;
                }
                try_handle(res);
                this.#reset();
            } catch (err) {
                this.#reset();
                reject(err);
            }
        });
    }

    /**
     * Reset
     *
     * @return {void}
     */
    #reset() {
        this.#statusCode = null;
        this.#contentType = null;
        this.#request = undefined;
        this.#response = undefined;
        this.#in_dispatch = false;
    }

    /**
     * Send
     *
     * @param {any} data
     * @param {{[headerKey: string]: string}} headers
     * @param {number} code
     * @return {Promise<unknown>}
     */
    send(data, headers = {}, code = null) {
        return new Promise(async (resolve, reject) => {
            const statusCode = this.statusCode;
            if (!this.response) {
                reject(new RuntimeException(
                    __('Response object is invalid')
                ));
                return;
            }
            code = is_numeric_integer(code) ? code : (statusCode || this.response.statusCode || null)
            if (HTTP_MESSAGES[code] === undefined) {
                reject(new RuntimeException(
                    __('Invalid HTTP code')
                ));
                return;
            }
            if (headers && is_object(headers)) {
                for (let key in headers) {
                    if (!headers.hasOwnProperty(key)
                        || !is_string(headers[key])
                    ) {
                        continue;
                    }
                    this.response.setHeader(key, headers[key]);
                }
            }
            if (is_integer(code)) {
                this.response.status(code);
            }
            if (is_object(data)) {
                this.jsonObject.send(data, code, this.response).then(resolve).catch(reject);
                return;
            }
            this.response.end(data, () => {
                resolve(null);
            });
        });
    }

    /**
     * Render template
     *
     * @param {string} viewPath
     * @param {{[key:string]: any}} attributes
     * @param {?number} code
     * @return {Promise<unknown>}
     */
    render(viewPath, attributes = {}, code = null) {
        return new Promise((resolve, reject) => {
            const statusCode = this.statusCode;
            if (!this.response) {
                reject(new RuntimeException(
                    __('Response object is invalid')
                ));
                return;
            }
            if (!is_object(attributes) && is_numeric(attributes)) {
                code = attributes;
                attributes = {};
            }
            if (!is_numeric_integer(code) && attributes && is_object(attributes)
                && is_numeric_integer(attributes.code)
            ) {
                code = intval(attributes.code);
            }
            code = is_numeric_integer(code) ? code : (statusCode || this.response.statusCode || null);
            if (code && HTTP_MESSAGES[code] === undefined) {
                reject(new RuntimeException(
                    __('Invalid HTTP code')
                ));
                return;
            }
            if (attributes.headers && is_object(attributes.headers)) {
                for (let key in attributes.headers) {
                    if (!attributes.headers.hasOwnProperty(key)
                        || !is_string(attributes.headers[key])
                    ) {
                        continue;
                    }
                    this.response.setHeader(key, attributes.headers[key]);
                }
            }
            if (is_integer(code)) {
            }
            return this.response.render(viewPath, attributes, (err, html) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(html);
            });
        });
    }

    /**
     * Dispatch the route
     *
     * @param {Request} _request
     * @param {Response} _response
     * @param {(arg?:any) => void|any} next
     * @return {any}
     * @abstract
     */
    dispatch(_request, _response, next) {
        next();
    }
}
