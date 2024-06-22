export const ALL = 'ALL';
export const GET = 'GET';
export const POST = 'POST';
export const PUT = 'PUT';
export const DELETE = 'DELETE';
export const PATCH = 'PATCH';
export const OPTIONS = 'OPTIONS';
export const HEAD = 'HEAD';
export const CHECKOUT = 'CHECKOUT';
export const COPY = 'COPY';
export const LOCK = 'LOCK';
export const MERGE = 'MERGE';
export const MKCOL = 'MKCOL';
export const MKACTIVITY = 'MKACTIVITY';
export const MOVE = 'MOVE';
export const REPORT = 'REPORT';
export const TRACE = 'TRACE';
export const CONNECT = 'CONNECT';
export const PURGE = 'PURGE';
export const SEARCH = 'SEARCH';
export const UNLOCK = 'UNLOCK';
export const NOTIFY = 'NOTIFY';
export const SUBSCRIBE = 'SUBSCRIBE';
export const UNSUBSCRIBE = 'UNSUBSCRIBE';
export const M_SEARCH = 'M-SEARCH';
export const BIND = 'BIND';
export const UNBIND = 'UNBIND';

/**
 * List of available methods
 *
 * @type {string[]} Available methods
 */
export const AVAILABLE_METHODS = [
    ALL,
    GET,
    POST,
    PUT,
    DELETE,
    PATCH,
    OPTIONS,
    HEAD,
    CHECKOUT,
    COPY,
    LOCK,
    MERGE,
    MKCOL,
    MKACTIVITY,
    MOVE,
    M_SEARCH,
    REPORT,
    TRACE,
    CONNECT,
    PURGE,
    SEARCH,
    UNLOCK,
    NOTIFY,
    SUBSCRIBE,
    UNSUBSCRIBE,
    BIND,
    UNBIND,
];

export default class Methods {
    /**
     * Check if method is valid
     *
     * @param {string} method
     * @return {boolean}
     */
    static isValid(method) {
        return AVAILABLE_METHODS.includes(method);
    }
}
