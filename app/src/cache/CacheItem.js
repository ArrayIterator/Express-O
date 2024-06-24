import {is_boolean, is_date, is_integer, is_numeric_integer, is_scalar, is_string} from "../helpers/Is.js";
import {intval, strval} from "../helpers/DataType.js";
import {serialize} from "../helpers/Serializer.js";
import CacheRuntimeException from "./Exceptions/CacheRuntimeException.js";
import {__} from "../l10n/Translator.js";
import CacheInvalidArgumentException from "./Exceptions/CacheInvalidArgumentException.js";

/**
 * Maximum future date.
 *
 * @type {number} unix timestamp
 */
export const MaxFutureDate = intval(new Date('2038-01-19T03:14:07+00:00').getTime() / 1000);

/**
 * @readonly {string} key The key of the item in the cache.
 */
export default class CacheItem {

    /**
     * True if the item is hit, false otherwise.
     * @type {boolean}
     * @private
     */
    #isHit;
    /**
     * The value of the item.
     * @type {any}
     * @private
     */
    #value;
    /**
     * The expiration timestamp of an item.
     * @type {number|null}
     *
     * @private
     */
    #expiration;
    /**
     * The default expiration timestamp of an item.
     *
     * @private
     */
    #defaultExpiration = null;

    /**
     * Constructor.
     *
     * @param {string} key
     * @param {any} value
     * @param {boolean} isHit
     * @param {Date|number|null} expiration
     * @param {number|null} defaultExpiration
     */
    constructor(key, value, isHit = false, expiration = null, defaultExpiration = null) {
        key = is_scalar(key) ? strval(key) : key;
        if (!is_string(key)) {
            throw new CacheInvalidArgumentException(
                __('Key must be a string')
            );
        }
        // check if serialize method is overriding by child class
        if (this.serialize !== CacheItem.prototype.serialize) {
            throw new CacheRuntimeException(
                __('Method serialize must not be overridden')
            );
        }
        expiration = is_date(expiration) ? expiration.getTime() : expiration;
        expiration = is_boolean(expiration) || expiration === 0 ? null : expiration;
        expiration = is_numeric_integer(expiration) ? intval(expiration) : expiration;
        if (!is_integer(expiration) && expiration !== null) {
            throw new TypeError('Expiration must be an integer');
        }
        this.#isHit = !!isHit;
        this.key = key;
        this.value = value;
        this.expiresAt(expiration);
        if (defaultExpiration !== null) {
            this.#defaultExpiration = defaultExpiration;
        }
        Object.defineProperty(this, 'key', {
            value: key,
            writable: false,
        });
    }

    /**
     * Returns the value of the item.
     *
     * @return {any}
     */
    get value() {
        return this.#value;
    }

    /**
     * Set the value of the item.
     *
     * @param {any} value
     */
    set value(value) {
        this.set(value)
    }

    /**
     * Returns the expiration timestamp of an item.
     *
     * @return {number|null}
     */
    get expiration() {
        return this.getExpiration();
    }

    /**
     * Returns the default expiration time.
     *
     * @return {number|null}
     */
    get defaultExpiration() {
        return this.#defaultExpiration;
    }

    /**
     * Returns the expiration timestamp of an item.
     *
     * @return {number|null}
     */
    getExpiration() {
        return this.#expiration;
    }

    /**
     * Returns the key for the current cache item.
     *
     * The key is loaded by the Implementing Library, but should be available to
     * the higher level callers when needed.
     *
     * @return {string}
     *   The key string for this cache item.
     */
    getKey() {
        return this.key;
    }

    /**
     * Retrieves the value of the item from the cache associated with this object's key.
     *
     * The value returned must be identical to the value originally stored by set().
     *
     * If isHit() returns false, this method MUST return null. Note that null
     * is a legitimate-cached value, so the isHit() method SHOULD be used to
     * differentiate between "null value was found" and "no value was found."
     *
     * @return {any}
     *   The value corresponding to this cache item's key, or null if not found.
     */
    get() {
        return this.getValue();
    }

    /**
     * Retrieves the value of the item from the cache associated with this object's key.
     *
     * The value returned must be identical to the value originally stored by set().
     *
     * If isHit() returns false, this method MUST return null. Note that null
     * is a legitimate-cached value, so the isHit() method SHOULD be used to
     * differentiate between "null value was found" and "no value was found."
     *
     * @return {any}
     *   The value corresponding to this cache item's key, or null if not found.
     */
    getValue() {
        return this.value;
    }

    /**
     * Confirms if the cache item lookup resulted in a cache hit.
     *
     * Note: This method MUST NOT have a race condition between calling isHit()
     * and calling get().
     *
     * @return bool
     *   True if the request resulted in a cache hit. False otherwise.
     */
    isHit() {
        return this.#isHit;
    }

    /**
     * Sets the value represented by this cache item.
     *
     * The $value argument may be any item that can be serialized by PHP,
     * although the method of serialization is left up to the Implementing
     * Library.
     *
     * @param {any} value
     *   The serializable value to be stored.
     *
     * @return {this}
     *   The invoked object.
     */
    set(value) {
        return this.setValue(value)
    }

    /**
     * Sets the value represented by this cache item.
     *
     * The $value argument may be any item that can be serialized by PHP,
     * although the method of serialization is left up to the Implementing
     * Library.
     *
     * @param {any} value
     *   The serializable value to be stored.
     *
     * @return {this}
     *   The invoked object.
     */
    setValue(value) {
        this.#value = value;
        return this;
    }

    /**
     * Sets the expiration time for this cache item.
     *
     * @param {Date|null} expiration
     *   The point in time after which the item MUST be considered expired.
     *   If null is passed explicitly, a default value MAY be used. If none is set,
     *   the value should be stored permanently or for as long as the
     *   implementation allows.
     *
     * @return {this}
     *   The called object.
     */
    expiresAt(expiration) {
        expiration = is_numeric_integer(expiration) ? intval(expiration) : (
            is_date(expiration) ? expiration.getTime() : expiration
        );
        if (!is_integer(expiration)) {
            this.#expiration = this.defaultExpiration;
            return this;
        }
        if (MaxFutureDate < expiration) {
            expiration = expiration / 1000;
        }
        this.#expiration = expiration;
    }

    /**
     * Sets the expiration time for this cache item.
     *
     * @param {number|null} time
     *   The period of time from the present after which the item MUST be considered
     *   expired. An integer parameter is understood to be the time in seconds until
     *   expiration. If null is passed explicitly, a default value MAY be used.
     *   If none is set, the value should be stored permanently or for as long as the
     *   implementation allows.
     *
     * @return {this}
     *   The called object.
     */
    expiresAfter(time) {
        if (time === undefined) {
            return this;
        }
        if (time === null || is_date(time)) {
            return this.expiresAt(time);
        }
        if (!is_integer(time)) {
            this.#expiration = this.defaultExpiration;
            return this;
        }
        if (time === 0) {
            this.#expiration = null;
            return this;
        }
        this.#expiration = Date.now() / 1000 - time;
        return this;
    }

    /**
     * Serialize
     *
     * @return {string}
     */
    serialize() {
        return serialize({
            key: this.getKey(),
            value: this.get(),
            hit: this.isHit(),
            expiration: this.expiration,
        });
    }
}
