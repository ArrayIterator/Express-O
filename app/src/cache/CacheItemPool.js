// noinspection JSUnusedGlobalSymbols

import {sprintf} from "../helpers/Formatting.js";
import {is_array, is_numeric_integer, is_object, is_promise, is_scalar, is_string} from "../helpers/Is.js";
import CacheItem, {MaxFutureDate} from "./CacheItem.js";
import {intval, strval} from "../helpers/DataType.js";
import CacheRuntimeException from "./Exceptions/CacheRuntimeException.js";
import CacheInvalidArgumentException from "./Exceptions/CacheInvalidArgumentException.js";
import {__} from "../l10n/Translator.js";

/**
 * Using cache like PHP PSR-6
 * @link https://www.php-fig.org/psr/psr-6/
 *
 * @abstract
 */
export default class CacheItemPool {
    /**
     * Namespace
     *
     * @type {string}
     * @private
     */
    #namespace;

    /**
     * Default expiration
     *
     * @type {number}
     * @private
     */
    #defaultLifetime;
    /**
     * Deferred cache items
     *
     * @type {{[key: string]: CacheItem}}
     * @private
     */
    _deferred = {};

    /**
     * CacheItemPool constructor.
     *
     * @param {string} namespace
     * @param {?number} defaultLifetime
     */
    constructor(namespace = '_', defaultLifetime = null) {
        if (!this.isValidNamespace(namespace)) {
            throw new CacheInvalidArgumentException(
                sprintf(__('Invalid namespace: %s'), namespace)
            );
        }
        namespace = namespace || '_'; // _ as default namespace
        defaultLifetime = defaultLifetime === null ? 0 : defaultLifetime;
        defaultLifetime = !is_numeric_integer(defaultLifetime) ? 0 : intval(defaultLifetime);
        defaultLifetime = MaxFutureDate < 0 ? 0 : (defaultLifetime > MaxFutureDate ? defaultLifetime / 1000 : defaultLifetime);
        this.#defaultLifetime = defaultLifetime;
        this.#namespace = namespace;
    }

    /**
     * Default expiration
     *
     * @return {?number}
     */
    get defaultLifetime() {
        return this.#defaultLifetime;
    }

    /**
     * Namespace
     *
     * @return {string}
     */
    get namespace() {
        return this.#namespace;
    }

    /**
     * Get adapter name
     *
     * @return {string}
     */
    get adapterName() {
        return this.getAdapterName();
    }

    /**
     * Check if valid namespace
     *
     * @param namespace
     * @return {boolean}
     */
    isValidNamespace(namespace) {
        return is_string(namespace);
    }

    /**
     * Adapter name
     *
     * @return {string}
     * @abstract
     */
    getAdapterName() {
        const name = this.constructor.name;
        if (/Adapters?$/i.test(name)) {
            return name.toLowerCase().replace(/adapters?$/, '');
        }
        return name;
    }

    /**
     * Confirms if the cache contains specified cache item.
     *
     * Note: This method MAY avoid retrieving the cached value for performance reasons.
     * This could result in a race condition with CacheItem.get(). To avoid
     * such situation use CacheItem.isHit() instead.
     *
     * @param {string} key
     *   The key for which to check existence.
     *
     * @throws {CacheInvalidArgumentException}
     *   If the $key string is not a legal value a CacheInvalidArgumentException
     *   MUST be thrown.
     *
     * @return {Promise<boolean>}
     *   True if item exists in the cache, false otherwise.import RuntimeException from "../errors/exceptions/RuntimeException.js";

     * @abstract
     */
    hasItem(key) {
        return Promise.reject(new CacheRuntimeException(
            sprintf(__('Method %s must be implemented'), 'hasItem')
        ));
    }

    /**
     * Returns a Cache Item representing the specified key.
     *
     * This method must always return a CacheItem object, even in case of
     * a cache miss. It MUST NOT return null.
     *
     * @param {string} key
     *   The key for which to return the corresponding Cache Item.
     *
     * @throws {CacheInvalidArgumentException}
     *   If the $key string is not a legal value a CacheInvalidArgumentException
     *   MUST be thrown.
     *
     * @return {Promise<CacheItem>}
     *   The corresponding Cache Item.
     * @abstract
     */
    getItem(key) {
        return Promise.reject(new CacheRuntimeException(
            sprintf(__('Method %s must be implemented'), 'getItem')
        ));
    }

