import {is_json_content_type, strval} from "../../helpers/DataType.js";
import express from "express";
import {http_message} from "../../helpers/HttpCode.js";
import {__} from "../../l10n/Translator.js";
import Application from "../../app/Application.js";

const {response, request} = express;

/**
 * @param {request} request
 * @param {response} response
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
