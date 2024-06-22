import Exception from "./Exception.js";
import {E_ERROR} from "./ErrorCode.js";
import {__} from "../../l10n/Translator.js";

export default class RouteException extends Exception {
    constructor(message = __('Route Error'), code = E_ERROR, previous = null) {
        message = message || __("Route Error");
        super(message, code, previous);
    }
}
