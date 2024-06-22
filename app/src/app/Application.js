// noinspection JSUnusedGlobalSymbols

import express from "express";
import fs, {accessSync, existsSync, statSync} from "node:fs";
import tls from "node:tls";
import http from "node:http";
import https, {Server} from "node:https";
import {
    is_array,
    is_boolean,
    is_function,
    is_integer,
    is_number,
    is_numeric_integer,
    is_object,
    is_string
} from "../helpers/Is.js";
import Router from "../router/Router.js";
import {sprintf} from "../helpers/Formatting.js";
import OutOfRangeException from "../errors/exceptions/OutOfRangeException.js";
import InvalidArgumentException from "../errors/exceptions/InvalidArgumentException.js";
import {BLACKLIST_PORT, PORT_RANGE_END, PORT_RANGE_START, TIMEOUT} from "../helpers/Constant.js";
import {intval} from "../helpers/DataType.js";
import RuntimeException from "../errors/exceptions/RuntimeException.js";
import PortTester from "../helpers/PortTester.js";
import MiddlewareHandler from "./middlewares/MiddlewareHandler.js";
import MiddlewareNotfoundHandler from "./middlewares/MiddlewareNotfoundHandler.js";
import {debug, error, warn} from "./Logger.js";
import ReactEngine, {RegisterReactEngine} from "../engine/react/ReactEngine.js";
import Config, {MIDDLEWARES_DIR, ROUTES_DIR, SRC_VIEWS_DIR, VIEWS_DIR} from "./Config.js";
import MiddlewareErrorHandler from "./middlewares/MiddlewareErrorHandler.js";
import MiddlewareGlobalErrorHandler from "./middlewares/MiddlewareGlobalErrorHandler.js";
import {__} from "../l10n/Translator.js";
import AbstractRoute from "../router/AbstractRoute.js";
import Route from "../router/Route.js";
import path from "node:path";
import Json from "./Json.js";
import AbstractMiddleware from "./AbstractMiddleware.js";

const {request: Request, response: Response} = express;

// set strict routing
express.Router({caseSensitive: true, strict: true});

/**
 * Collect files from directory
 *
 * @param {string} directory
 * @param {number} maxDepth
 * @return {string[]}
 */
const CollectFiles = (directory, maxDepth = 10) => {
    maxDepth = !is_integer(maxDepth) ? 10 : maxDepth;
    let files = [];
    // deep scan
    const readDir = (dir, depth = 1) => {
        if (depth > maxDepth) {
            return;
        }
        fs.readdirSync(dir).forEach((file) => {
            const _path = path.resolve(dir, file);
            const stats = statSync(_path);
            if (stats.isDirectory()) {
                return readDir(_path, depth + 1);
            }
            if (stats.isFile()) {
                files.push(_path);
            }
        })
    }
    readDir(directory);
    return files;
}

/**
 * Scan route directory to router
 *
 * @param {Router} router
 * @param maxDepth
 * @return {Promise<number[]>}
 */
export const ScanRouteDirectoryToRouter = (router, maxDepth = 10) => {
    return new Promise(async (resolve) => {
        if (!existsSync(ROUTES_DIR) || !statSync(ROUTES_DIR).isDirectory()) {
            resolve();
            return;
        }
        try {
            accessSync(ROUTES_DIR, fs.constants.R_OK);
        } catch (err) {
            resolve();
            return;
        }
        let routes =  [];
        let files = CollectFiles(ROUTES_DIR, maxDepth);
        while (files.length) {
            let file = files.shift();
            try {
                let route = await import(file).catch(() => null).then((module) => module ? module.default : undefined);
                if (!route) {
                    continue;
                }
                const instance = route instanceof AbstractRoute;
                if (instance || is_function(route) && route.prototype && route.prototype instanceof AbstractRoute) {
                    if (!instance) {
                        route = new route();
                    }
                    if (!(route instanceof AbstractRoute)) {
                        continue;
                    }
                    let _route = Route.CreateFromAbstractRoute(route);
                    router.addRoute(_route);
                    try {
                        Object.defineProperty(route, '__filename', {
                            value: file,
                            writable: false
                        });
                        Object.defineProperty(route, '__route_id', {
                            value: _route.id,
                            writable: true,
                            configurable: true,
                            enumerable: true
                        });
                    } catch (e) {
                        // pass
                    }
                    routes.push(_route.id);
                }
            } catch (err) {
                warn('routeScanner', err);
                // pass
            }
        }
        resolve(routes);
        return routes;
    });
}

