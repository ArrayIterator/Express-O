// noinspection JSUnusedGlobalSymbols

import Middleware from "../../src/abstracts/Middleware.js";

export default class ExampleMiddlewareTest extends Middleware {
    /**
     * @inheritDoc
     */
    dispatch(_request, _response, next) {
        next(); //next() is a function that calls the next middleware in the stack
    }
}
