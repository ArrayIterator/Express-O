import Exception from "./Exception.js";
import {E_WARNING} from "./ErrorCode.js";
import {__} from "../../l10n/Translator.js";

export default class FileNotFoundException extends Exception {
    /**
     * Constructor
     *
     * @param {string} message Error message
     * @param {number} error_code Error code
     * @param {?Error} previous Previous error
     */
    constructor(message = __('File Not Found'), error_code = E_WARNING, previous = null) {
        message = message || __("File not found");
        super(message, error_code, previous);
    }
}