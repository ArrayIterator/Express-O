// noinspection JSUnusedGlobalSymbols

import Crypto from 'crypto';
import {is_boolean, is_empty, is_infinite, is_nan, is_numeric, is_string} from "./Is.js";

/**
 * Convert any to string
 *
 * @param {any} param
 * @returns {string} Infinity and Name is always empty
 */
export const strval = (param) => {
    if (typeof param === 'number') {
        return param.toString();
    }
    if (is_boolean(param)) {
        return param ? '1' : '0';
    }
    if (is_empty(param) || is_nan(param) || is_infinite(param)) {
        return '';
    }
    if (is_string(param)) {
        return param;
    }
    try {
        return param.toString();
    } catch (e) {
        return '';
    }
}

/**
 * Convert any to integer
 *
 * @param {any} param
 * @returns {number} 0 if not numeric
 */
export const intval = (param) => {
    try {
        return parseInt(param.toString()) || 0;
    } catch (e) {
        return 0;
    }
}
/**
 * Convert any to float
 *
 * @param {any} param any
 * @returns {number} 0 if not numeric
 */
export const floatval = (param) => {
    try {
        return parseFloat(param.toString()) || parseFloat('0');
    } catch (e) {
        return parseFloat('0')
    }
}

/**
 * Convert string to integer signed ascii
 *
 * @param {any} param
 * @returns {number} 0 if not numeric
 */
export const integer_signed_ascii = (param) => {
    if (!is_numeric(param)) {
        return 0;
    }
    const val = intval(param) % 256;
    return (val < 0 ? 256 + val : val) % 256;
}

/**
 * Convert string to integer unsigned ascii
 *
 * @param {any} param any
 * @returns {number} 0 if not numeric
 */
export const integer_unsigned_ascii = (param) => {
    if (!is_numeric(param)) {
        return 0;
    }
    const res = intval(param) % 256;
    return res === -0 ? 0 : res;
}

/**
 * Convert string to binary string
 *
 * @param {any|number|string} param if numeric convert to integer, or invalid number or empty is 0
 * @returns {string} represent as binary string (1 & 0)
 */
export const binary_number = (param) => {
    let pad = '0';
    let n = intval(param);
    if (n < 1) {
        n = Number.MAX_SAFE_INTEGER + n + 1;
        pad = 1;
    }

    n = n === 0 ? '0' : n.toString(2).padStart(64, pad).replace(/^0+/g, '');
    return n || '0';
}

/**
 * Pad a string to a certain length with another string
 *
 * @param {any} input
 * @param {number} pad_length
 * @param {string} pad_string
 * @param {"STR_PAD_RIGHT"|"STR_PAD_LEFT"|"STR_PAD_BOTH"} pad_type
 * @returns {string}
 */
export const str_pad = (input, pad_length, pad_string = ' ', pad_type = 'STR_PAD_RIGHT') => {
    input = strval(input);
    pad_length = intval(pad_length);
    if (is_empty(input) || pad_length <= 0) {
        return input;
    }
    if (pad_type === 'STR_PAD_BOTH') {
        const half = Math.floor((pad_length - input.length) / 2);
        return input.padStart(half + input.length, pad_string).padEnd(pad_length, pad_string);
    }
    if (pad_type === 'STR_PAD_LEFT') {
        return input.padStart(pad_length, pad_string);
    }
    return input.padEnd(pad_length, pad_string);
}

/**
 * Binary to hex
 *
 * @param {ArrayBuffer|Uint8Array|string|String} param
 * @returns {string}
 */
export const bin2hex = (param) => {
    param = param instanceof ArrayBuffer ? new Uint8Array(param) : param;
    try {
        const bytes = param instanceof Uint8Array ? param : (new TextEncoder()).encode(param);
        const hex = [];
        for (let byte of bytes) {
            hex.push(byte.toString(16).padStart(2, '0'));
        }
        return hex.join('');
    } catch (err) {
        return '';
    }
}

/**
 * Hex to binary
 *
 * @param {string|String} param
 * @returns {string|boolean}
 */
export const hex2bin = (param) => {
    param = strval(param);
    const ret = []
    let i = 0
    let l
    param += '';
    for (l = param.length; i < l; i += 2) {
        const c = parseInt(param.substring(i, 1), 16)
        const k = parseInt(param.substring(i + 1, 1), 16)
        if (isNaN(c) || isNaN(k)) {
            return false;
        }
        ret.push((c << 4) | k)
    }

    return String.fromCharCode.apply(String, ret)
}

/**
 * Check if content type is json
 *
 * @param {any} param
 *
 * @return {param is string}
 */
export const is_json_content_type = (param) => {
    return is_string(param) && /^[^\/]+\/(?:.+)?json/.test(param.toLowerCase());
}

/**
 * Encode 64
 *
 * @param {Buffer|string|Uint8Array} param
 * @return {string}
 */
export const base64_encode = (param) => {
    return Buffer.from(strval(param)).toString('base64');
}

