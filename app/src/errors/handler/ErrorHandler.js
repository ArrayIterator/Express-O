/**
 * @typedef {http.IncomingMessage&Express.Request} Request
 * @typedef {http.OutgoingMessage&Express.Response} Response
 */

import Exception from "../exceptions/Exception.js";
import {E_ERROR} from "../exceptions/ErrorCode.js";
import HttpException from "../exceptions/HttpException.js";
import NotFoundHandler from "./NotFoundHandler.js";
import Config from "../../app/Config.js";
import {http_message} from "../../helpers/HttpCode.js";
import {is_json_content_type} from "../../helpers/DataType.js";
import {__} from "../../l10n/Translator.js";
import Application from "../../app/Application.js";

/**
 * Error handler
 *
 * @param {Error} err Error object
 * @param {Request} request Request object
 * @param {Response} response Response object
 * @param _next
 */
export default function ErrorHandler(err, request, response, _next) {
    return new Promise((resolve, reject) => {
        if (!(err instanceof HttpException)) {
            if (!err instanceof Error) {
                err = new Exception(__('Internal server error'), E_ERROR, err);
            }
            err = new HttpException(err.message, 500, err)
        }
        let code = err.code;
        if (code < 400 || code >= 600) {
            code = 500;
        }
        if (code === 404) {
            NotFoundHandler(request, response).then(resolve).catch(reject);
            return;
        }
        response.status(code);
        const isJson = is_json_content_type(response.getHeader('Content-Type'))
            || is_json_content_type(request.get('Accept'));
        /**
         * @type {HttpException} error
         */
        if (isJson) {
            let message = {
                code,
                message: err.message,
            };
            if (!Config.is_production) {
                message.stack = err.stack;
            }
            Application.jsonObject.send(message, code, response).then(resolve).catch(reject);
        } else {
            response.render('errors/error', {
                title: http_message(code, __('Internal server error')),
                error: err,
            }, function (err, html) {
                if (err) {
                    reject(err);
                } else {
                    response.end(html);
                    resolve();
                }
            });
        }
    });
}
