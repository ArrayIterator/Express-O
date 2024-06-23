import {access, error} from "../Logger.js";
import Config from "../Config.js";
import {is_integer, is_string} from "../../helpers/Is.js";
import ResponseTimeoutException from "../../errors/exceptions/ResponseTimeoutException.js";
import MiddlewareErrorHandler from "./MiddlewareErrorHandler.js";
import MiddlewareGlobalErrorHandler from "./MiddlewareGlobalErrorHandler.js";
import Middleware from "../../abstracts/Middleware.js";

let registered = false;
let lastResponse = null;
let timeout_interval;
const ClearTimeout = () => {
    if (timeout_interval) {
        clearTimeout(timeout_interval);
        timeout_interval = null;
    }
}

class MiddlewareHandler extends Middleware {
    _priority = Number.MIN_SAFE_INTEGER + 100;

    /**
     *  @inheritDoc
     */
    getPriority() {
        return this._priority;
    }

    /**
     * Dispatch the middleware.
     *
     * @param {Request} req
     * @param {Response} res
     * @param {Function} next
     * @return {Promise<unknown>}
     */
    dispatch(req, res, next) {
        lastResponse = res;
        return new Promise(async (resolve) => {
            let logged = false;
            const do_log = () => {
                if (!logged) {
                    ClearTimeout();
                    logged = true;
                    access(res);
                }
            }
            res.on('finish', do_log);
            res.on('close', do_log);
            const app = await import('../Application.js').then((m) => m.default).catch(() => null);
            let timeout = app?.timeout || Config.get('environment.timeout');
            timeout = !is_integer(timeout) ? 30000 : timeout;
            const x_powered_by = Config.get('environment.x_powered_by');
            if (!x_powered_by) {
                res.removeHeader('X-Powered-By');
            } else if (is_string(x_powered_by)) {
                res.setHeader('X-Powered-By', x_powered_by);
            }

            ClearTimeout();
            // set default context type as html
            if (!res.get('Content-Type')) {
                res.setHeader('Content-Type', 'text/html');
            }
            const dispatchGlobalError = (err, _req, res) => {
                MiddlewareGlobalErrorHandler.dispatch(err, _req, res);
                resolve();
            }
            const unhandledRenderer = (err, _req, res) => {
                res = res || lastResponse;
                ClearTimeout();
                if (!res.headersSent) {
                    MiddlewareErrorHandler.dispatch(err, _req)
                        .catch(() => dispatchGlobalError(err, _req, res))
                        .then(() => dispatchGlobalError(err, _req, res));
                } else {
                    dispatchGlobalError(err, _req, res);
                }
            }

            timeout_interval = setTimeout(() => {
                if (timeout_interval) {
                    clearTimeout(timeout_interval);
                    timeout_interval = null;
                }
                unhandledRenderer(new ResponseTimeoutException(), req, res);
            }, timeout - 500);


            const handleRejection = (err) => {
                error('unhandledRejection', err);
                timeout_interval = setTimeout(() => unhandledRenderer(new ResponseTimeoutException(), req), timeout - 500);
                unhandledRenderer(err);
            };
            const handleUncaughtException = (err) => {
                error('uncaughtException', err);
                unhandledRenderer(err);
            };
            try {
                if (!registered) {
                    // process.removeListener('unhandledRejection', handleRejection);
                    // process.removeListener('uncaughtException', handleRejection);
                    process.on('unhandledRejection', handleRejection);
                    process.on('uncaughtException', handleUncaughtException);
                    registered = true;
                }
                // process.once('unhandledRejection', handleRejection);
                // process.once('uncaughtException', handleUncaughtException);
            } catch (err) {
                error('error', err);
            }
            res.on('error', (err) => {
                error('error', err);
            });
            ClearTimeout();
            next();
        });
    }
}

export default new MiddlewareHandler();
