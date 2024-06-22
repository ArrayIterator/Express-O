// noinspection JSUnusedGlobalSymbols

import AbstractMiddleware from "../src/app/AbstractMiddleware.js";

export default class ExampleMiddleware extends AbstractMiddleware {
    /**
     * @inheritDoc
     */
    dispatch(_request, _response, next) {
        next(); //next() is a function that calls the next middleware in the stack
    }
}