/**
 * Decode 64
 *
 * @param {string|Buffer|Uint8Array} param
 * @return {string}
 */
export const base64_decode = (param) => {
    return Buffer.from(strval(param), 'base64').toString();
}

/**
 * Generate random bytes
 *
 * @param {number} length
 * @return {string}
 */
export const random_bytes = (length) => {
    length = intval(length);
    return Crypto.randomBytes(length).toString('binary');
}

/**
 * Generate random bytes hex
 *
 * @param {number} length
 * @return {string}
 */
export const random_bytes_hex = (length) => {
    length = intval(length);
    return Crypto.randomBytes(length).toString('hex');
}

/**
 * Generate random bytes base64
 *
 * @param {number} length
 * @return {string}
 */
export const random_bytes_base64 = (length) => {
    length = intval(length);
    return Crypto.randomBytes(length).toString('base64');
}

/**
 * Generate random int
 *
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export const random_int = (min, max) => {
    min = intval(min);
    max = intval(max);
    if (min > max) {
        [min, max] = [max, min];
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Filter content type for common usage only
 *
 * @param {any} content_type
 * @return {?string}
 */
export const filter_content_type = (content_type) => {
    if (!is_string(content_type)) {
        return null;
    }
    content_type = content_type.trim();
    const match = content_type.match(/^([^\/]+)(?:\/([^;]+)\s*(?:;\s*(\S.*))?)?$/);
    if (!match) {
        return null;
    }
    let [_, type, subtype] = match;
    if (!subtype || !type) {
        type = type || subtype;
        switch (type.toLowerCase()) {
            case 'json':
                return 'application/json';
            case 'xml':
                return 'application/xml';
            case 'html':
                return 'text/html';
            case 'audio':
                return 'audio/basic';
            case 'image':
            case 'png':
                return 'image/png';
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'gif':
                return 'image/gif';
            case 'bmp':
                return 'image/bmp';
            case 'tiff':
                return 'image/tiff';
            case 'webp':
                return 'image/webp';
            case 'svg':
                return 'image/svg+xml';
            case 'ico':
            case 'icon':
            case 'x-icon':
            case 'favicon':
                return 'image/x-icon';
            case 'ini':
            case 'text':
            case 'plain':
            case 'txt':
            case 'asc':
            case 'log':
                return 'text/plain';
            case 'video':
                return 'video/mpeg';
            case 'mp4':
                return 'video/mp4';
            case 'css':
            case 'style':
                return 'text/css';
            case 'js':
            case 'javascript':
                return 'text/javascript';
            case 'form':
            case 'urlencoded':
                return 'application/x-www-form-urlencoded';
            case 'multipart':
                return 'multipart/form-data';
            case 'jar':
                return 'application/java-archive';
            case 'pdf':
                return 'application/pdf';
            case 'psd':
                return 'image/vnd.adobe.photoshop';
            case 'zip':
            case 'x-zip':
                return 'application/zip';
            case 'gzip':
                return 'application/gzip';
            case 'tar':
                return 'application/x-tar';
            case '7z':
                return 'application/x-7z-compressed';
            case 'rar':
                return 'application/vnd.rar';
            case 'bz2':
                return 'application/x-bzip2';
            case 'xz':
                return 'application/x-xz';
            case 'exe':
                return 'application/x-msdownload';
            case 'doc':
            case 'docx':
                return 'application/msword';
            case 'odt':
                return 'application/vnd.oasis.opendocument.text';
            case 'ods':
                return 'application/vnd.oasis.opendocument.spreadsheet';
            case 'odp':
                return 'application/vnd.oasis.opendocument.presentation';
            case 'odg':
                return 'application/vnd.oasis.opendocument.graphics';
            case 'xls':
            case 'xlsx':
                return 'application/vnd.ms-excel';
            case 'xslt':
                return 'application/xslt+xml';
            case 'xsd':
                return 'application/xml-dtd';
            case 'ppt':
            case 'pptx':
                return 'application/vnd.ms-powerpoint';
            case 'rtf':
                return 'application/rtf';
            case 'yaml':
            case 'yml':
                return 'application/yaml';
            case 'csv':
                return 'text/csv';
            case 'tsv':
                return 'text/tab-separated-values';
            case 'jsonld':
                return 'application/ld+json';
            case 'rdf':
                return 'application/rdf+xml';
            case 'rss':
            case 'rss2':
                return 'application/rss+xml';
            case 'atom':
                return 'application/atom+xml';
            case 'soap':
                return 'application/soap+xml';
            case 'php':
                return 'application/x-httpd-php';
            case 'application':
                return 'application/octet-stream';
            default:
                if (/htm/.test(type)) {
                    return 'text/html';
                }
                if (/xml/.test(type)) {
                    return 'application/xml';
                }
                if (/json/.test(type)) {
                    return 'application/json';
                }
                if (/plain|te?xt/.test(type)) {
                    return 'text/plain';
                }
                return 'application/octet-stream';
        }
    }
    return content_type.toLowerCase();
}
