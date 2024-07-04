// noinspection JSUnusedGlobalSymbols

import {ServerResponse} from "http";

/**
 * Check if a variable is an integer
 *
 * @param {any} param
 * @return {param is number}
 */
export const is_integer = (param) => is_number(param) && Number.isInteger(param);

/**
 * Check if a variable is a numeric integer
 *
 * @param {any} param
 * @return {param is number}
 */
export const is_numeric_integer = (param) => is_numeric(param) && Number.isInteger(Number(param));

/**
 * Check if a variable is a nan
 *
 * @param {any} param
 * @return {param is number & param is NaN}
 */
export const is_nan = (param) => is_number(param) && Number.isNaN(param);

/**
 * Check if a variable is a float
 *
 * @param {any} param
 * @return {param is number}
 */
export const is_float = (param) => is_number(param) && !Number.isInteger(param);

/**
 * Check if a variable is a number
 *
 * @param {any} param
 * @return {param is string}
 */
export const is_number = (param) => typeof param === "number";

/**
 * Check if a variable is a numeric
 * @param {any} param
 * @return {param is number|param is string}
 */
export const is_numeric = (param) => is_number(param) || is_string(param) && !isNaN(param);

/**
 * Check if a variable is finite
 *
 * @param {any} param
 * @return {param is number & param is !NaN & param is !Infinity}
 */
export const is_finite = (param) => is_number(param) && Number.isFinite(param);
/**
 * Check if a variable is infinite
 *
 * @param {any} param
 * @return {param is Infinity}
 */
export const is_infinite = (param) => is_number(param) && !Number.isFinite(param);

/**
 * Check if a variable is an array
 *
 * @param {any} param
 * @return {param is Array<any>}
 */
export const is_array = (param) => Array.isArray(param);

/**
 * Check if a variable is a string
 *
 * @param {any} param
 * @return {param is string}
 */
export const is_string = (param) => typeof param === "string" || param instanceof String;

/**
 * Check if a variable is a buffer
 *
 * @param {any} param
 * @return {obj is Buffer}
 */
export const is_buffer = (param) => Buffer.isBuffer(param);

/**
 * Check if a variable is a render-able
 *
 * @param param
 * @return {param is string|param is String|param is string|param is Buffer|param is Uint8Array|param is Object&param is !Array<*>&param is !null&param is !undefined|param is Array<*>}
 */
export const is_render_able = (param) => is_renderable_string(param) || is_renderable_object(param);

/**
 *
 * @param param
 * @return {param is Object&param is !Array<*>&param is !null&param is !undefined|param is Array<*>}
 */
export const is_renderable_object = (param) => is_object(param) || is_array(param);

/**
 * Check if a variable is a render-able string
 *
 * @param param
 * @return {param is string|param is String|param is string|param is Buffer|param is Uint8Array}
 */
export const is_renderable_string = (param) => is_string(param) || is_number(param) || is_buffer(param) || is_uint8array(param);

/**
 * Check if param maybe response object
 *
 * @param {any} param
 * @return {param is object & param is ServerResponse}
 */
export const is_maybe_response_object = (param) => is_object(param)
    && param instanceof ServerResponse
    && is_function(param.app)
    && is_function(param.setHeader)
    && is_function(param.send)
    && is_function(param.write)
    && is_function(param.status)
    && is_function(param.type)
    && is_function(param.end);

/**
 * Check if a variable is Uint8Array
 *
 * @param {any} param
 * @return {param is Uint8Array}
 */
export const is_uint8array = (param) => param instanceof Uint8Array;

/**
 * Check if a variable is a scalar
 *
 * @param {any} param
 * @return {param is string|param is number|param is boolean}
 */
export const is_scalar = (param) => is_string(param) || is_number(param) || is_boolean(param);

/**
 * Check if a variable is an object
 *
 * @param {any} param
 * @return {param is Object & param is !Array<any> & param is !null & param is !undefined}
 */
export const is_object = (param) => param && typeof param === "object" && !is_array(param);

/**
 * Check if a variable is a function
 *
 * @param {any} param
 * @return {param is ((...arg?:any) => any) | param is Function}
 */
export const is_function = (param) => param && typeof param === "function";

/**
 * Check if a variable is an async function
 *
 * @param {any} param
 * @return {param is (...arg?:any) => Promise<any>}
 */
export const is_async_function = (param) => is_function(param) && param.constructor.name === "AsyncFunction";

/**
 * Check if a variable is a boolean
 *
 * @param {any} param
 * @return {param is boolean}
 */
export const is_boolean = (param) => typeof param === "boolean";

/**
 * Check if a variable is null
 *
 * @param {any} param
 * @return {param is null}
 */
export const is_null = (param) => param === null;

/**
 * Check if a variable is undefined
 *
 * @param {any} param
 * @return {param is undefined}
 */
export const is_undefined = (param) => param === undefined;

/**
 * Check if a variable is a symbol
 *
 * @param {any} param
 * @return {param is Symbol}
 */
export const is_symbol = (param) => typeof param === "symbol";

/**
 * Check if a variable is a promise
 *
 * @param {any} param
 * @return {param is Promise}
 */
export const is_promise = (param) => param instanceof Promise;

/**
 * Check if a variable is a date
 *
 * @param {any} param
 * @return {param is Date}
 */
export const is_date = (param) => param instanceof Date;

/**
 * Check if a variable is a regexp
 *
 * @param {any} param
 * @return {param is RegExp}
 */
export const is_regexp = (param) => param instanceof RegExp;

/**
 * Check if a variable is an error
 *
 * @param param
 * @return {param is Error}
 */
export const is_error = (param) => param instanceof Error;

/**
 * Check if a variable is a buffer
 *
 * @param param
 * @return {param is Array<*>|param is Function}
 */
export const is_iterable = (param) => is_array(param) || is_object(param) && is_function(param[Symbol.iterator]);

/**
 * Check if a variable is a buffer
 *
 * @param param
 * @return {param is undefined|param is null|param is string|param is number|param is boolean|param is Symbol|param is Function|param is Object}
 */
export const is_empty = (param) => !!((!param && param !== '0') || is_null(param) || is_undefined(param) || is_array(param) && param.length === 0 || is_object(param) && Object.keys(param).length === 0);