/**
 * Scan middleware directory
 *
 * @param {Application} app
 * @param maxDepth
 * @return {Promise<number[]>}
 */
export const ScanMiddlewareDirectory = (app, maxDepth = 10) => {
    return new Promise(async (resolve) => {
        if (!existsSync(MIDDLEWARES_DIR) || !statSync(MIDDLEWARES_DIR).isDirectory()) {
            resolve();
            return;
        }
        try {
            accessSync(MIDDLEWARES_DIR, fs.constants.R_OK);
        } catch (err) {
            resolve();
            return;
        }

        let files = CollectFiles(MIDDLEWARES_DIR, maxDepth);
        /**
         * Middlewares id
         *
         * @type {number[]}
         */
        let middlewares = [];
        while (files.length) {
            let file = files.shift();
            try {
                let middleware = await import(file).catch(() => null).then((module) => module ? module.default : undefined);
                if (!middleware) {
                    continue;
                }
                if (is_function(middleware) && middleware.prototype && middleware.prototype instanceof AbstractMiddleware) {
                    middleware = new middleware();
                }
                if (!(middleware instanceof AbstractMiddleware)) {
                    continue;
                }
                if (!is_function(middleware.dispatch)) {
                    continue;
                }
                app.addMiddleware(middleware);
                middlewares.push(middleware.middlewareId);
            } catch (err) {
                warn('middlewareScanner', err);
                // pass
            }
        }
        resolve(middlewares);
        return middlewares;
    });
}

/**
 * @template {(err: any) => any} NextHandler
 * @template {(err: Error, req: Request, res: Response, next?: NextHandler) => any} ErrorHandler
 * @template {(req: Request, res: Response, next?: NextHandler) => any} RouteHandler
 */
export class Application {
    /**
     * Registered route id
     *
     * @type {number[]}
     */
    #registeredRouteScannedId = [];

    /**
     * Registered middleware id
     *
     * @type {number[]}
     */
    #registeredMiddlewareScannedId = [];

    /**
     * Server
     *
     * @type {Server}
     * @private
     */
    _server;

    /**
     * App Constructor
     */
    constructor() {
        this._timeout = TIMEOUT;
        this.addMiddleware(MiddlewareHandler);
        this._reactEngine = new ReactEngine({
            viewsDir: VIEWS_DIR,
            staticMarkup: false,
            extensions: ['.tsx', '.jsx'],
            docType: '<!DOCTYPE html>'
        });
        let port = Config.get('environment.port');
        let ssl = Config.get('environment.ssl');
        let timeout = Config.get('environment.timeout');
        let _public = Config.get('environment.public');
        if (is_integer(port)) {
            this.setServerPort(port);
        }
        if (is_object(ssl) && is_string(ssl.key) && is_string(ssl.cert)) {
            this.setSSLCert(ssl.key, ssl.cert);
        }
        this.enableSSL(!!ssl.enable);
        if (is_integer(timeout)) {
            this.setTimeout(timeout);
        }
        if (is_boolean(_public)) {
            this.setAsPublic(_public);
        }
        this._jsonObject = new Json();
    }

    /**
     * @type {Json}
     *
     * @private
     */
    _jsonObject;

    /**
     * Get json
     *
     * @return {Json}
     */
    get jsonObject() {
        return this.getJsonObject();
    }

