// noinspection JSUnusedGlobalSymbols

import {bin2hex, binary_number, floatval, integer_signed_ascii, intval, str_pad, strval} from "./DataType.js";
import {is_array, is_iterable, is_object} from "./Is.js";

/**
 * Format string
 *
 * @param {string} text Text to format
 * @param args
 * @returns {string}
 */
export const sprintf = (text, ...args) => {
    text = strval(text);
    if (text === '') {
        return "";
    }
    args = Object.values(args);
    let i = 0;
    const padRight = (e) => str_pad(floatval(e), 4, '0', 'STR_PAD_RIGHT');
    const callback = {
        "d": intval,
        "b": binary_number,
        "F": padRight,
        "f": padRight,
        "x": (e) => bin2hex(e).toLowerCase(),
        "X": (e) => bin2hex(e).toUpperCase(),
        "c": integer_signed_ascii
    };
    return text.replace(
        /%([%sdbFfxXc])/g,
        function (m) {
            if (m[1] === '%') {
                return '%';
            }
            const k = i;
            i++
            const val = args.length > k ? args[k] : '';
            return callback[m[1]] ? callback[m[1]](val) : val;
        }
    );
}

/**
 * Format string with array or object
 * @param {string} text
 * @param {any|Array} args
 * @returns {string}
 */
export const vsprintf = (text, args) => {
    if (!is_object(args) && !is_array(args) && !is_iterable(args)) {
        return text;
    }
    args = Object.values(args);
    return sprintf(text, ...args);
}

/**
 * Uppercase first character
 *
 * @param {string} text
 * @return {string}
 */
export const ucfirst = (text) => {
    text = strval(text);
    return text.charAt(0).toUpperCase() + text.slice(1);
}
/**
 * Lowercase first character
 *
 * @param {string} text
 * @return {string}
 */
export const lcfirst = (text) => {
    text = strval(text);
    return text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * Uppercase words
 *
 * @param {string} text
 * @return {string}
 */
export const ucwords = (text) => {
    text = strval(text);
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
}
