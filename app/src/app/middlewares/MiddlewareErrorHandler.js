import HttpException from "../../errors/exceptions/HttpException.js";
import Exception from "../../errors/exceptions/Exception.js";
import {E_ERROR} from "../../errors/exceptions/ErrorCode.js";
import {NOT_FOUND} from "../../helpers/HttpCode.js";
import ErrorHandler from "../../errors/handler/ErrorHandler.js";
import {debug, error} from "../Logger.js";
import {__} from "../../l10n/Translator.js";
import {is_function} from "../../helpers/Is.js";
import app from "../Application.js";
import AbstractMiddleware from "../AbstractMiddleware.js";
import {Error} from "sequelize";

class MiddlewareErrorHandler extends AbstractMiddleware {

    /**
     * @type {number}
     * @private
     */
    _priority = Number.MAX_SAFE_INTEGER - 100;

    /**
     *  @inheritDoc
     */
    getPriority() {
        return this._priority;
    }

    /**
     * Dispatch the error.
     *
     * @param {Error} err
     * @param {Request} request
     * @param {Response} response
     * @param {(err: any) => any} next
     * @return {Promise<unknown>}
     */
    dispatch(err, request, response, next) {
        return new Promise((resolve, reject) => {
            if (!err) {
                resolve();
                next();
                return;
            }
            if (!(err instanceof HttpException)) {
                error('error', err);
                if (!err instanceof Error) {
                    err = new Exception(__('Internal server error'), E_ERROR, err);
                }
                err = new HttpException(err.message, 500, err);
            } else if (err.code === NOT_FOUND && is_function(app.notFoundHandler)) {
                try {
                    let _response = app.notFoundHandler(request, response, next);
                    if (_response instanceof Promise) {
                        _response.then(resolve).catch(() => {
                            ErrorHandler(err, request, response).then(resolve).catch(reject);
                        });
                    } else {
                        resolve();
                    }
                    return;
                } catch (err) {
                    err = new HttpException(err.message, 500, err);
                }
            } else {
                debug('error', err);
            }

            if (!is_function(app.errorHandler)) {
                ErrorHandler(err, request, response).then(resolve).catch(reject);
                return;
            }

            try {
                let _response = app.errorHandler(err, request, response, next);
                if (_response instanceof Promise) {
                    _response.then(resolve).catch(() => {
                        ErrorHandler(err, request, response).then(resolve).catch(reject);
                    });
                } else {
                    resolve();
                }
            } catch (e) {
                ErrorHandler(err, request, response).then(resolve).catch(reject);
            }
        });
    }
}

export default new MiddlewareErrorHandler();