    /**
     * React engine
     *
     * @type {ReactEngine}
     * @private
     */
    _reactEngine;

    /**
     * Get react engine
     *
     * @return {ReactEngine}
     */
    get reactEngine() {
        return this._reactEngine;
    }

    /**
     * Timeout for express server
     *
     * @type {number}
     * @private
     */
    _timeout;

    /**
     * Get timeout
     *
     * @return {number}
     */
    get timeout() {
        return this._timeout;
    }

    /**
     * Express app
     *
     * @type {?Express}
     * @private
     */
    _express = null;

    /**
     * Get express app
     *
     * @return {?Express}
     */
    get express() {
        return this._express;
    }

    /**
     * Hostname to use
     *
     * @type {"127.0.0.1"|"0.0.0.0"}
     * @private
     */
    _hostname = '127.0.0.1';

    /**
     * Get hostname
     *
     * @return {string}
     */
    get hostname() {
        return this._hostname;
    }

    /**
     * Check if public accessible
     *
     * @return {boolean}
     */
    get is_public() {
        return this._hostname === '0.0.0.0';
    }

    /**
     * Set public
     *
     * @param {boolean} use_public
     */
    set is_public(use_public) {
        this.setAsPublic(use_public);
    }

    /**
     * Server port
     *
     * @type {?number}
     * @private
     */
    _serverPort = null;

    /**
     * Get server port
     *
     * @return {?number}
     */
    get serverPort() {
        return this._serverPort;
    }

    /**
     * Set Server port
     *
     * @param {number} port
     */
    set serverPort(port) {
        this.setServerPort(port);
    }

    /**
     * Router
     *
     * @type {Router}
     * @private
     */
    _router;

    /**
     * Get router
     *
     * @return {Router}
     */
    get router() {
        if (!this._router) {
            this._router = new Router(this);
        }
        return this._router;
    }

    /**
     * Middlewares
     *
     * @type {[AbstractMiddleware]}
     * @private
     */
    _middlewares = [];

    /**
     * Get Middlewares
     *
     * @return {[AbstractMiddleware]}
     */
    get middlewares() {
        return this._middlewares;
    }

    /**
     * Error handlers
     *
     * @type {?ErrorHandler}
     * @private
     */
    _errorHandler = null;

    /**
     * Get error handler
     *
     * @return {?ErrorHandler}
     */
    get errorHandler() {
        return this._errorHandler;
    }

    /**
     * Ser error handler
     *
     * @param {ErrorHandler} handler
     */
    set errorHandler(handler) {
        this.setErrorHandler(handler);
    }

    /**
     * Not found handler
     *
     * @type {?RouteHandler}
     * @private
     */
    _notFoundHandler = null;

    /**
     * Get not found handler
     *
     * @return {?RouteHandler}
     */
    get notFoundHandler() {
        return this._notFoundHandler;
    }

    /**
     * Ser not found handler
     *
     * @param {RouteHandler} handler
     */
    set notFoundHandler(handler) {
        this.setNotFoundHandler(handler);
    }

    /**
     * SSL key
     *
     * @type {?string}
     * @private
     */
    _sslKey = null;

    /**
     * Get ssl key
     *
     * @return {?string}
     */
    get sslKey() {
        return this._sslKey;
    }

    /**
     * SSL certificate
     *
     * @type {?string}
     * @private
     */
    _sslCert = null;

    /**
     * Get ssl cert
     *
     * @return {?string}
     */
    get sslCert() {
        return this._sslCert;
    }

    /**
     * If use ssl
     *
     * @type {boolean}
     * @private
     */
    _is_ssl = false;

    /**
     * Enable SSL
     *
     * @param boolean
     */
    enableSSL(boolean) {
        this.is_ssl = !!boolean;
    }

    /**
     * Set use ssl
     *
     * @param boolean
     */
    set is_ssl(boolean) {
        this._is_ssl = !!boolean;
    }

