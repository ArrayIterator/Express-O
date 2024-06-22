// noinspection JSUnusedGlobalSymbols

import express from "express";
import {
    is_array,
    is_empty,
    is_function, is_numeric, is_numeric_integer,
    is_object,
    is_promise,
    is_regexp,
    is_string
} from "../helpers/Is.js";
import InvalidArgumentException from "../errors/exceptions/InvalidArgumentException.js";
import {sprintf} from "../helpers/Formatting.js";
import Methods, {ALL} from "./Methods.js";
import RouteException from "../errors/exceptions/RouteException.js";
import Exception from "../errors/exceptions/Exception.js";
import {E_ERROR} from "../errors/exceptions/ErrorCode.js";
import {__} from "../l10n/Translator.js";
import AbstractRoute from "./AbstractRoute.js";
import RuntimeException from "../errors/exceptions/RuntimeException.js";
import {floatval, intval} from "../helpers/DataType.js";

const {request: Request, response: Response} = express;

let increment = 0;

/**
 * @template {(req: Request, res: Response, next: NextHandler) => any} RouteHandler
 * @template {(err: any) => any} NextHandler
 */
export default class Route {

    /**
     * Invalid methods
     *
     * @type {string[]}
     * @private
     */
    _invalidMethods = [];

    /**
     * Constructor
     *
     * @param {string|RegExp} path
     * @param {RouteHandler} handler
     * @param {string[]|string} methods
     * @param {string} name
     * @param {number} priority
     */
    constructor({path, methods, handler, name, priority = 0}) {
        if (!is_string(path) && !is_regexp(path)) {
            throw new InvalidArgumentException(
                sprintf(
                    __('Path must be as a string or RegExp, %s given.'),
                    path === null ? path : typeof path
                )
            )
        }

        if (!is_function(handler)) {
            throw new InvalidArgumentException(
                sprintf(
                    __('Handler must be as a function, %s given.'),
                    handler === null ? handler : typeof handler
                )
            )
        }
        methods = typeof methods === 'string' ? [methods] : methods;
        if (is_object(methods) || is_array(methods)) {
            methods = Object.values(methods);
        }
        if (is_empty(methods)) {
            methods = [ALL];
        }
        if (!is_array(methods)) {
            throw new InvalidArgumentException(
                sprintf(
                    __('Method should array, %s given.'),
                    methods === null ? methods : typeof methods
                )
            )
        }
        this._priority = !is_numeric(priority) ? 0 : (
            is_numeric_integer(priority) ? intval(priority) : floatval(priority)
        );
        this._path = path;
        this._id = ++increment;
        this._name = !is_string(name) ? `route-${this._id}` : name;
        this._handler = handler;
        this._methods = [];
        this.setMethods(methods);
    }

    /**
     * Priority
     *
     * @type {number}
     * @private
     */
    _priority = 0;

    /**
     * Priority
     *
     * @return {number}
     */
    get priority() {
        return this._priority;
    }

    /**
     * Set priority
     *
     * @param {number} priority
     */
    set priority(priority) {
        this.setPriority(priority);
    }

    /**
     * Path of route
     *
     * @type {string|RegExp}
     * @private
     */
    _path;

    /**
     * Get path
     *
     * @return {string|RegExp}
     */
    get path() {
        return this._path;
    }

    /**
     * ID of route
     *
     * @type {number} id increment as integer
     * @private
     */
    _id;

    /**
     * Get id
     *
     * @return {number} integer
     */
    get id() {
        return this._id;
    }

    /**
     * Route name
     *
     * @type {string} name of route
     * @private
     */
    _name;

    /**
     * Get route name
     *
     * @return {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Set route name
     *
     * @param {string} name
     */
    set name(name) {
        this.setName(name);
    }

    /**
     * Methods
     *
     * @type {string[]}
     * @private
     */
    _methods = [];

    /**
     * Get methods
     *
     * @return {string[]}
     */
    get methods() {
        return this._methods;
    }

    /**
     * Route handler
     *
     * @type {RouteHandler}
     * @private
     */
    _handler;

    /**
     * Get route handler
     *
     * @return {RouteHandler}
     */
    get handler() {
        return this._handler;
    }

    /**
     * Create new route
     *
     * @param {string|RegExp} path
     * @param {RouteHandler} handler
     * @param {string[]|string} methods
     * @param {string} name
     * @param {number} priority
     * @return {Route}
     */
    static Create({path, methods, handler, name, priority}) {
        return new Route({path, methods, handler, name, priority});
    }

