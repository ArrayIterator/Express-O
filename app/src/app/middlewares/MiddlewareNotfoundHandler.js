import NotFoundHandler from "../../errors/handler/NotFoundHandler.js";
import {is_function, is_promise} from "../../helpers/Is.js";
import application from "../Application.js";
import Middleware from "../../abstracts/Middleware.js";

/**
 * @typedef {http.IncomingMessage&Express.Request} Request
 * @typedef {http.OutgoingMessage&Express.Response} Response
 */
class MiddlewareNotfoundHandler extends Middleware {
    _priority = Number.MAX_SAFE_INTEGER - 100;

    /**
     * Dispatch the middleware.
     *
     * @param {Request} req
     * @param {Response} res
     * @param {Function} next
     * @return {Promise<unknown>}
     */
    dispatch(req, res, next) {
        return new Promise(async (resolve, reject) => {
            if (is_function(application.notFoundHandler)) {
                try {
                    let response = application.notFoundHandler(req, res, next);
                    if (is_promise(response)) {
                        response.then(resolve).catch(reject);
                        return;
                    }
                    resolve();
                } catch (err) {
                    reject(err);
                }
            } else {
                NotFoundHandler(req, res).then(resolve).catch(reject);
            }
        });
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

export default new MiddlewareNotfoundHandler();
