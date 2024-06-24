// noinspection JSUnusedGlobalSymbols

/**
 * @typedef {http.IncomingMessage&Express.Request} Request
 * @typedef {http.OutgoingMessage&Express.Response} Response
 * @typedef {(req: Request, res: Response, next?: NextHandler) => any} RouteHandler
 * @typedef {(err: any) => any} NextHandler
 */

import Route from "./Route.js";
import InvalidArgumentException from "../errors/exceptions/InvalidArgumentException.js";
import {sprintf} from "../helpers/Formatting.js";
import {is_function, is_integer, is_numeric_integer, is_promise, is_string} from "../helpers/Is.js";
import {intval} from "../helpers/DataType.js";
import {ALL, CONNECT, DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT, TRACE} from "./Methods.js";
import {__} from "../l10n/Translator.js";
import Controller from "../abstracts/Controller.js";
import {Application} from "../app/Application.js";


/**
 * Router
 */
export default class Router {

    /**
     * Routes
     *
     * @type {{[key: number]: Route}}
     * @private
     */
    _routes = {};

    /**
     * Get length
     * @return {number}
     */
    get length() {
        return Object.keys(this._routes).length;
    }

    /**
     * Determine id
     *
     * @param {Route|number|string} idOrRoute Route instance or id
     * @return {?number} Route id
     */
    static determineId(idOrRoute) {
        if ((idOrRoute instanceof Route)) {
            idOrRoute = idOrRoute.id;
        }
        if (!is_integer(idOrRoute) && is_numeric_integer(idOrRoute)) {
            idOrRoute = intval(idOrRoute);
        }
        if (!is_integer(idOrRoute)) {
            return null;
        }
        return idOrRoute;
    }

    /**
     * Add route
     *
     * @param {Route} route Route instance
     * @return {Router}
     */
    addRoute(route) {
        if (!(route instanceof Route)) {
            throw new InvalidArgumentException(
                sprintf(
                    __('Argument route must be instance of %s, %s given'),
                    Route.constructor.name,
                    typeof route
                )
            )
        }
        this._routes[route.id] = route;
        return this;
    }

    /**
     * Delete route
     *
     * @param {Route|number|string} idOrRoute
     * @return {Route|null}
     */
    deleteRoute(idOrRoute) {
        idOrRoute = Router.determineId(idOrRoute);
        if (!is_integer(idOrRoute)) {
            return null;
        }
        const route = this._routes[idOrRoute];
        delete this._routes[idOrRoute];
        return route || null;
    }

    /**
     * Check if route exists
     *
     * @param {Route|number|string} idOrRoute
     * @return {boolean} true if route exists
     */
    hasRoute(idOrRoute) {
        idOrRoute = Router.determineId(idOrRoute);
        return idOrRoute && this._routes.hasOwnProperty(idOrRoute);
    }

    /**
     * Get route by id
     *
     * @param idOrRoute
     * @return {?Route} Route instance
     */
    getRoute(idOrRoute) {
        idOrRoute = Router.determineId(idOrRoute);
        return idOrRoute ? (this._routes[idOrRoute] || null) : null;
    }

    /**
     * Get route by name
     *
     * @param {string} name Route name
     * @return {?{[id: number] : Route}} Route instance collection
     */
    getRoutesByName(name) {
        if (!is_string(name)) {
            return null;
        }
        const routes = {};
        for (let route of Object.values(this._routes)) {
            if (route.name === name) {
                routes[route.id] = route;
            }
        }
        return Object.keys(routes).length ? routes : null;
    }

    /**
     * Apply routes to express app
     *
     * @param {Application} app Express app
     */
    apply(app) {
        if (!(app instanceof Application)) {
            return;
        }
        const express = app.express;
        if (!express) {
            return;
        }
        // sort route by priority of route sort first by priority
        for (let route of Object.values(this._routes).sort((a, b) => a.priority - b.priority)) {
            for (let method of route.methods) {
                method = method.toLowerCase();
                if (!is_function(express[method])) {
                    continue;
                }
                express[method](route.path, (req, res, next) => {
                    if (route instanceof Controller) {
                        route.setJson(app.getJsonObject());
                    }
                    let _r = route.dispatch.bind(route)(req, res, next);
                    if (is_promise(_r)) {
                        _r.catch(next);
                    }
                });
            }
        }
    }