    /**
     * Create route from abstract route
     *
     * @param {AbstractRoute|Function<AbstractRoute>} route
     * @return {Route}
     * @constructor
     */
    static CreateFromAbstractRoute(route) {
        if (typeof route === "function" && route.prototype instanceof AbstractRoute) {
            route = new route();
        }
        if (!(route instanceof AbstractRoute)) {
            throw new InvalidArgumentException(
                sprintf(
                    __('Route must be an instance of AbstractRoute, %s given.'),
                    route === null ? route : typeof route
                )
            );
        }
        if (!is_string(route.path) && !is_regexp(route.path)) {
            throw new RuntimeException(
                sprintf(
                    __('Route path must be as a string, the existing type is : %s.'),
                    route.path === null ? route.path : typeof route.path
                )
            );
        }
        let name = route.name;
        let priority = route.priority;
        if (!is_string(name)) {
            name = route.constructor.name;
        }
        if (!is_numeric(priority)) {
            priority = 0;
        }

        /**
         * @type {AbstractRoute} route
         */
        return new Route({
            path: route.path,
            methods: route.methods,
            handler: route.dispatchRoute.bind(route),
            name,
            priority
        });
    }

    /**
     * Set priority
     *
     * @param {number} priority
     * @return {Route}
     */
    setPriority(priority) {
        this._priority = !is_numeric(priority) ? this.priority : parseInt(priority);
        return this;
    }

    /**
     * Set methods
     * @param {Array<string>} methods
     */
    setMethods(methods) {
        if (!is_array(methods)) {
            throw new InvalidArgumentException(
                sprintf(
                    __('Method should array, %s given.'),
                    methods === null ? methods : typeof methods
                )
            )
        }
        this._invalidMethods = [];
        for (let i = 0; methods.length > i; i++) {
            if (!is_string(methods[i])) {
                continue;
            }
            methods[i] = methods[i].trim().toUpperCase();
            if (!methods[i]) {
                continue;
            }
            if (Methods.isValid(methods[i])) {
                this._methods.push(methods[i]);
                continue;
            }
            if (this._invalidMethods.includes(methods[i])) {
                continue;
            }
            this._invalidMethods.push(methods[i]);
        }
        return this;
    }

    /**
     * Add methods
     *
     * @param {string} method method name
     * @return {Route} Route instance
     */
    removeMethod(method) {
        if (!is_string(method)) {
            return this;
        }
        method = method.trim().toUpperCase();
        if (!method) {
            return this;
        }
        if (!Methods.isValid(method)) {
            return this;
        }
        const index = this._methods.indexOf(method);
        if (index < 0) {
            return this;
        }
        this._methods.splice(index, 1);
        return this;
    }

    /**
     * Add method
     *
     * @param {string} method
     * @return {Route}
     */
    addMethod(method) {
        if (!is_string(method)) {
            throw new InvalidArgumentException(
                sprintf(
                    __('Method should be a string, %s given.'),
                    method === null ? method : typeof method
                )
            )
        }
        method = method.trim().toUpperCase();
        if (!method) {
            return this;
        }
        if (!Methods.isValid(method)) {
            return this;
        }
        if (this._methods.includes(method)) {
            return this;
        }
        this._methods.push(method);
        return this;
    }

    /**
     * Dispatch route
     *
     * @param {Express.Request} req
     * @param {Express.Response} res
     * @param {NextHandler} next
     * @return {Promise<?>}
     */
    dispatch(req, res, next) {
        return new Promise((resolve, reject) => {
            const handleError = (e) => {
                if (e instanceof RouteException) {
                    reject(e);
                    return;
                }
                if (e instanceof Exception) {
                    reject(new RouteException(e.message, e.error_code, RouteException));
                    return;
                }
                if (e instanceof Error) {
                    reject(new RouteException(e.message, E_ERROR, e));
                    return;
                }
                reject(new RouteException(__('Route Error'), E_ERROR, e));
            };
            try {
                let response = this.handler(req, res, next);
                if (is_promise(response)) {
                    response.then(resolve).catch(handleError);
                    return;
                }
                resolve(response);
            } catch (err) {
                handleError(err);
            }
        });
    }

    /**
     * Set route name
     *
     * @param {string} name
     * @return {Route}
     */
    setName(name) {
        if (is_string(name)) {
            this._name = name;
        }
        return this;
    }
}