    /**
     * Check if use ssl
     *
     * @return {boolean}
     */
    get is_ssl() {
        return this._is_ssl && !!this.sslKey && !!this.sslCert;
    }

    /**
     * Check if server running
     *
     * @return {boolean}
     */
    get running() {
        return !!this._server;
    }

    /**
     * Get json
     *
     * @return {Json}
     */
    getJsonObject() {
        return this._jsonObject;
    }

    /**
     * Set as public
     *
     * @param {boolean} boolean
     * @return {Application}
     */
    setAsPublic(boolean) {
        if (this.running) {
            // ignore if server already started
            return this;
        }
        this._hostname = !!boolean ? '0.0.0.0' : '127.0.0.1';
        return this;
    }

    /**
     * Set SSL, if value is not valid ssl cert ssl will set to false
     * if is already running, it will ignore
     *
     * @param {string} key file path or key string
     * @param {string} cert file path or cert string
     * @return {Application}
     */
    setSSLCert(key, cert) {
        if (this.running) {
            // ignore if server already started
            return this;
        }
        if (!is_string(key) || !is_string(cert) || key.trim() === '' || cert.trim() === '') {
            this._sslCert = null;
            this._sslKey = null;
            return this;
        }
        let existKey = /^\s*-+BEGIN.+PRIVATE.+KEY.+-+/.test(key);
        let existCert = /^\s*-+BEGIN.+CERTIFICATE.+-+/.test(cert);
        let isKeyFile = !existKey;
        let isCertFile = !existCert;
        existKey = existKey || fs.existsSync(key);
        existCert = existCert || fs.existsSync(cert);
        if (!existKey || !existCert) {
            this._sslCert = null;
            this._sslKey = null;
            return this;
        }
        cert = isCertFile ? fs.readFileSync(cert) : cert;
        key = isKeyFile ? fs.readFileSync(key) : key;
        try {
            // check if cert valid ssl cert
            tls.createSecureContext({key, cert});
            this._sslKey = key;
            this._sslCert = cert;
        } catch (e) {
            this._sslCert = null;
            this._sslKey = null;
        }
        return this;
    }

    /**
     * Set timeout
     *
     * @param {number} number
     */
    setTimeout(number) {
        if (this.running) {
            // ignore if server already started
            return;
        }
        number = is_numeric_integer(number) ? intval(number) : number;
        if (!is_number(number)) {
            throw new InvalidArgumentException(
                sprintf(__('Timeout should be number, %s given.'), number === null ? number : typeof number)
            )
        }
        this._timeout = number;
    }

    /**
     * Ser error handler
     *
     * @param {ErrorHandler|AbstractMiddleware} handler
     * @return {this}
     */
    setErrorHandler(handler) {
        if (this.running) {
            // ignore if server already started
            return this;
        }
        if (handler instanceof AbstractMiddleware) {
            handler = handler.dispatch;
            if (!is_function(handler)) {
                return this;
            }
        }
        if (!is_function(handler)) {
            throw new InvalidArgumentException(
                sprintf(
                    __('Error handler must be a function, %s given.'),
                    handler === null ? handler : typeof handler
                )
            );
        }
        this._errorHandler = handler;
        return this;
    }

    /**
     * Ser not found handler
     *
     * @param {RouteHandler|AbstractMiddleware} handler
     * @return {this}
     */
    setNotFoundHandler(handler) {
        if (this.running) {
            // ignore if server already started
            return this;
        }
        if (handler instanceof AbstractMiddleware) {
            handler = handler.dispatch;
            if (!is_function(handler)) {
                return this;
            }
        }
        if (!is_function(handler)) {
            throw new InvalidArgumentException(
                sprintf(
                    __('Not found handler must be a function, %s given.'),
                    handler === null ? handler : typeof handler
                )
            );
        }
        this._notFoundHandler = handler;
        return this;
    }