    /**
     * Get route entries
     *
     * @return {[string|number, Route[]]}
     */
    entries() {
        return Object.entries(this._routes);
    }

    /**
     * Iterator
     *
     * @return {Generator<(string|Route)[], void, *>}
     */
    * [Symbol.iterator]() {
        for (let value of this.entries()) {
            yield value;
        }
    }

    /**
     * Iterator
     *
     * @return {[string|number,Route[]]}
     */
    [Symbol.iterator]() {
        return this.entries();
    }

    /* ----------------------------- route methods ----------------------------- */

    /**
     * Add route
     *
     * @param {string|RegExp} path Path of route
     * @param {RouteHandler} handler
     * @param {string[]|string} methods
     * @param {?string} name
     * @return {Route}
     */
    route(path, handler, methods, name = null) {
        const route = Route.Create({path, methods, handler});
        if (name) {
            route.setName(name);
        }
        this.addRoute(route);
        return route;
    }

    /**
     * Add route with method get
     *
     * @param {string|RegExp} path
     * @param {RouteHandler} handler
     * @param {?string} name
     * @return {Route}
     */
    get(path, handler, name = null) {
        return this.route(path, handler, GET, name);
    }

    /**
     * Add route with method post
     *
     * @param {string|RegExp} path
     * @param {RouteHandler} handler
     * @param {?string} name
     * @return {Route}
     */
    post(path, handler, name = null) {
        return this.route(path, handler, POST, name);
    }

    /**
     * Add route with method put
     *
     * @param {string|RegExp} path
     * @param {RouteHandler} handler
     * @param {?string} name
     * @return {Route}
     */
    put(path, handler, name = null) {
        return this.route(path, handler, PUT, name);
    }

    /**
     * Add route with method delete
     *
     * @param {string|RegExp} path
     * @param {RouteHandler} handler
     * @param {?string} name
     * @return {Route}
     */
    delete(path, handler, name = null) {
        return this.route(path, handler, DELETE, name);
    }

    /**
     * Add route with method patch
     *
     * @param {string|RegExp} path
     * @param {RouteHandler} handler
     * @param {?string} name
     * @return {Route}
     */
    patch(path, handler, name = null) {
        return this.route(path, handler, PATCH, name);
    }

    /**
     * Add route with method options
     *
     * @param {string|RegExp} path
     * @param {RouteHandler} handler
     * @param {?string} name
     * @return {Route}
     */
    options(path, handler, name = null) {
        return this.route(path, handler, OPTIONS, name);
    }

    /**
     * Add route with method head
     *
     * @param {string|RegExp} path
     * @param {RouteHandler} handler
     * @param {?string} name
     * @return {Route}
     */
    head(path, handler, name = null) {
        return this.route(path, handler, HEAD, name);
    }

    /**
     * Add route with method connect
     *
     * @param {string|RegExp} path
     * @param {RouteHandler} handler
     * @param {?string} name
     * @return {Route}
     */
    connect(path, handler, name = null) {
        return this.route(path, handler, CONNECT, name);
    }

    /**
     * Add route with method trace
     *
     * @param {string|RegExp} path
     * @param {RouteHandler} handler
     * @param {?string} name
     * @return {Route}
     */
    trace(path, handler, name = null) {
        return this.route(path, handler, TRACE, name);
    }

    /**
     * Add route with any methods
     *
     * @param {string|RegExp} path
     * @param {RouteHandler} handler
     * @param {?string} name
     * @return {Route}
     */
    any(path, handler, name = null) {
        return this.route(path, handler, [
            GET,
            POST,
            PUT,
            DELETE,
            PATCH,
            OPTIONS,
            HEAD,
            CONNECT,
            TRACE
        ], name);
    }

    /**
     * Add route with all methods
     *
     * @param {string|RegExp} path
     * @param {RouteHandler} handler
     * @param {?string} name
     * @return {Route}
     */
    all(path, handler, name = null) {
        return this.route(path, handler, ALL, name);
    }
}
