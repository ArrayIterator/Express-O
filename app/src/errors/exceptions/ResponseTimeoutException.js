import HttpException from "./HttpException.js";
import {__} from "../../l10n/Translator.js";

export default class ResponseTimeoutException extends HttpException {
    constructor(message = __('Request Timeout'), previous = null) {
        super(408, message, previous);
    }
}