    /**
     * Returns a traversable set of cache items.
     *
     * @param {string[]} keys
     *   An indexed array of keys of items to retrieve.
     *
     * @throws {CacheInvalidArgumentException}
     *   If any of the keys in keys are not a legal value a CacheInvalidArgumentException
     *   MUST be thrown.
     *
     * @return {Promise<{[key: string|number]: CacheItem}>}
     *   A traversable collection of Cache Items keyed by the cache keys of
     *   each item. A Cache item will be returned for each key, even if that
     *   key is not found. However, if no keys are specified then an empty
     *   traversable MUST be returned instead.
     */
    getItems(keys = []) {
        return new Promise(async (resolve, reject) => {
            keys = is_string(keys) ? [keys] : keys;
            if (is_object(keys)) {
                keys = Object.values(keys);
            }
            if (!is_array(keys)) {
                resolve({});
                return {};
            }
            for (let key of keys) {
                if (!is_scalar(key)) {
                    reject(new CacheInvalidArgumentException(
                        sprintf(__('Invalid key: %s'), key)
                    ));
                    return;
                }
            }
            let items = {};
            keys = Array.from(keys);
            for (let i = 0; i < keys.length; i++) {
                if (!is_string(keys[i])) {
                    keys[i] = strval(keys[i]);
                }
                items[keys[i]] = await this.resultCall(this.getItem(keys[i])).catch(() => new CacheItem(keys[i]));
            }
            resolve(items);
            return items;
        });
    }

    /**
     * Deletes all items in the pool.
     *
     * @return {Promise<boolean>}
     *   True if the pool was successfully cleared. False if there was an error.
     * @abstract
     */
    clear() {
        return new Promise((resolve) => {
            this._deferred = {};
            resolve(false);
            return false;
        });
    }

    /**
     * Removes the item from the pool.
     *
     * @param {string} key
     *   The key to delete.
     *
     * @throws {CacheInvalidArgumentException}
     *   If the $key string is not a legal value a CacheInvalidArgumentException
     *   MUST be thrown.
     *
     * @return {Promise<boolean>}
     *   True if the item was successfully removed. False if there was an error.
     * @abstract
     */
    deleteItem(key) {
        return Promise.reject(new CacheRuntimeException(
            sprintf(__('Method %s must be implemented'), 'deleteItem')
        ));
    }

    /**
     * @template {any} T
     *
     * @param {T|Promise<T>} result
     * @return {Promise<unknown>}
     */
    resultCall(result) {
        return new Promise((resolve, reject) => {
            if (is_promise(result)) {
                return result.then(resolve).catch(reject);
            }
            resolve(result);
            return result;
        })
    }

    /**
     * Removes multiple items from the pool.
     *
     * @param {string[]} keys
     *   An array of keys that should be removed from the pool.
     *
     * @throws {CacheInvalidArgumentException}
     *   If any of the keys in $keys are not a legal value a CacheInvalidArgumentException
     *   MUST be thrown.
     *
     * @return {Promise<boolean>}
     *   True if the items were successfully removed. False if there was an error.
     */
    deleteItems(keys = []) {
        return new Promise(async (resolve, reject) => {
            let result = false;
            keys = is_string(keys) ? [keys] : keys;
            if (is_object(keys)) {
                keys = Object.values(keys);
            }
            if (!is_array(keys)) {
                resolve([]);
                return [];
            }
            for (let key of keys) {
                if (key instanceof CacheItem) {
                    continue;
                }
                if (!is_scalar(key)) {
                    reject(new CacheInvalidArgumentException(
                        sprintf(__('Invalid key: %s'), key)
                    ));
                    return;
                }
            }
            keys = Array.from(keys);
            await Promise
                .all(keys.map(key => this.deleteItem(key)))
                .catch(() => false)
                .then((res) => {
                    for (let r of res) {
                        result = result || r;
                        if (result) {
                            break;
                        }
                    }
                });
            resolve(!!result);
            return !!result;
        });
    }

    /**
     * Persists a cache item immediately.
     *
     * @param {CacheItem} item
     *   The cache item to save.
     *
     * @return {Promise<boolean>}
     *   True if the item was successfully persisted. False if there was an error.
     * @abstract
     */
    save(item) {
        return Promise.reject(new CacheRuntimeException(
            sprintf(__('Method %s must be implemented'), 'save')
        ));
    }

    /**
     * Sets a cache item to be persisted later.
     *
     * @param {CacheItem} item
     *   The cache item to save.
     *
     * @return {Promise<boolean>}
     *   False if the item could not be queued or if a commit was attempted and failed. True otherwise.
     * @abstract
     */
    saveDeferred(item) {
        return new Promise(async (resolve) => {
            if (!(item instanceof CacheItem)) {
                resolve(false);
                return false;
            }
            this._deferred[item.getKey()] = item;
            resolve(true);
            return true;
        });
    }

    /**
     * Persists any deferred cache items.
     *
     * @return {Promise<boolean>}
     *   True if all not-yet-saved items were successfully saved or there were none. False otherwise.
     * @abstract
     */
    commit() {
        return new Promise(async (resolve) => {
            let saved = true;
            await Promise
                .all(Object.values(this._deferred).map(this.save.bind(this)))
                .catch(() => saved = false);
            this._deferred = {};
            resolve(saved);
            return saved;
        });
    }
}