    /**
     * Add middleware to the app
     *
     * @param {AbstractMiddleware} middleware
     * @return {this}
     */
    addMiddleware(middleware) {
        if (this.running) {
            // ignore if server already started
            return this;
        }
        // check if function of middleware
        if (is_function(middleware) && middleware.prototype && middleware.prototype instanceof AbstractMiddleware) {
            if (!is_function(middleware.prototype.dispatch)) {
                return this;
            }
            middleware = new middleware();
        }
        if (!(middleware instanceof AbstractMiddleware)) {
            return this;
        }
        if (!is_function(middleware.dispatch)) {
            return this;
        }
        if (this._middlewares.find((m) => m.id === middleware.id)) {
            return this;
        }
        this._middlewares.push(middleware);
        return this;
    }

    /**
     * Remove middleware from the app
     *
     * @param {number|AbstractMiddleware} middlewareOrId
     * @return {Application}
     */
    removeMiddleware(middlewareOrId) {
        if (this.running) {
            // ignore if server already started
            return this;
        }
        if ((middlewareOrId instanceof AbstractMiddleware)) {
           middlewareOrId = middlewareOrId.id;
        }
        if (!is_integer(middlewareOrId)) {
            return this;
        }
        this._middlewares = this._middlewares.filter((m) => m.id !== middlewareOrId);
        return this;
    }

    /**
     * Add middleware to the app
     *
     * @param {InstanceType<AbstractMiddleware>} middleware
     * @return {this}
     */
    use(middleware) {
        return this.addMiddleware(middleware);
    }

    /**
     * Check if port is blacklisted
     *
     * @param {number} port
     * @return {boolean}
     */
    isBlacklistedPort(port) {
        port = is_numeric_integer(port) ? intval(port) : port;
        if (!is_integer(port)) {
            throw new InvalidArgumentException(
                sprintf(__('Port should be number, %s given.'), port === null ? port : typeof port)
            );
        }
        return BLACKLIST_PORT.includes(port);
    }

    /**
     * Set server port
     *
     * @param port
     * @return {Application}
     */
    setServerPort(port) {
        if (this.running) {
            return this;
        }
        port = is_numeric_integer(port) ? intval(port) : port;
        if (!is_integer(port)) {
            throw new InvalidArgumentException(
                sprintf(
                    __('Server port should number, %s given.'),
                    port === null ? port : typeof port
                )
            );
        }
        if (this.isBlacklistedPort(port)) {
            throw new InvalidArgumentException(
                sprintf(__('Port %d is blacklisted.'), port)
            );
        }
        if (port < 1 || port > 65535) {
            throw new OutOfRangeException(
                sprintf(__('Server port should between 1 and 65535, but %d given.'), port)
            )
        }

        this._serverPort = port;

        return this;
    }

    /**
     * Close server
     *
     * @return {Promise<unknown>}
     */
    close() {
        return new Promise((resolve, reject) => {
            if (this._server) {
                this._server.close((err) => {
                    this._server = null;
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(this);
                });
            }
            resolve(this);
        });
    }

