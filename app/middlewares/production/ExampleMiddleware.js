// noinspection JSUnusedGlobalSymbols

import Middleware from "../../src/abstracts/Middleware.js";

/**
 * @extends Middleware
 */
export default class ExampleMiddleware extends Middleware {
    /**
     * @inheritDoc
     */
    dispatch(_request, _response, next) {
        next(); //next() is a function that calls the next middleware in the stack
    }
}
