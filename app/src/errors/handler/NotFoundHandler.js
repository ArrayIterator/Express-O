/**
 * @typedef {http.IncomingMessage&Express.Request} Request
 * @typedef {http.OutgoingMessage&Express.Response} Response
 */

import {is_json_content_type} from "../../helpers/DataType.js";
import {http_message} from "../../helpers/HttpCode.js";
import {__} from "../../l10n/Translator.js";
import Application from "../../app/Application.js";

/**
 * @param {Request} request
 * @param {Response} response
 * @constructor
 */
export default function NotFoundHandler(request, response) {
    return new Promise(async (resolve, reject) => {
        response.status(404);
        const isJson = is_json_content_type(response.getHeader('Content-Type')) || is_json_content_type(request.get('Accept'));
        if (isJson) {
            Application
                .jsonObject
                .send(http_message(404, __('Not Found')), 404, response)
                .then(resolve)
                .catch(reject);
        } else {
            response.render('errors/notfound', {
                title: __('Not Found')
            }, (err, html) => {
                if (err) {
                    reject(err);
                    return;
                }
                response.end(html);
                resolve();
            });
        }
    });
}