    /**
     * Start server
     *
     * @return {Promise<unknown>}
     */
    start() {
        return new Promise(async (resolve, reject) => {
            if (this._server) {
                reject(new RuntimeException(
                    __('Server already started')
                ))
                return;
            }
            let port = this._serverPort;
            if (port === 443 && (!this.sslKey || !this.sslCert)) {
                reject(new RuntimeException(
                    __('SSL key and cert required for port 443')
                ));
                return;
            }
            this._is_ssl = port === 443 || this.is_ssl;
            if (!port) {
                debug('server', __('No port set, finding available ports.'));
                for (let i = PORT_RANGE_START; i <= PORT_RANGE_END; i++) {
                    if (this.isBlacklistedPort(i)) {
                        continue;
                    }
                    let _port = await PortTester(i, this.hostname).catch(() => null);
                    if (!is_integer(_port)) {
                        continue;
                    }
                    port = _port;
                    break;
                }
            }

            if (!port) {
                reject(new RuntimeException(
                    __('No available port found')
                ));
                return;
            }

            /**
             * @type {Server} server
             */
            let server;
            /**
             * @type {Express}
             */
            let app = express();
            if (!Config.get('environment.x_powered_by')) {
                app.disable('x-powered-by');
            }

            // set case-sensitive routing
            app.set('case sensitive routing', true);
            RegisterReactEngine(app, {
                viewsDir: [
                    VIEWS_DIR,
                    SRC_VIEWS_DIR
                ]
            });

            if (this.is_ssl) {
                server = https.createServer({key: this.sslKey, cert: this.sslCert}, app)
            } else {
                server = http.createServer(app);
            }
            if (port === 443 || port === 80) {
                debug(
                    'server',
                    sprintf(
                        __('Starting server on %s://%s (%s)'),
                        this.is_ssl ? 'https' : 'http',
                        this.hostname,
                        Config.environment_mode
                    )
                );
            } else {
                debug(
                    'server',
                    sprintf(
                        __('Starting server on %s://%s:%d (%s)'),
                        this.is_ssl ? 'https' : 'http',
                        this.hostname,
                        port,
                        Config.environment_mode
                    )
                );
            }

            this._serverPort = port;
            server
                .listen(port, this.hostname)
                // on fail create
                .once('listening', async (err) => {
                    if (err) {
                        this._express = null;
                        error('server', err);
                        reject(err);
                        return;
                    }

                    if (port === 443 || port === 80) {
                        debug(
                            'server',
                            sprintf(
                                __('Server started on %s://%s (%s)'),
                                this.is_ssl ? 'https' : 'http',
                                this.hostname,
                                Config.environment_mode
                            )
                        );
                    } else {
                        debug(
                            'server',
                            sprintf(
                                __('Server started on %s://%s:%d (%s)'),
                                this.is_ssl ? 'https' : 'http',
                                this.hostname,
                                port,
                                Config.environment_mode
                            )
                        );
                    }

                    if (is_array(this.#registeredRouteScannedId)) {
                        this.#registeredRouteScannedId.forEach((id) => this.router.deleteRoute(id));
                    }
                    let routes = await ScanRouteDirectoryToRouter(this.router);
                    let middlewares = await ScanMiddlewareDirectory(this);
                    this._server = server;
                    this._express = app;
                    if (is_object(routes)) {
                        this.#registeredRouteScannedId = routes;
                    }
                    if (is_array(this.#registeredMiddlewareScannedId)) {
                        for (let id of this.#registeredMiddlewareScannedId) {
                            this._middlewares = this._middlewares.filter((middleware) => middleware.id !== id);
                        }
                    }
                    if (is_object(middlewares)) {
                        this.#registeredMiddlewareScannedId = middlewares;
                    }
                    // sort middlewares by lowest priority number
                    this._middlewares = this._middlewares.sort((a, b) => {
                        let aPriority = a.priority;
                        let bPriority = b.priority;
                        if (aPriority === bPriority) {
                            return 0;
                        }
                        return aPriority > bPriority ? 1 : -1;
                    });
                    this.middlewares.forEach((middleware) => {
                        if (!(middleware instanceof AbstractMiddleware) || !is_function(middleware.dispatch)) {
                            return;
                        }
                        app.use(middleware.dispatch.bind(middleware));
                    });
                    this.router.apply(this);
                    app.use(MiddlewareNotfoundHandler.dispatch);
                    app.use(MiddlewareErrorHandler.dispatch);
                    app.use(MiddlewareGlobalErrorHandler.dispatch);
                    app['application'] = this;
                    Object.defineProperty(app, 'application', {
                        writable: false
                    });
                    resolve(this);
                })
                .setTimeout(this.timeout)
                .on('error', (err) => {
                    error('server', err);
                });
        });
    }
}

export default new Application();
