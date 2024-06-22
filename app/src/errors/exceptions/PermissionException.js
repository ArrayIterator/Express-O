import Exception from "./Exception.js";
import {E_WARNING} from "./ErrorCode.js";
import {__} from "../../l10n/Translator.js";

export default class PermissionException extends Exception {
    constructor(message = __("Permission Denied"), code = E_WARNING, previous = null) {
        message = message || __("Permission Denied");
        super(message, code, previous);
    }
}
