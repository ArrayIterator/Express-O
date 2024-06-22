import AbstractRoute from "../src/router/AbstractRoute.js";
import {ALL} from "../src/router/Methods.js";
import {md5} from "../src/helpers/Hash.js";
import {strval} from "../src/helpers/DataType.js";

const modifiedSince = new Date();
modifiedSince.setMilliseconds(0);
export default class FaviconRoute extends AbstractRoute {

    name = 'favicon';

    path = /^\/*favicon\.ico$/;

    methods = [ALL];


    /**
     * @inheritDoc
     */
    dispatch(_request, _response, _next) {
        this.setContentType('image/x-icon');
        const favicon = 'AAABAAEAEBAAAAAAAABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAAAEAAAAAAAAAAAAAAAEAAAAAAAD///8A';
        const etag = md5(favicon + modifiedSince.toUTCString());
        // check about modified so, it wil return 304
        const modified = strval(_request.get('If-Modified-Since'));
        try {
            if (modified && new Date(modified).getTime() >= modifiedSince.getTime()) {
                _response.statusCode = 304;
                return '';
            }
        } catch (err) {
            // pass
        }
        _response.setHeader('Etag', etag);
        // add cache control
        _response.setHeader('Cache-Control', 'public, max-age=31536000');
        _response.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
        _response.setHeader('Last-Modified', modifiedSince.toUTCString());
        return Buffer.from(
            favicon,
            'base64'
        );
    }
}